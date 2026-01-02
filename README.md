# Budget Tracker PWA

Your budget tracker application has been enhanced to work as a Progressive Web App (PWA), making it installable on mobile devices.

## Features

- **PWA Support**: Can be installed on mobile devices like a native app
- **Offline Functionality**: Works offline using service workers
- **Local Storage**: All data is saved in the browser's local storage
- **Responsive Design**: Works on both desktop and mobile devices

## How to Install on Mobile

### Android
1. Open the app in Chrome browser
2. Tap the menu button (three dots) in the top right
3. Select "Add to Home screen"
4. Confirm and the app will be installed

### iOS
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Select "Add to Home Screen"
4. Confirm and the app will be installed

## How to Convert to APK

To convert this PWA to an APK file for Android, you can use one of these methods:

### Method 1: PWABuilder (Recommended)
1. Go to https://www.pwabuilder.com/
2. Enter your website URL
3. Click "Build My PWA"
4. Download the Android package (APK)

### Method 2: Apache Cordova
1. Install Node.js
2. Install Cordova: `npm install -g cordova`
3. Create a new Cordova project
4. Add the Android platform
5. Replace the default files with your PWA files
6. Build the APK

### Method 3: Bubblewrap (Google's tool)
1. Install Node.js
2. Install Bubblewrap: `npm install -g @bubblewrap/cli`
3. Run `bubblewrap init --manifest [path-to-your-manifest.json]`
4. Run `bubblewrap build`
5. The APK will be generated in the project folder

## Files Added for PWA Support

- `manifest.json` - Defines the app metadata
- `sw.js` - Service worker for offline functionality
- `icons/` - Directory containing app icons
- `icons/icon-192x192.svg` - Small app icon
- `icons/icon-512x512.svg` - Large app icon

## Note on Icons

The app currently uses SVG icons. For the best results when converting to APK, you should generate PNG versions of the icons at these sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

You can convert the SVG icons to PNG using an online converter or graphic design software.