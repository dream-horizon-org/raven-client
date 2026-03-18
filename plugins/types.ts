export type RavenNotificationServiceExtensionProps = {
  bundleIdentifier?: string;
  baseUrl?: string;
  eventsBaseUrl?: string;
  apiKey?: string;
  mediaUrlKey?: string;
  mediaTypeKey?: string;
  enableLogging?: boolean;
};

export type RavenAndroidProps = {
  githubMavenRepoUrl?: string;
  enableCleartextTraffic?: boolean;
};

export type RavenIosProps = {
  ravenIosSdkGitUrl?: string;
  ravenIosSdkTag?: string;
  enableLocalNetworking?: boolean;
  disableFirebaseProxy?: boolean;
  apsEnvironment?: 'development' | 'production';
  notificationServiceExtension?: RavenNotificationServiceExtensionProps;
};

export type RavenPluginProps = {
  android?: RavenAndroidProps;
  ios?: RavenIosProps;
};
