import Foundation
import React
import RavenIOSSDK

enum OutAppInitializer {
  static func initializeOutApp(
    config: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let fcmBaseUrl = config["fcmBaseUrl"] as? String, !fcmBaseUrl.isEmpty else {
      reject("OUT_APP_INIT_ERROR", "fcmBaseUrl is required", nil)
      return
    }
    guard let eventBaseUrl = config["eventBaseUrl"] as? String, !eventBaseUrl.isEmpty else {
      reject("OUT_APP_INIT_ERROR", "eventBaseUrl is required", nil)
      return
    }
    guard let apiKey = config["apiKey"] as? String, !apiKey.isEmpty else {
      reject("OUT_APP_INIT_ERROR", "apiKey is required and must be non-empty", nil)
      return
    }
    guard let globalPropsDict = config["globalProps"] as? NSDictionary else {
      reject("OUT_APP_INIT_ERROR", "globalProps is required", nil)
      return
    }
    guard globalPropsDict["deviceId"] as? String != nil else {
      reject("OUT_APP_INIT_ERROR", "globalProps.deviceId is required", nil)
      return
    }
    guard globalPropsDict["appVersion"] as? String != nil else {
      reject("OUT_APP_INIT_ERROR", "globalProps.appVersion is required", nil)
      return
    }
    guard globalPropsDict["appPackageName"] as? String != nil else {
      reject("OUT_APP_INIT_ERROR", "globalProps.appPackageName is required", nil)
      return
    }
    guard let userId = globalPropsDict["userId"] as? String, !userId.isEmpty else {
      reject("OUT_APP_INIT_ERROR", "globalProps.userId is required for iOS", nil)
      return
    }
    let enableLogging = (config["enableLogging"] as? Bool) ?? true
    let fcmRetryConfig = parseRetryConfig(config["fcmRetryConfig"] as? NSDictionary) ?? RetryConfig.default
    let analyticsRetryConfig = parseRetryConfig(config["eventRetryConfig"] as? NSDictionary) ?? RetryConfig.default
    let globalProps = parseGlobalProps(globalPropsDict)
    let ravConfig = RavenConfig(
      userId: userId,
      apiKey: apiKey,
      baseUrl: fcmBaseUrl,
      eventsBaseUrl: eventBaseUrl,
      enableLogging: enableLogging,
      fcmRetryConfig: fcmRetryConfig,
      analyticsRetryConfig: analyticsRetryConfig,
      globalProps: globalProps
    )
    DispatchQueue.main.async {
      do {
        try Raven.initialize(context: UIApplication.shared, config: ravConfig)
        resolve(nil)
      } catch {
        reject("OUT_APP_INIT_ERROR", error.localizedDescription, error)
      }
    }
  }

  static func updateUserProfile(
    params: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let userId = params["userId"] as? String, !userId.isEmpty else {
      reject("UPDATE_USER_PROFILE_ERROR", "userId is required", nil)
      return
    }
    resolve(nil)
  }

  private static func parseRetryConfig(_ map: NSDictionary?) -> RetryConfig? {
    guard let map = map else { return nil }
    let enabled = map["enabled"] as? Bool ?? true
    let maxRetries = map["maxRetries"] as? Int ?? 3
    let initialDelayMs = (map["initialDelayMs"] as? NSNumber)?.int64Value ?? 1000
    let maxDelayMs = (map["maxDelayMs"] as? NSNumber)?.int64Value ?? 30000
    let backoffMultiplier = (map["backoffMultiplier"] as? NSNumber)?.doubleValue ?? 2.0
    return RetryConfig(
      enabled: enabled,
      maxRetries: maxRetries,
      initialDelayMs: initialDelayMs,
      maxDelayMs: maxDelayMs,
      backoffMultiplier: backoffMultiplier
    )
  }

  private static func parseGlobalProps(_ dict: NSDictionary) -> GlobalProps {
    let custom = dict["custom"] as? [String: Any]
    return GlobalProps(
      firstName: dict["firstName"] as? String,
      lastName: dict["lastName"] as? String,
      email: dict["email"] as? String,
      phone: dict["phone"] as? String,
      birthdate: dict["birthdate"] as? String,
      gender: dict["gender"] as? String,
      city: dict["city"] as? String,
      locality: dict["locality"] as? String,
      postalCode: dict["postalCode"] as? String,
      country: dict["country"] as? String,
      language: dict["language"] as? String,
      custom: custom
    )
  }
}
