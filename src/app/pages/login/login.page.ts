import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginPageForm } from './login.page.form';
import { AuthService } from '../../services/auth.service';
import { ModalController } from '@ionic/angular';
import { PolicyModalPage } from '../policy-modal/policy-modal.page';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  form!: FormGroup; 
  invalidUser: boolean = false;
  invalidPassword: boolean = false;
  isError: boolean = false;
  appVersion: string = "1.0.0";
  private jwtHelper = new JwtHelperService();

  constructor(
    private router: Router,
    private fromBuilder: FormBuilder,
    private authService: AuthService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    console.log("✅ Login Page Loaded");
    this.validateSession();
    this.form = new LoginPageForm(this.fromBuilder).createForm();

    // Delay session validation to prevent instant redirects
    // setTimeout(() => this.validateSession(), 500);
  }

  validateSession() {
    console.log("Here inside validate session");
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('⚠️ No token found! User must log in.');
      return; // Stay on login page
    }

    console.log(`🟢 Token found: ${token.substring(0, 20)}...`); // Debugging only

    if (!this.jwtHelper.isTokenExpired(token)) {
      console.log('✅ Session active. Redirecting to Track Location...');
      
      this.router.navigate(['/track-location'], { replaceUrl: true }).then(() => {
        window.location.reload(); // Ensure UI updates correctly
      });

    } else {
      console.log('❌ Token expired! Redirecting to login...');
      this.logoutFromSession();
    }
  }

  logoutFromSession() {
    localStorage.removeItem('token');
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  login() {  
    if (!this.form.valid) {
      console.warn("❌ Form validation failed");
      return;
    }
  
    const credentials = {
      email: this.form.get('email')?.value.trim(),
      password: this.form.get('password')?.value.trim()
    };
  
    this.authService.login(credentials).subscribe({
      next: (response: any) => {
        if (!response || !response.token || !response.userId) {
          console.error("❌ Unexpected API response:", response);
          return;
        }
  
        // Store user details in localStorage
        localStorage.setItem("username", response.username);
        localStorage.setItem("loggedInUserId", response.userId);
        localStorage.setItem("token", response.token);
  
        console.log("✅ Login Successful! Redirecting...");
        this.router.navigate(['/track-location'], { replaceUrl: true }).then(() => {
          window.location.reload(); // Ensure page reloads properly
        });
      },
      error: (error: any) => {
        console.error("❌ Login error:", error);
        let errorMessage = "❌ Login failed: ";
        if (error.error) {
          switch (error.error.status) {
            case 401:
              this.invalidPassword = true;
              errorMessage += "Invalid password (401)";
              break;
            case 404:
              this.invalidUser = true;
              errorMessage += "User not found (404)";
              break;
            default:
              errorMessage += JSON.stringify(error.error);
          }
        } else {
          errorMessage += "Unknown error occurred.";
        }
  
        alert(errorMessage);
      }
    });
  }  

  async openPolicy(type: 'privacy' | 'terms') {
    let title = type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions';
    
    const policyContent = await (type === 'privacy' 
      ? this.authService.getPrivacyPolicy().toPromise()
      : this.authService.getTermsOfUse().toPromise());

    const modal = await this.modalCtrl.create({
      component: PolicyModalPage,
      componentProps: {
        title: title,
        content: policyContent?.data || 'Content not available'
      }
    });

    await modal.present();
  }
}
