import Foundation

enum OutAppBridgeConstants {

  static let errorOutAppInit = "OUT_APP_INIT_ERROR"
  static let errorUpdateUserProfile = "UPDATE_USER_PROFILE_ERROR"

  enum Config {
    static let fcmBaseUrl = "fcmBaseUrl"
    static let eventBaseUrl = "eventBaseUrl"
    static let apiKey = "apiKey"
    static let enableLogging = "enableLogging"
    static let globalProps = "globalProps"
    static let fcmRetryConfig = "fcmRetryConfig"
    static let eventRetryConfig = "eventRetryConfig"
  }

  enum GlobalProps {
    static let deviceId = "deviceId"
    static let appVersion = "appVersion"
    static let appPackageName = "appPackageName"
    static let userId = "userId"
    static let firstName = "firstName"
    static let lastName = "lastName"
    static let email = "email"
    static let phone = "phone"
    static let birthdate = "birthdate"
    static let gender = "gender"
    static let city = "city"
    static let locality = "locality"
    static let postalCode = "postalCode"
    static let country = "country"
    static let language = "language"
    static let custom = "custom"
  }

  enum RetryConfig {
    static let enabled = "enabled"
    static let maxRetries = "maxRetries"
    static let initialDelayMs = "initialDelayMs"
    static let maxDelayMs = "maxDelayMs"
    static let backoffMultiplier = "backoffMultiplier"
  }

  enum UserProfile {
    static let userId = "userId"
    static let firstName = "firstName"
    static let lastName = "lastName"
    static let email = "email"
    static let phone = "phone"
    static let birthdate = "birthdate"
    static let gender = "gender"
    static let city = "city"
    static let locality = "locality"
    static let postalCode = "postalCode"
    static let country = "country"
    static let language = "language"
    static let custom = "custom"
  }
}
