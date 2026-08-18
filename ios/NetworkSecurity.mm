#import "NetworkSecurity.h"
#import <ifaddrs.h>
#import <arpa/inet.h>
#import <net/if.h>
#import <SystemConfiguration/CaptiveNetwork.h>

@implementation NetworkSecurity
{
  BOOL _lastVPNState;
  BOOL _hasListeners;
  NSTimer *_vpnCheckTimer;
}

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (instancetype)init
{
  if (self = [super init]) {
    _lastVPNState = NO;
    _hasListeners = NO;
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"vpnStatusChanged"];
}

- (void)startObserving
{
  _hasListeners = YES;
  // Start periodic VPN check
  if (!_vpnCheckTimer) {
    _vpnCheckTimer = [NSTimer scheduledTimerWithTimeInterval:2.0
                                                      target:self
                                                    selector:@selector(checkAndEmitVPNStatus)
                                                    userInfo:nil
                                                     repeats:YES];
  }
}

- (void)stopObserving
{
  _hasListeners = NO;
  if (_vpnCheckTimer) {
    [_vpnCheckTimer invalidate];
    _vpnCheckTimer = nil;
  }
}

- (NSNumber *)multiply:(double)a b:(double)b {
    NSNumber *result = @(a * b);
    return result;
}

- (void)isVPNActive:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
  @try {
    BOOL isVPN = [self checkVPNConnection];
    resolve(@(isVPN));
  } @catch (NSException *exception) {
    reject(@"VPN_CHECK_ERROR", 
           [NSString stringWithFormat:@"Failed to check VPN status: %@", exception.reason], 
           nil);
  }
}

- (BOOL)checkVPNConnection
{
  struct ifaddrs *interfaces = NULL;
  struct ifaddrs *temp_addr = NULL;
  BOOL isVPN = NO;
  
  // Get list of all network interfaces
  if (getifaddrs(&interfaces) == 0) {
    temp_addr = interfaces;
    while (temp_addr != NULL) {
      NSString *interfaceName = [NSString stringWithUTF8String:temp_addr->ifa_name];
      
      // Check for VPN interface names
      if ([interfaceName hasPrefix:@"utun"] ||
          [interfaceName hasPrefix:@"ppp"] ||
          [interfaceName hasPrefix:@"ipsec"] ||
          [interfaceName hasPrefix:@"tap"] ||
          [interfaceName hasPrefix:@"tun"]) {
        
        // Check if interface is up and running
        if ((temp_addr->ifa_flags & IFF_UP) && (temp_addr->ifa_flags & IFF_RUNNING)) {
          isVPN = YES;
          break;
        }
      }
      temp_addr = temp_addr->ifa_next;
    }
  }
  
  freeifaddrs(interfaces);
  return isVPN;
}

- (void)checkAndEmitVPNStatus
{
  BOOL isVPN = [self checkVPNConnection];
  
  // Only emit if state changed to avoid duplicate events
  if (_lastVPNState != isVPN) {
    _lastVPNState = isVPN;
    if (_hasListeners) {
      [self sendEventWithName:@"vpnStatusChanged" body:@(isVPN)];
    }
  }
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeNetworkSecuritySpecJSI>(params);
}

- (void)dealloc
{
  if (_vpnCheckTimer) {
    [_vpnCheckTimer invalidate];
  }
}

@end
