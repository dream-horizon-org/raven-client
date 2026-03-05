import Foundation
import React
import RavenIOSSDK

enum OutAppInitializer {
  static func initializeOutApp(
    config: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let fcmBaseUrl = config[OutAppBridgeConstants.Config.fcmBaseUrl] as? String, !fcmBaseUrl.isEmpty else {
      reject(OutAppBridgeConstants.errorOutAppInit, "fcmBaseUrl is required", nil)
      return
    }
    let eventBaseUrl = (config[OutAppBridgeConstants.Config.eventBaseUrl] as? String).flatMap { $0.isEmpty ? nil : $0 } ?? fcmBaseUrl
    guard let apiKey = config[OutAppBridgeConstants.Config.apiKey] as? String, !apiKey.isEmpty else {
      reject(OutAppBridgeConstants.errorOutAppInit, "apiKey is required", nil)
      return
    }
    guard let globalPropsDict = config[OutAppBridgeConstants.Config.globalProps] as? NSDictionary else {
      reject(OutAppBridgeConstants.errorOutAppInit, "globalProps is required", nil)
      return
    }
    guard let deviceId = globalPropsDict[OutAppBridgeConstants.GlobalProps.deviceId] as? String, !deviceId.isEmpty else {
      reject(OutAppBridgeConstants.errorOutAppInit, "globalProps.deviceId is required", nil)
      return
    }
    guard let appVersion = globalPropsDict[OutAppBridgeConstants.GlobalProps.appVersion] as? String, !appVersion.isEmpty else {
      reject(OutAppBridgeConstants.errorOutAppInit, "globalProps.appVersion is required", nil)
      return
    }
    guard let appPackageName = globalPropsDict[OutAppBridgeConstants.GlobalProps.appPackageName] as? String, !appPackageName.isEmpty else {
      reject(OutAppBridgeConstants.errorOutAppInit, "globalProps.appPackageName is required", nil)
      return
    }
    guard let userId = globalPropsDict[OutAppBridgeConstants.GlobalProps.userId] as? String, !userId.isEmpty else {
      reject(OutAppBridgeConstants.errorOutAppInit, "globalProps.userId is required", nil)
      return
    }
    let enableLogging = (config[OutAppBridgeConstants.Config.enableLogging] as? Bool) ?? true
    let fcmRetryConfig = parseRetryConfig(config[OutAppBridgeConstants.Config.fcmRetryConfig] as? NSDictionary) ?? RetryConfig.default
    let analyticsRetryConfig = parseRetryConfig(config[OutAppBridgeConstants.Config.eventRetryConfig] as? NSDictionary) ?? RetryConfig.default
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
        reject(OutAppBridgeConstants.errorOutAppInit, error.localizedDescription, error)
      }
    }
  }

  static func updateUserProfile(
    params: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let userId = params[OutAppBridgeConstants.UserProfile.userId] as? String, !userId.isEmpty else {
      reject(OutAppBridgeConstants.errorUpdateUserProfile, "userId is required", nil)
      return
    }
    guard Raven.isInitialized() else {
      reject(OutAppBridgeConstants.errorUpdateUserProfile, "Raven SDK not initialized. Call initializeOutApp first.", nil)
      return
    }
    let request = parseUserLoginRequest(params: params, userId: userId)
    Task {
      do {
        _ = try await Raven.loginUser(request)
        await MainActor.run { resolve(nil) }
      } catch {
        await MainActor.run {
          reject(OutAppBridgeConstants.errorUpdateUserProfile, error.localizedDescription, error as NSError)
        }
      }
    }
  }

  static func logout(
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    Raven.logout()
    resolve(nil)
  }

  private static func parseUserLoginRequest(params: NSDictionary, userId: String) -> UserLoginRequest {
    let custom = params[OutAppBridgeConstants.UserProfile.custom] as? [String: Any]
    return UserLoginRequest(
      userId: userId,
      firstName: params[OutAppBridgeConstants.UserProfile.firstName] as? String,
      lastName: params[OutAppBridgeConstants.UserProfile.lastName] as? String,
      email: params[OutAppBridgeConstants.UserProfile.email] as? String,
      phone: params[OutAppBridgeConstants.UserProfile.phone] as? String,
      birthdate: params[OutAppBridgeConstants.UserProfile.birthdate] as? String,
      gender: params[OutAppBridgeConstants.UserProfile.gender] as? String,
      city: params[OutAppBridgeConstants.UserProfile.city] as? String,
      locality: params[OutAppBridgeConstants.UserProfile.locality] as? String,
      postalCode: params[OutAppBridgeConstants.UserProfile.postalCode] as? String,
      country: params[OutAppBridgeConstants.UserProfile.country] as? String,
      language: params[OutAppBridgeConstants.UserProfile.language] as? String,
      custom: custom
    )
  }

  private static func parseRetryConfig(_ map: NSDictionary?) -> RetryConfig? {
    guard let map = map else { return nil }
    let enabled = map[OutAppBridgeConstants.RetryConfig.enabled] as? Bool ?? true
    let maxRetries = map[OutAppBridgeConstants.RetryConfig.maxRetries] as? Int ?? 3
    let initialDelayMs = (map[OutAppBridgeConstants.RetryConfig.initialDelayMs] as? NSNumber)?.int64Value ?? 1000
    let maxDelayMs = (map[OutAppBridgeConstants.RetryConfig.maxDelayMs] as? NSNumber)?.int64Value ?? 30000
    let backoffMultiplier = (map[OutAppBridgeConstants.RetryConfig.backoffMultiplier] as? NSNumber)?.doubleValue ?? 2.0
    return RetryConfig(
      enabled: enabled,
      maxRetries: maxRetries,
      initialDelayMs: initialDelayMs,
      maxDelayMs: maxDelayMs,
      backoffMultiplier: backoffMultiplier
    )
  }

  private static func parseGlobalProps(_ dict: NSDictionary) -> GlobalProps {
    let custom = dict[OutAppBridgeConstants.GlobalProps.custom] as? [String: Any]
    return GlobalProps(
      firstName: dict[OutAppBridgeConstants.GlobalProps.firstName] as? String,
      lastName: dict[OutAppBridgeConstants.GlobalProps.lastName] as? String,
      email: dict[OutAppBridgeConstants.GlobalProps.email] as? String,
      phone: dict[OutAppBridgeConstants.GlobalProps.phone] as? String,
      birthdate: dict[OutAppBridgeConstants.GlobalProps.birthdate] as? String,
      gender: dict[OutAppBridgeConstants.GlobalProps.gender] as? String,
      city: dict[OutAppBridgeConstants.GlobalProps.city] as? String,
      locality: dict[OutAppBridgeConstants.GlobalProps.locality] as? String,
      postalCode: dict[OutAppBridgeConstants.GlobalProps.postalCode] as? String,
      country: dict[OutAppBridgeConstants.GlobalProps.country] as? String,
      language: dict[OutAppBridgeConstants.GlobalProps.language] as? String,
      custom: custom
    )
  }
}
