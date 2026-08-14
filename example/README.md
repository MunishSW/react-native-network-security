# react-native-network-security Example App

This example app demonstrates the **react-native-network-security** library features including VPN detection, captive portal detection, public WiFi identification, and real-time network trust monitoring.

## Features Demonstrated

- ✅ Real-time VPN detection
- ✅ Network connection status monitoring
- ✅ WiFi SSID display
- ✅ Public WiFi detection
- ✅ Captive portal detection
- ✅ Overall network trust status
- ✅ Live updates on network changes

## Prerequisites

Before running this example, ensure you have:

- Node.js 20 or higher
- React Native development environment set up ([Setup Guide](https://reactnative.dev/docs/set-up-your-environment))
- For Android: Android Studio and Android SDK
- For iOS: Xcode (macOS only)

## Installation

### Step 1: Install Dependencies

From the **root directory** of the react-native-network-security project:

**Using Yarn:**
```sh
yarn install
```

**Using npm:**
```sh
npm install
```

This will install dependencies for both the library and the example app.

## Running the Example

### Android

**Using Yarn:**
```sh
cd example
yarn android
```

**Using npm:**
```sh
cd example
npm run android
```

This will:
1. Start the Metro bundler
2. Build and install the app on your Android device/emulator
3. Launch the app

**Note:** Make sure you have an Android emulator running or a physical device connected via USB debugging.

### iOS

**Using Yarn:**
```sh
cd example
cd ios
pod install
cd ..
yarn ios
```

**Using npm:**
```sh
cd example
cd ios
pod install
cd ..
npm run ios
```

**Note:** iOS development requires macOS with Xcode installed.

## Development

### Start Metro Bundler Separately

If you want to start Metro separately:

**Using Yarn:**
```sh
cd example
yarn start
```

**Using npm:**
```sh
cd example
npm start
```

Then in another terminal, run:
```sh
yarn android
# or
yarn ios
```

### Reset Metro Cache

If you encounter bundling issues:

**Using Yarn:**
```sh
cd example
yarn start --reset-cache
```

**Using npm:**
```sh
cd example
npm start -- --reset-cache
```

## Testing Features

### Test VPN Detection
1. Enable a VPN on your device
2. The app will show "VPN Active: YES" and mark the network as UNTRUSTED

### Test Public WiFi Detection
1. Connect to a WiFi network with "Guest", "Public", "Free", etc. in the name
2. The app will show "Public WiFi: YES"

### Test Captive Portal Detection
1. Connect to a WiFi network that requires login (hotel, airport, cafe)
2. The app will show "Captive Portal: YES"

### Test Real-time Updates
1. Toggle WiFi or mobile data on/off
2. Connect/disconnect from VPN
3. Switch between WiFi networks
4. Watch the app update automatically

## Building for Release

### Android Release APK

**Using Gradle:**
```sh
cd example/android
./gradlew assembleRelease
```

**Using Windows:**
```sh
cd example\android
.\gradlew assembleRelease
```

The APK will be at: `example/android/app/build/outputs/apk/release/app-release.apk`

### iOS Release Build

1. Open the workspace in Xcode:
   ```sh
   open example/ios/NetworkSecurityExample.xcworkspace
   ```
2. Select Product → Archive
3. Follow the distribution prompts

## Troubleshooting

### "Unable to resolve module" Error
```sh
cd example
yarn start --reset-cache
```

### Android Build Fails
```sh
cd example/android
./gradlew clean
cd ..
yarn android
```

### iOS Build Fails
```sh
cd example/ios
pod deintegrate
pod install
cd ..
yarn ios
```

### Metro Already Running
Stop the existing Metro process and restart:
```sh
# Kill Metro process
# Then restart
yarn start --reset-cache
```

## Learn More

- [Library Documentation](../README.md)
- [React Native Documentation](https://reactnative.dev/)

## License

MIT

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
