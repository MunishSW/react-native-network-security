import NetworkSecurity from './NativeNetworkSecurity';

export function multiply(a: number, b: number): number {
  return NetworkSecurity.multiply(a, b);
}

export {
  useNetworkTrust,
  useEnvironmentTrust,
  type TrustState,
  type TrustOptions,
} from './useNetworkTrust';

export default NetworkSecurity;
