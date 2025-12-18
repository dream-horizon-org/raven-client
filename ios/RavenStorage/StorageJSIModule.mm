#import "StorageJSIModule.h"
#import <React/RCTBridge+Private.h>
#import <React/RCTUtils.h>
#import <jsi/jsi.h>
#import "StorageUtils.h"
#import <Raven/Raven-Swift.h>


using namespace facebook::jsi;
using namespace std;


@implementation StorageJSIModule

@synthesize bridge = _bridge;
@synthesize methodQueue = _methodQueue;

RCT_EXPORT_MODULE(StorageModule)

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

static Value setString(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
  NSString *storeId = StorageUtils::convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
    NSString *key = StorageUtils::convertJSIStringToNSString(runtime, arguments[1].getString(runtime));
    NSString *value = StorageUtils::convertJSIStringToNSString(runtime, arguments[2].getString(runtime));
  [[StorageModule getInstance] setStringWithStoreId:storeId forKey:key value:value];
    return Value();
  }

  static Value initialize(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
    NSString *storeId = StorageUtils::convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
    NSString *encryptionKey = StorageUtils::convertJSIStringToNSString(runtime, arguments[1].getString(runtime));
    bool multiprocess = arguments[2].getBool();
    [[StorageModule getInstance] initializeWithStoreId:storeId encryptionKey:encryptionKey multiprocess: multiprocess];
    return Value();
}


static Value getString(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
    NSString *storeId = StorageUtils::convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
    NSString *key = StorageUtils::convertJSIStringToNSString(runtime, arguments[1].getString(runtime));
    NSString *defaultValue = StorageUtils::convertJSIStringToNSString(runtime, arguments[2].getString(runtime));
    NSString *state = [[StorageModule getInstance] getStringWithStoreId:storeId forKey:key defaultValue:defaultValue];
    auto jsiValue = StorageUtils::convertNSStringToJSIString(runtime, state);
    return jsiValue;
}

static Value setBoolean(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
  NSString *storeId = StorageUtils::convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
    NSString *key = StorageUtils::convertJSIStringToNSString(runtime, arguments[1].getString(runtime));
    bool boolValue = arguments[2].getBool();
    [[StorageModule getInstance] setBooleanWithStoreId:storeId forKey:key value:boolValue];
    return Value();
}

static Value getBoolean(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
    NSString *storeId = StorageUtils::convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
    NSString *key = StorageUtils::convertJSIStringToNSString(runtime, arguments[1].getString(runtime));
    bool defaultValue = arguments[2].getBool();
    bool boolValue =[[StorageModule getInstance] getBooleanWithStoreId:storeId forKey:key defaultValue:defaultValue];
    return boolValue;
 }

 static Value setNumber(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
    NSString *storeId = StorageUtils::convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
    NSString *key = StorageUtils::convertJSIStringToNSString(runtime, arguments[1].getString(runtime));
    NSString *value = StorageUtils::convertJSIStringToNSString(runtime, arguments[2].getString(runtime));
   [[StorageModule getInstance] setNumberWithStoreId:storeId forKey:key value: value];
    return Value();  // Return an empty JSI Value
  }

static Value getNumber(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
    NSString *storeId = StorageUtils::convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
    NSString *key = StorageUtils::convertJSIStringToNSString(runtime, arguments[1].getString(runtime));
  NSString *defaultValue = StorageUtils::convertJSIStringToNSString(runtime, arguments[2].getString(runtime));
  NSString *value = [[StorageModule getInstance] getNumberWithStoreId:storeId forKey:key defaultValue:defaultValue];
  auto jsiValue = StorageUtils::convertNSStringToJSIString(runtime, value);
  return jsiValue;
}

static Value getAllKeys(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
    NSString *storeId = StorageUtils::convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
    NSArray *keys = [[StorageModule getInstance] getAllKeysWithStoreId:storeId];
  jsi::Array resultArray = StorageUtils::convertNSArrayToJSIArray(runtime, keys);
    return resultArray;
}

static Value containsKey(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
    NSString *storeId = StorageUtils::convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
    NSString *key = StorageUtils::convertJSIStringToNSString(runtime, arguments[1].getString(runtime));
  BOOL contains = [[StorageModule getInstance] containsKeyWithStoreId:storeId forKey:key];
    return Value(contains);
}

static Value removeKey(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
  NSString *storeId = StorageUtils::convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
  NSString *key = StorageUtils::convertJSIStringToNSString(runtime, arguments[1].getString(runtime));
  [[StorageModule getInstance] removeKeyWithStoreId:storeId forKey:key];
    return Value();
}
static Value removeAll(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
  NSString *storeId = StorageUtils::convertJSIStringToNSString(runtime, arguments[0].getString(runtime));
  [[StorageModule getInstance] removeAllWithStoreId:storeId];
    return Value();
}




static void installJSIModule(Runtime &jsiRuntime) {
     Object module = Object(jsiRuntime);
  StorageUtils::registerCxxFunction(jsiRuntime,module, "setString", 3, setString);
  StorageUtils::registerCxxFunction(jsiRuntime,module, "getString", 3, getString);
  StorageUtils::registerCxxFunction(jsiRuntime,module, "setBoolean", 3, setBoolean);
  StorageUtils::registerCxxFunction(jsiRuntime,module, "getBoolean", 3, getBoolean);
  StorageUtils::registerCxxFunction(jsiRuntime,module, "setNumber", 3, setNumber);
  StorageUtils::registerCxxFunction(jsiRuntime,module, "getNumber", 3, getNumber);
  StorageUtils::registerCxxFunction(jsiRuntime,module, "getAllKeys", 1, getAllKeys);
  StorageUtils::registerCxxFunction(jsiRuntime,module, "containsKey", 2, containsKey);
  StorageUtils::registerCxxFunction(jsiRuntime,module, "initialize", 3, initialize);
  StorageUtils::registerCxxFunction(jsiRuntime,module, "removeKey", 2, removeKey);
  StorageUtils::registerCxxFunction(jsiRuntime,module, "removeAll", 2, removeAll);
  jsiRuntime.global().setProperty(jsiRuntime, "__RavenStorageProxy", std::move(module));
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(installJSIModule) {
    RCTBridge* bridge = [RCTBridge currentBridge];
    RCTCxxBridge* cxxBridge = (RCTCxxBridge*)bridge;
    if (cxxBridge == nil) {
        return @false;
    }
    auto jsiRuntime = (facebook::jsi::Runtime*) cxxBridge.runtime;
    if (jsiRuntime == nil) {
        return @false;
    }
    installJSIModule(*(facebook::jsi::Runtime *)jsiRuntime);
    return @true;
}

@end
