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
    let eventBaseUrl = (config["eventBaseUrl"] as? String).flatMap { $0.isEmpty ? nil : $0 } ?? fcmBaseUrl
    guard let apiKey = config["apiKey"] as? String, !apiKey.isEmpty else {
      reject("OUT_APP_INIT_ERROR", "apiKey is required", nil)
      return
    }
    guard let globalPropsDict = config["globalProps"] as? NSDictionary else {
      reject("OUT_APP_INIT_ERROR", "globalProps is required", nil)
      return
    }
    guard let deviceId = globalPropsDict["deviceId"] as? String, !deviceId.isEmpty else {
      reject("OUT_APP_INIT_ERROR", "globalProps.deviceId is required", nil)
      return
    }
    guard let appVersion = globalPropsDict["appVersion"] as? String, !appVersion.isEmpty else {
      reject("OUT_APP_INIT_ERROR", "globalProps.appVersion is required", nil)
      return
    }
    guard let appPackageName = globalPropsDict["appPackageName"] as? String, !appPackageName.isEmpty else {
      reject("OUT_APP_INIT_ERROR", "globalProps.appPackageName is required", nil)
      return
    }
    guard let userId = globalPropsDict["userId"] as? String, !userId.isEmpty else {
      reject("OUT_APP_INIT_ERROR", "globalProps.userId is required", nil)
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
    guard Raven.isInitialized() else {
      reject("UPDATE_USER_PROFILE_ERROR", "Raven SDK not initialized. Call initializeOutApp first.", nil)
      return
    }
    let request = parseUserLoginRequest(params: params, userId: userId)
    Task {
      do {
        _ = try await Raven.loginUser(request)
        await MainActor.run { resolve(nil) }
      } catch {
        await MainActor.run {
          reject("UPDATE_USER_PROFILE_ERROR", error.localizedDescription, error as NSError)
        }
      }
    }
  }

  private static func parseUserLoginRequest(params: NSDictionary, userId: String) -> UserLoginRequest {
    let custom = params["custom"] as? [String: Any]
    return UserLoginRequest(
      userId: userId,
      firstName: params["firstName"] as? String,
      lastName: params["lastName"] as? String,
      email: params["email"] as? String,
      phone: params["phone"] as? String,
      birthdate: params["birthdate"] as? String,
      gender: params["gender"] as? String,
      city: params["city"] as? String,
      locality: params["locality"] as? String,
      postalCode: params["postalCode"] as? String,
      country: params["country"] as? String,
      language: params["language"] as? String,
      custom: custom
    )
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
