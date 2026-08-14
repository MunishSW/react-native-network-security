import { useState, useEffect, useMemo, useRef } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { DeviceEventEmitter } from 'react-native';
import NetworkSecurity from './NativeNetworkSecurity';

export interface TrustState {
  isVPNActive: boolean;
  isConnected: boolean;
  connectionType: string | null;
  ssid: string | null;
  isPublicWiFi: boolean;
  hasCaptivePortal: boolean;
  isTrusted: boolean;
  reason: string | null;
  isLoading: boolean;
}

export interface TrustOptions {
  blockOnUnknown?: boolean;
  blockPublicWiFi?: boolean;
  blockCaptivePortal?: boolean;
  captivePortalCheckTimeout?: number;
}

interface CaptivePortalCache {
  ssid: string;
  hasCaptivePortal: boolean;
  timestamp: number;
}

const CAPTIVE_PORTAL_CACHE_DURATION = 60000; // 60 seconds
// Switched from http://clients3.google.com/generate_204 to an HTTPS endpoint.
// Banking-grade apps typically set android:usesCleartextTraffic="false" plus a
// network_security_config.xml that blocks all plaintext HTTP (Kotak's own
// AndroidManifest.xml does exactly this). The old cleartext URL would get
// blocked by the OS before the request ever left the device, silently
// falling into the catch block below and always reporting "no captive
// portal" -- a false negative baked into the default config on any app
// that follows standard hardening practice. gstatic's endpoint returns the
// same 204-on-clean-connection behavior over HTTPS.
const CAPTIVE_PORTAL_URL = 'https://www.gstatic.com/generate_204';

/**
 * Checks if an SSID appears to be a public WiFi network based on common naming patterns
 */
function looksPublicSSID(ssid: string | null): boolean {
  if (!ssid) return false;

  const lowerSSID = ssid.toLowerCase();
  const publicKeywords = [
    'guest',
    'public',
    'free',
    'wifi',
    'cafe',
    'hotel',
    'airport',
    'mall',
    'visitor',
    'lobby',
  ];

  return publicKeywords.some((keyword) => lowerSSID.includes(keyword));
}

/**
 * Probes for a captive portal by checking if HTTP request to a known URL returns expected status
 */
async function captivePortalProbe(
  timeoutMs: number = 5000
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(CAPTIVE_PORTAL_URL, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'manual',
    });

    clearTimeout(timeoutId);

    // Google's generate_204 should return 204 with no content
    // If we get a redirect (3xx) or 200, it's likely a captive portal
    if (response.status === 204) {
      return false; // No captive portal
    } else if (
      response.status >= 300 ||
      response.status === 200
    ) {
      return true; // Likely captive portal
    }

    return false;
  } catch (error) {
    // Network errors or timeouts suggest possible captive portal or connection issue
    return false; // Fail-safe: assume no captive portal on error
  }
}

/**
 * Custom hook that provides comprehensive network trust information
 * @param options Configuration options for trust evaluation
 * @returns TrustState object with network security information
 */
export function useNetworkTrust(
  options: TrustOptions = {}
): TrustState {
  const {
    blockOnUnknown = false,
    blockPublicWiFi = true,
    blockCaptivePortal = true,
    captivePortalCheckTimeout = 5000,
  } = options;

  const [isVPNActive, setIsVPNActive] = useState<boolean>(false);
  const [netInfoState, setNetInfoState] = useState<NetInfoState | null>(null);
  const [hasCaptivePortal, setHasCaptivePortal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const captivePortalCacheRef = useRef<CaptivePortalCache | null>(null);
  const captivePortalCheckInProgressRef = useRef<boolean>(false);

  // Initial VPN status check
  useEffect(() => {
    let mounted = true;

    const checkInitialVPN = async () => {
      try {
        const vpnStatus = await NetworkSecurity.isVPNActive();
        if (mounted) {
          setIsVPNActive(vpnStatus);
        }
      } catch (error) {
        // Fail-safe: assume no VPN on error
        if (mounted) {
          setIsVPNActive(false);
        }
      }
    };

    checkInitialVPN();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen to VPN status changes from native module
  useEffect(() => {
    NetworkSecurity.addListener('vpnStatusChanged');

    const subscription = DeviceEventEmitter.addListener(
      'vpnStatusChanged',
      (status: boolean) => {
        setIsVPNActive(status);
      }
    );

    return () => {
      subscription.remove();
      NetworkSecurity.removeListeners(1);
    };
  }, []);

  // Listen to network state changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetInfoState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Check for captive portal when network changes
  useEffect(() => {
    let mounted = true;

    const checkCaptivePortal = async () => {
      if (!netInfoState?.isConnected) {
        if (mounted) {
          setHasCaptivePortal(false);
          setIsLoading(false);
        }
        return;
      }

      const currentSSID = (netInfoState.details as any)?.ssid || null;

      // Check cache
      const cache = captivePortalCacheRef.current;
      if (
        cache &&
        cache.ssid === currentSSID &&
        Date.now() - cache.timestamp < CAPTIVE_PORTAL_CACHE_DURATION
      ) {
        if (mounted) {
          setHasCaptivePortal(cache.hasCaptivePortal);
          setIsLoading(false);
        }
        return;
      }

      // Prevent concurrent checks
      if (captivePortalCheckInProgressRef.current) {
        return;
      }

      captivePortalCheckInProgressRef.current = true;

      try {
        const result = await captivePortalProbe(captivePortalCheckTimeout);

        if (mounted) {
          setHasCaptivePortal(result);

          // Update cache
          if (currentSSID) {
            captivePortalCacheRef.current = {
              ssid: currentSSID,
              hasCaptivePortal: result,
              timestamp: Date.now(),
            };
          }

          setIsLoading(false);
        }
      } catch (error) {
        // Fail-safe: assume no captive portal on error
        if (mounted) {
          setHasCaptivePortal(false);
          setIsLoading(false);
        }
      } finally {
        captivePortalCheckInProgressRef.current = false;
      }
    };

    checkCaptivePortal();

    return () => {
      mounted = false;
    };
  }, [netInfoState?.isConnected, netInfoState?.details, captivePortalCheckTimeout]);

  // Compute trust state
  const trustState = useMemo<TrustState>(() => {
    const isConnected = netInfoState?.isConnected ?? false;
    const connectionType = netInfoState?.type ?? null;
    const ssid = (netInfoState?.details as any)?.ssid ?? null;
    const isPublicWiFi = looksPublicSSID(ssid);

    const reasons: string[] = [];
    let trusted = true;

    // Check VPN
    if (isVPNActive) {
      reasons.push('VPN detected');
      trusted = false;
    }

    // Check connection
    if (!isConnected && blockOnUnknown) {
      reasons.push('No network connection');
      trusted = false;
    }

    // Check public WiFi
    if (isPublicWiFi && blockPublicWiFi && isConnected) {
      reasons.push('Public WiFi detected');
      trusted = false;
    }

    // Check captive portal
    if (hasCaptivePortal && blockCaptivePortal && isConnected) {
      reasons.push('Captive portal detected');
      trusted = false;
    }

    return {
      isVPNActive,
      isConnected,
      connectionType,
      ssid,
      isPublicWiFi,
      hasCaptivePortal,
      isTrusted: trusted,
      reason: reasons.length > 0 ? reasons.join(', ') : null,
      isLoading,
    };
  }, [
    isVPNActive,
    netInfoState,
    hasCaptivePortal,
    isLoading,
    blockOnUnknown,
    blockPublicWiFi,
    blockCaptivePortal,
  ]);

  return trustState;
}

// Alias export
export const useEnvironmentTrust = useNetworkTrust;
