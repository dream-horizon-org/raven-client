import UserNotifications
import RavenIOSSDK

class NotificationServiceExtension: RavenNotificationServiceExtension {

    override init() {
        super.init()
      
    }


    override func didReceive(
        _ request: UNNotificationRequest,
        withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        
        super.didReceive(request, withContentHandler: contentHandler)
    }
}
