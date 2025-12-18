#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ScreenInspector, NSObject)

RCT_EXTERN_METHOD(setCurrentScreen:(NSString *)routeName)

RCT_EXTERN_METHOD(captureScreen:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end

