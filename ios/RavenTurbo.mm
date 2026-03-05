#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RavenSpec/RavenSpec.h"
#endif

#ifdef RCT_NEW_ARCH_ENABLED
@interface RCT_EXTERN_MODULE (RavenTurbo, NSObject <NativeRavenTurboSpec>)
#else
@interface RCT_EXTERN_MODULE (RavenTurbo, NSObject <RCTBridgeModule>)
#endif

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

RCT_EXTERN_METHOD(initializeOutApp
                  : (NSDictionary *)config resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateUserProfile
                  : (NSDictionary *)params resolver
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(logout
                  : (RCTPromiseResolveBlock)resolve rejecter
                  : (RCTPromiseRejectBlock)reject)

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeRavenTurboSpecJSI>(params);
}
#endif

@end
