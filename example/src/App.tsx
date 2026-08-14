import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import NetworkSecurity, {
  useNetworkTrust,
  useEnvironmentTrust,
  multiply,
} from 'react-native-network-security';

export default function App() {
  const trustState = useNetworkTrust({
    blockOnUnknown: false,
    blockPublicWiFi: true,
    blockCaptivePortal: true,
    captivePortalCheckTimeout: 5000,
  });

  // Demonstrates the `useEnvironmentTrust` alias hook (same behavior as
  // useNetworkTrust, exported under an alternative name).
  const aliasTrustState = useEnvironmentTrust();

  // Demonstrates calling the underlying native module directly, without
  // going through the hook (as documented in the "Native Module Methods"
  // section of the README).
  const [directVpnStatus, setDirectVpnStatus] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    NetworkSecurity.isVPNActive()
      .then(setDirectVpnStatus)
      .catch(() => setDirectVpnStatus(null));
  }, []);

  // Demonstrates the `multiply` helper exported from the library.
  const multiplyResult = multiply(6, 7);

  console.log(trustState)

  const getTrustColor = () => {
    if (trustState.isLoading) return '#FFA500'; // Orange for loading
    return trustState.isTrusted ? '#4CAF50' : '#F44336'; // Green or Red
  };

  const getTrustText = () => {
    if (trustState.isLoading) return 'CHECKING...';
    return trustState.isTrusted ? 'TRUSTED' : 'UNTRUSTED';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Network Security Monitor</Text>

        {/* Trust Status Badge */}
        <View
          style={[
            styles.trustBadge,
            { backgroundColor: getTrustColor() },
          ]}
        >
          <Text style={styles.trustBadgeText}>{getTrustText()}</Text>
        </View>

        {/* Trust Reason */}
        {trustState.reason && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Reason:</Text>
            <Text style={styles.reasonText}>{trustState.reason}</Text>
          </View>
        )}

        {/* Network Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Status</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Connection:</Text>
            <Text
              style={[
                styles.value,
                { color: trustState.isConnected ? '#4CAF50' : '#F44336' },
              ]}
            >
              {trustState.isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Connection Type:</Text>
            <Text style={styles.value}>
              {trustState.connectionType || 'Unknown'}
            </Text>
          </View>

          {trustState.ssid && (
            <View style={styles.row}>
              <Text style={styles.label}>WiFi SSID:</Text>
              <Text style={styles.value}>{trustState.ssid}</Text>
            </View>
          )}
        </View>

        {/* Security Checks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Checks</Text>

          <View style={styles.row}>
            <Text style={styles.label}>VPN Active:</Text>
            <View
              style={[
                styles.indicator,
                {
                  backgroundColor: trustState.isVPNActive
                    ? '#F44336'
                    : '#4CAF50',
                },
              ]}
            >
              <Text style={styles.indicatorText}>
                {trustState.isVPNActive ? 'YES' : 'NO'}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Public WiFi:</Text>
            <View
              style={[
                styles.indicator,
                {
                  backgroundColor: trustState.isPublicWiFi
                    ? '#FF9800'
                    : '#4CAF50',
                },
              ]}
            >
              <Text style={styles.indicatorText}>
                {trustState.isPublicWiFi ? 'YES' : 'NO'}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Captive Portal:</Text>
            <View
              style={[
                styles.indicator,
                {
                  backgroundColor: trustState.hasCaptivePortal
                    ? '#FF9800'
                    : '#4CAF50',
                },
              ]}
            >
              <Text style={styles.indicatorText}>
                {trustState.hasCaptivePortal ? 'YES' : 'NO'}
              </Text>
            </View>
          </View>
        </View>

        {/* Native Module / Alias / Helper Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Native Module &amp; Helpers</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Direct isVPNActive():</Text>
            <Text style={styles.value}>
              {directVpnStatus === null
                ? 'Checking...'
                : directVpnStatus
                ? 'YES'
                : 'NO'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>multiply(6, 7):</Text>
            <Text style={styles.value}>{multiplyResult}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>useEnvironmentTrust() alias:</Text>
            <Text
              style={[
                styles.value,
                {
                  color: aliasTrustState.isTrusted ? '#4CAF50' : '#F44336',
                },
              ]}
            >
              {aliasTrustState.isLoading
                ? 'Checking...'
                : aliasTrustState.isTrusted
                ? 'TRUSTED'
                : 'UNTRUSTED'}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Real-time network security monitoring
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  trustBadge: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  trustBadgeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  reasonContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#856404',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  indicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
