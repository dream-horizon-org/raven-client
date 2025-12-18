#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TooltipModule, NSObject)

RCT_EXTERN_METHOD(show:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setCurrentScreen:(NSString *)screenName)

RCT_EXTERN_METHOD(hide:(NSString *)targetId
                  callback:(RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(hideAll:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
