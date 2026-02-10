import type { OutAppConfig, UpdateUserProfileParams } from '@dreamhorizonorg/raven-client';
import { OutAppGlobalPropsKeys } from '@dreamhorizonorg/raven-client';

export const outappConfig: OutAppConfig = {
  fcmBaseUrl: 'https://your-fcm-base-url/',
  eventBaseUrl: 'https://your-event-base-url/',
  apiKey: 'your-api-key',
  globalProps: {
    [OutAppGlobalPropsKeys.DEVICE_ID]: 'your-device-id',
    [OutAppGlobalPropsKeys.APP_VERSION]: '1.0.0',
    [OutAppGlobalPropsKeys.APP_PACKAGE_NAME]: 'your.package.name',
    [OutAppGlobalPropsKeys.USER_ID]: 'your-user-id',
    [OutAppGlobalPropsKeys.FIRST_NAME]: 'First',
  },
  enableLogging: true,
  enableEventService: true,
};

export const userProfileSample: UpdateUserProfileParams = {
  userId: 'your-user-id',
  firstName: 'First',
  lastName: 'Last',
};
