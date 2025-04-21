# 📍 Konspec Location Tracking

A **mobile app** built with **Ionic + Angular + Cordova**, featuring **background location tracking** using the **TransistorSoft Background Geolocation plugin**.

---

## 🚀 Features
✔️ Background location tracking (even when the app is closed)  
✔️ Automatic start/stop tracking with a schedule  
✔️ Sends location updates to a server  
✔️ Works on both **Android** and **iOS**  
✔️ User authentication  

---

## 🛠 Prerequisites
Before installing, make sure you have the following installed:  

✅ **Node.js** (v16 recommended) → [Download](https://nodejs.org/)  
✅ **Angular CLI** (v16) → `npm install -g @angular/cli@16.0.0`  
✅ **Ionic CLI** → `npm install -g @ionic/cli`  
✅ **Cordova CLI** → `npm install -g cordova`  
✅ **Android Studio** (for Android builds)  
✅ **Xcode** (for iOS builds, Mac only)  

---

## 📥 Installation

#### How to run it locally
### 1️⃣ Clone the Repository
1. [Download](https://github.com/seventechco/products-mobile/archive/refs/heads/main.zip) or clone the [repository](https://github.com/satyaseventech/CRMLocationTracking.git) to your local machine:
```bash
git clone https://github.com/satyaseventech/CRMLocationTracking.git
cd CRMLocationTracking
```

2. Run `npm install` inside the cloned folder:
```bash
$ npm install
```

3. Run `ng serve` to run it on browser:
```bash
$ ng serve
```

📦 Building the App for Android & iOS
📱 Android - Generate .apk File
To build the Android app:
  
1️⃣ Remove old build files (Optional):
```bash
$ rm -rf www/
```

2️⃣ Build Angular project for production
```bash
$ ng build --configuration=production
```

3️⃣ Reinstall Android platform (optional but safe)

```bash
$ cordova platform rm android
$ cordova platform add android
```

4️⃣ Build the APK

```bash
$ cordova build android --release
```

✅ After successful build, find your APK at:

```bash
 platforms/android/app/build/outputs/apk/release/app-release.apk
```

🍏 iOS - Build with Xcode (macOS only)
To build and run the iOS app:
1️⃣ Remove old build files.

```bash
$ rm -rf www/
```

2️⃣ Build Angular project for production

```bash
$ ng build --configuration=production
```

3️⃣ Reinstall iOS platform (optional)

```bash
$ cordova platform rm ios
$ cordova platform add ios
```

4️⃣ Build the iOS project

```bash
$ cordova build ios --release
```

✅ This will generate an Xcode project in:

```bash
platforms/ios/
```
👉 Open the .xcworkspace or .xcodeproj in Xcode to run the app on a device or simulator, or archive it for App Store submission.






