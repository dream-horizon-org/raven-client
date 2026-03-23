/**
 * NSE plugin options. The generated `NotificationService.swift` is a thin
 * subclass only; `RavenNotificationServiceExtension` is configured by RavenIOSSDK
 * / the main app — `baseUrl`, `apiKey`, etc. are not written into Swift.
 * (Kept optional for backward-compatible app.json; `bundleIdentifier` is used for Xcode.)
 */
export type RavenNotificationServiceExtensionProps = {
  bundleIdentifier?: string
  baseUrl?: string
  eventsBaseUrl?: string
  apiKey?: string
  mediaUrlKey?: string
  mediaTypeKey?: string
  enableLogging?: boolean
}

export type RavenAndroidProps = {
  githubMavenRepoUrl?: string
  /** Maven version for `com.google.gms:google-services` classpath (default `4.4.4`). */
  googleServicesClasspathVersion?: string
  /**
   * Fully qualified class name for the FCM service in AndroidManifest.xml.
   * Default: Raven Android SDK `DsCommsFcmService`.
   */
  fcmMessagingServiceClass?: string
  enableCleartextTraffic?: boolean
}

export type RavenIosProps = {
  ravenIosSdkGitUrl?: string
  ravenIosSdkTag?: string
  enableLocalNetworking?: boolean
  disableFirebaseProxy?: boolean
  apsEnvironment?: 'development' | 'production'
  notificationServiceExtension?: RavenNotificationServiceExtensionProps
}

export type RavenPluginProps = {
  android?: RavenAndroidProps
  ios?: RavenIosProps
}
