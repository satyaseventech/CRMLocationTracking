import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import BackgroundGeolocation from "cordova-background-geolocation-lt";
import { Device } from '@awesome-cordova-plugins/device';
import { AlertController, ToastController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-track-location',
  templateUrl: './track-location.page.html',
  styleUrls: ['./track-location.page.scss'],
})
export class TrackLocationPage implements OnInit {
  isTracking = false;
  settingsOpen = false;
  username = localStorage.getItem('username') || 'User';
  appVersion = '1.0.0';
  punchText: string = 'Punch In';

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private platform: Platform,
    private zone: NgZone
  ) {}

  async ngOnInit() {
    await this.requestPermission();

    // ✅ Restore punch-in state
    const isPunchedIn = localStorage.getItem('punchin') === 'true';
    this.punchText = isPunchedIn ? 'Punch Out' : 'Punch In';

    setTimeout(() => {
      const punchButton = document.querySelector('.punch-button');
      if (punchButton) {
        punchButton.classList.remove('punch-in', 'punch-out');
        punchButton.classList.add(isPunchedIn ? 'punch-out' : 'punch-in');
      }
    }, 0);

    // ✅ Restore tracking state
    BackgroundGeolocation.getState().then(state => {
      this.isTracking = state.enabled;
      localStorage.setItem('isTracking', String(this.isTracking));

      // ✅ If schedule exists, ensure tracking starts automatically
      if (Array.isArray(state.schedule) && state.schedule.length > 0) {
        console.log('📅 Ensuring Scheduled Tracking Starts...');
        BackgroundGeolocation.startSchedule();
      }
    });

    // ✅ Auto restart tracking if app was killed
    BackgroundGeolocation.onEnabledChange((enabled) => {
      console.log('[🟢 Tracking Enabled Change]', enabled);
      this.zone.run(() => { this.isTracking = enabled; });
      localStorage.setItem('isTracking', String(enabled));
    });
  }

  toggleSettings() {
    this.settingsOpen = !this.settingsOpen;
  }

  async requestPermission() {
    if (!BackgroundGeolocation) {
      alert('BackgroundGeolocation plugin is not available.');
      return;
    }

    try {
      const result = await BackgroundGeolocation.requestPermission();
      console.log('✅ Permission result:', result);
      alert('✅ Location permission granted');
    } catch (error) {
      console.error('❌ Permission request error:', error);
    }
  }

  isNative(): boolean {
    return typeof window !== 'undefined' && (window as any).cordova !== undefined;
  }

  async toggleTracking() {
    if (!this.isNative()) {
      alert('Background Geolocation only works on mobile devices.');
      return;
    }
  
    this.isTracking = !this.isTracking;
    localStorage.setItem('isTracking', String(this.isTracking));
  
    if (this.isTracking) {
      await this.startTracking();
    } else {
      await this.stopTracking();
    }
  }

  async startTracking() {
    try {
      if (!this.isNative()) {
        alert('Background Geolocation only works on mobile devices.');
        return;
      }
  
      let deviceDetails = {
        uuid: Device.uuid || 'N/A',
        model: Device.model || 'N/A',
        manufacturer: Device.manufacturer || 'N/A',
        platform: Device.platform || 'N/A',
        version: Device.version || 'N/A'
      };
  
      // ✅ Track when tracking is enabled/disabled
      BackgroundGeolocation.onEnabledChange(enabled => {
        console.log('[📡 Enable Change] - ', enabled);
        localStorage.setItem('isTracking', String(enabled));
        this.isTracking = enabled;
      });
  
      // ✅ Detect location updates
      BackgroundGeolocation.onLocation(location => {
        console.log('[📍 Location] - ', location);
      });
  
      // ✅ Detect motion change (if user starts/stops moving)
      BackgroundGeolocation.onMotionChange(event => {
        console.log('[🚶 Motion Change] - ', event.isMoving, event.location);
        this.isTracking = event.isMoving;
        localStorage.setItem('isTracking', String(event.isMoving));
      });
  
      BackgroundGeolocation.onHttp(response => {
        console.log('[📡 HTTP Sync] - ', response.success, response.status, response.responseText);
      });
  
      BackgroundGeolocation.onProviderChange(event => {
        console.log('[🛰 Provider Change] - ', event.enabled, event.status, event.gps);
      });
  
      BackgroundGeolocation.onActivityChange(event => {
        console.log(`🏃 Activity Changed: ${event.activity} (Confidence: ${event.confidence}%)`);
  
        if (event.confidence >= 50) {
          localStorage.setItem('userActivity', event.activity);
        } else {
          console.warn("⚠️ Low confidence, ignoring update");
        }
      });
  
      BackgroundGeolocation.ready({
        reset: false,
        debug: false,
        logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        distanceFilter: 3,
        url: `${environment.apiBaseUrl}/users/sendLocation`,
        schedule: [
          "2-6 09:00-18:00",  // ✅ Monday to Saturday, 9 AM - 6 PM
        ],
        scheduleUseAlarmManager: true, // ✅ Ensure schedule runs in background  
        stopOnTerminate: false,  // ✅ Keeps tracking after app is killed
        startOnBoot: true,  // ✅ Auto-start tracking on device boot
        enableHeadless: true,  // ✅ Runs even if app is closed
        autoSync: true,  // ✅ Sync locations automatically when online
        heartbeatInterval: 60,  // ✅ Ensures tracking continues if app is idle
        activityRecognitionInterval: 2000,  // ✅ Frequent activity updates (every 2 sec)
        geofenceModeHighAccuracy: true,  // ✅ More accurate activity detection
        persistMode: BackgroundGeolocation.PERSIST_MODE_ALL,  // ✅ Saves data if offline
        foregroundService: true,
        backgroundPermissionRationale: {
          title: "Allow Konspec Location Tracking to access your location always.",
          message: "This app collects location data to track your movements even when the app is closed.",
          positiveAction: "Allow Always",
          negativeAction: "Cancel"
        },
        notification: {
          title: "Konspec Location Tracking",
          text: "Tracking location in the background",
          channelName: "Location Tracking",
          smallIcon: "mipmap/ic_launcher",
          priority: BackgroundGeolocation.NOTIFICATION_PRIORITY_HIGH,
          sticky: true,
        },
        headers: {
          'Authorization': localStorage.getItem("token") || '' 
        },
        params: {
          userId: localStorage.getItem("loggedInUserId") || 'unknown',
          device: deviceDetails,
          activity: localStorage.getItem('userActivity') || 'unknown',
          speed: localStorage.getItem('userSpeed') || '0'
        }
      }).then((state) => {
        console.log('✅ Background Geolocation configured');
        if (!state.enabled) {
          console.log('📌 Starting Background Geolocation...');
          BackgroundGeolocation.start();
        }
        if (Array.isArray(state.schedule) && state.schedule.length > 0) {
          console.log('📅 Starting Scheduled Tracking...');
          BackgroundGeolocation.startSchedule();  // ✅ No 'await' needed
        }
        
      });
  
    } catch (error) {
      console.error('❌ Error starting tracking:', error);
    }
  }
  


  async stopTracking() {
    try {
      await BackgroundGeolocation.stop();
      console.log('❌ Background Geolocation stopped.');
    } catch (error) {
      console.error('❌ Error stopping tracking:', error);
    }
  }

  logout() {
    this.stopTracking();
    this.punchOut();

    const userId = localStorage.getItem("loggedInUserId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      console.warn("⚠️ Missing credentials, redirecting to login.");
      this.router.navigate(['/login']);
      return;
    }

    this.authService.logout(userId, token, {}).subscribe({
      next: () => {
        console.log("✅ Logout successful!");

        // Clear user session
        localStorage.removeItem("loggedInUserId");
        localStorage.removeItem("token");

        // Redirect to login
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error("❌ Logout error:", error);
        alert("Logout failed. Please try again.");
      }
    });
  }

  togglePunch() {
    if (this.punchText === 'Punch In') {
      this.punchIn();
    } else {
      this.punchOut();
    }
  }

  punchIn() {
    this.punchText = 'Punch Out';

    const punchButton = document.querySelector('.punch-button');
    punchButton?.classList.remove('punch-in');
    punchButton?.classList.add('punch-out');

    this.authService.punchIn().subscribe({
      next: async (response: any) => {
        console.log('Punch In Response: ', response);

        // Store values in localStorage
        localStorage.setItem('punchedInId', response.id);
        localStorage.setItem('punchin', 'true');

        const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

        // Show toast notification (async because of `await`)
        const toast = await this.toastCtrl.create({
          message: `Punched in successfully at ${timestamp}`,
          duration: 3000,
          color: 'success',
        });
        await toast.present();
      },
      error: async (error) => {
        console.error('Error during Punch In:', error);

        // Show error alert
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Failed to punch in. Please try again.',
          buttons: ['OK'],
        });
        await alert.present();
      },
      complete: () => {
        console.log('Punch-in request completed.');
      },
    });
  }

  punchOut() {
    this.punchText = 'Punch In';

    const punchButton = document.querySelector('.punch-button');
    punchButton?.classList.remove('punch-out');
    punchButton?.classList.add('punch-in');

    localStorage.setItem('punchin', 'false');

    const id = localStorage.getItem('punchedInId');
    if (!id) {
        console.error('Punch out failed: No punchedInId found.');
        return;
    }
    console.log('Punching out with ID:', id);
    this.authService.punchOut(id).subscribe({
        next: async (resp) => {
            console.log('Punch out response:', resp);
            localStorage.removeItem('punchedInId');

            const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

            // Show success toast
            const toast = await this.toastCtrl.create({
                message: `Punched out successfully at ${timestamp}`,
                duration: 3000,
                color: 'success',
            });

            await toast.present();
        },
        error: async (error) => {
            console.error('Error during Punch Out:', error);

            // Show error toast
            const toast = await this.toastCtrl.create({
                message: 'Punch out failed. Please try again.',
                duration: 3000,
                color: 'danger',
            });

            await toast.present();
        },
        complete: () => {
            console.log('Punch out request completed.');
        }
    });
}

}
