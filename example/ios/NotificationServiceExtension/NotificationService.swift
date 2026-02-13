import UserNotifications
import RavenIOSSDK

class NotificationServiceExtension: RavenNotificationServiceExtension {

    override init() {
        super.init()
        self.mediaUrlKey = "media_url"
        self.mediaTypeKey = "media_type"
        if let apiKey = getApiKey(), let userId = getUserId() {
            self.baseUrl = getBaseUrl()
            self.eventsBaseUrl = getEventsBaseUrl()
            self.apiKey = apiKey
            self.userId = userId
            self.retryConfig = RetryConfig.default
            self.enableLogging = true
        }
    }

    private func getBaseUrl() -> String? {
        "https://guardian-nv.d11platform.com"
    }

    private func getEventsBaseUrl() -> String? {
        "https://guardian-nv.d11platform.com"
    }

    private func getApiKey() -> String? {
        "example-api-key"
    }

    private func getUserId() -> String? {
        "example-user-id"
    }

    override func didReceive(
        _ request: UNNotificationRequest,
        withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        if self.apiKey == nil || self.userId == nil {
            if let apiKey = getApiKey(), let userId = getUserId() {
                self.baseUrl = getBaseUrl()
                self.eventsBaseUrl = getEventsBaseUrl()
                self.apiKey = apiKey
                self.userId = userId
                self.retryConfig = RetryConfig.default
                self.enableLogging = true
            }
        }
        super.didReceive(request, withContentHandler: contentHandler)
    }
}
