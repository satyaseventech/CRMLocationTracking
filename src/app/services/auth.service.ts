import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginApiUrl = `${environment.apiBaseUrl}/auth/login`;
  private logoutApiUrl = `${environment.apiBaseUrl}/auth/logout`;
  

  constructor(private http: HttpClient) { }

  // 🔹 Helper method to get headers with auth token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Accept: 'application/json',
      Authorization: token ? token : '',
    });
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    localStorage.removeItem('token');
    return this.http.post<any>(this.loginApiUrl, credentials);
  }
  
  logout(userId: string, token: string, location: any) {
    return this.http.post<any>(this.logoutApiUrl, {
      userId, 
      token, 
      location: location ?? null
    });
  }

  getPrivacyPolicy(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/shared/privacypolicy`);
  }
  
  getTermsOfUse(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/shared/termsofuse`);
  }  

  // 🔹 Punch In API
  punchIn(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/shared/punch-in`, {
      headers: this.getAuthHeaders(),
    });
  }
  // 🔹 Punch Out API
  punchOut(id: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/shared/punch-out/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
