#import <React/RCTBridgeModule.h>

@interface StorageJSIModule : NSObject <RCTBridgeModule>;

@property (nonatomic, assign) BOOL setBridgeOnMainQueue;

@end
