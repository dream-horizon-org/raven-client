import {
  GlobalPropsKeys,
  type RavenConfig,
} from '@dreamhorizonorg/raven-client'

export const ravenConfig: RavenConfig = {
  baseUrl: '<YOUR_BASE_URL>',
  apiKey: '<YOUR_API_KEY>',
  globalProps: {
    [GlobalPropsKeys.USER_ID]: '<USER_ID>',
    [GlobalPropsKeys.APP_VERSION]: '1.0.0',
    [GlobalPropsKeys.APP_PACKAGE_NAME]: 'raven-client-example',
    [GlobalPropsKeys.DEVICE_ID]: '<DEVICE_ID>',
  },
  enableLogging: true,
  enableEventService: false,
  enableNotificationTracking: false,
}
