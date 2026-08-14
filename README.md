# react-native-network-security

React Native security library that ensures the app communicates only through trusted, secure, and uncompromised network environments. This library provides comprehensive network trust monitoring including VPN detection, captive portal detection, public WiFi identification, and real-time network change events.

## Features

- 🔒 **VPN Detection** - Detect active VPN connections on both iOS and Android
- 📡 **Network Monitoring** - Monitor WiFi SSID and connection status
- 🌐 **Captive Portal Detection** - Identify captive portals using HTTP probe
- 🏢 **Public WiFi Detection** - Identify public WiFi networks using SSID heuristics
- ⚡ **Real-time Events** - Receive instant notifications when network conditions change
- 🎯 **TypeScript Support** - Full TypeScript definitions included
- 🔄 **Turbo Module** - Built with React Native's new architecture

## Installation

### Install from npm

```sh
npm install react-native-network-security @react-native-community/netinfo
```

or

```sh
yarn add react-native-network-security @react-native-community/netinfo
```

### Install from GitHub

```sh
npm install github:MunishSW/react-native-network-security @react-native-community/netinfo
```

or

```sh
yarn add MunishSW/react-native-network-security @react-native-community/netinfo
```

### iOS Setup

For iOS, you need to install pods:

```sh
cd ios && pod install
```

No additional permissions are required, but if you want to access WiFi SSID information, you need to:

1. Add the "Access WiFi Information" capability in Xcode
2. Add location permissions to your `Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need access to your location to identify your WiFi network</string>
```

### Android Setup

The library automatically adds the required `ACCESS_NETWORK_STATE` permission to your AndroidManifest.xml.

## Usage

### Basic Usage

```tsx
import { useNetworkTrust } from 'react-native-network-security';

function App() {
  const trustState = useNetworkTrust();

  if (!trustState.isTrusted) {
    return (
      <View>
        <Text>⚠️ Untrusted Network</Text>
        <Text>Reason: {trustState.reason}</Text>
      </View>
    );
  }

  return <YourApp />;
}
```

### Advanced Usage with Options

```tsx
import { useNetworkTrust } from 'react-native-network-security';

function App() {
  const trustState = useNetworkTrust({
    blockOnUnknown: false,           // Don't block when connection state is unknown
    blockPublicWiFi: true,            // Block on public WiFi networks
    blockCaptivePortal: true,         // Block when captive portal detected
    captivePortalCheckTimeout: 5000,  // Timeout for captive portal check (ms)
  });

  return (
    <View>
      <Text>VPN Active: {trustState.isVPNActive ? 'Yes' : 'No'}</Text>
      <Text>Connected: {trustState.isConnected ? 'Yes' : 'No'}</Text>
      <Text>Connection Type: {trustState.connectionType}</Text>
      <Text>WiFi SSID: {trustState.ssid || 'N/A'}</Text>
      <Text>Public WiFi: {trustState.isPublicWiFi ? 'Yes' : 'No'}</Text>
      <Text>Captive Portal: {trustState.hasCaptivePortal ? 'Yes' : 'No'}</Text>
      <Text>Trusted: {trustState.isTrusted ? 'Yes' : 'No'}</Text>
      {trustState.reason && <Text>Reason: {trustState.reason}</Text>}
    </View>
  );
}
```

### Using the Alternative Hook Name

```tsx
import { useEnvironmentTrust } from 'react-native-network-security';

// useEnvironmentTrust is an alias for useNetworkTrust
const trustState = useEnvironmentTrust();
```

## API Reference

### `useNetworkTrust(options?): TrustState`

Main hook for monitoring network trust. Also available as `useEnvironmentTrust`.

#### Options

```typescript
interface TrustOptions {
  blockOnUnknown?: boolean;             // Default: false
  blockPublicWiFi?: boolean;            // Default: true
  blockCaptivePortal?: boolean;         // Default: true
  captivePortalCheckTimeout?: number;   // Default: 5000 (ms)
}
```

#### Return Value

```typescript
interface TrustState {
  isVPNActive: boolean;         // Whether a VPN is active
  isConnected: boolean;         // Whether device is connected to a network
  connectionType: string | null; // Type of connection (wifi, cellular, etc.)
  ssid: string | null;          // WiFi SSID if connected to WiFi
  isPublicWiFi: boolean;        // Whether connected to public WiFi
  hasCaptivePortal: boolean;    // Whether captive portal detected
  isTrusted: boolean;           // Overall trust status
  reason: string | null;        // Reason for untrusted state
  isLoading: boolean;           // Whether initial checks are in progress
}
```

### Native Module Methods

The native module is also exported for direct use if needed:

```tsx
import NetworkSecurity from 'react-native-network-security';

// Check VPN status directly
const isVPN = await NetworkSecurity.isVPNActive();
```

## How It Works

### VPN Detection

- **iOS**: Checks network interfaces for VPN connections (utun, ppp, ipsec, tap, tun)
- **Android**: Uses `NetworkCapabilities.TRANSPORT_VPN` to detect VPN connections

### Captive Portal Detection

Performs an HTTP probe to `http://clients3.google.com/generate_204`:
- If status is 204: No captive portal
- If status is 200 or 3xx: Likely captive portal present

Results are cached per network for 60 seconds to avoid excessive network calls.

### Public WiFi Detection

Checks SSID against common public WiFi keywords:
- guest, public, free, wifi, cafe, hotel, airport, mall, visitor, lobby

### Real-time Updates

The library listens to:
- Native VPN status change events
- Network state changes via NetInfo
- Automatically updates when network conditions change

## Platform-Specific Considerations

### iOS

- VPN detection works on all iOS versions
- SSID access requires location permissions on iOS 13+
- Background VPN monitoring uses a timer-based approach

### Android

- Supports Android API 21+ (Android 5.0+)
- VPN detection uses different APIs for Android 6.0+ (API 23+)
- Real-time VPN monitoring uses NetworkCallback (API 24+)

## Permissions

### Android

Required permissions (added automatically):
```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### iOS

Optional for SSID access:
- Access WiFi Information capability
- Location permissions (NSLocationWhenInUseUsageDescription)

## Troubleshooting

### SSID is always null on iOS

Make sure you've:
1. Added the "Access WiFi Information" capability in Xcode
2. Added location permissions to Info.plist
3. Requested location permissions at runtime

### VPN detection not working

- Ensure you've installed the latest version of the library
- On Android, make sure ACCESS_NETWORK_STATE permission is granted
- On iOS, some VPN types may not be detectable via interface checking

## Changelog

### Fixed

- **Captive-portal check**: `useNetworkTrust.ts` pinged
  `http://clients3.google.com/generate_204` (plaintext HTTP) to detect
  captive portals. Apps that ship a network security config with
  `android:usesCleartextTraffic="false"` (the recommended, more secure
  setting, and what Kotak's own `AndroidManifest.xml` uses) will silently
  fail this request every time, since cleartext traffic is blocked at the
  OS level. `CAPTIVE_PORTAL_URL` now points at
  `https://www.gstatic.com/generate_204` (HTTPS, same semantics) so the
  check works correctly regardless of the host app's cleartext-traffic
  policy.

### Known limitation (not fixed)

- **iOS VPN detection** polls status via `NSTimer` on a ~2 second interval,
  whereas Android uses a push-based `ConnectivityManager.NetworkCallback`.
  This means iOS can report VPN state up to ~2s stale compared to Android's
  near-instant callback. Left as-is since it did not affect correctness,
  only latency — flagging here so it's a known tradeoff rather than a
  surprise if you're relying on tight timing.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
