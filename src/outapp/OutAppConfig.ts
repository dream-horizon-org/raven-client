export const OutAppGlobalPropsKeys = {
  DEVICE_ID: 'deviceId',
  APP_VERSION: 'appVersion',
  APP_PACKAGE_NAME: 'appPackageName',
  USER_ID: 'userId',
  OS_VERSION: 'osVersion',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  PHONE: 'phone',
  BIRTHDATE: 'birthdate',
  GENDER: 'gender',
  CITY: 'city',
  LOCALITY: 'locality',
  POSTAL_CODE: 'postalCode',
  COUNTRY: 'country',
  LANGUAGE: 'language',
  CUSTOM: 'custom',
} as const

export type KnownOutAppGlobalPropsKey =
  (typeof OutAppGlobalPropsKeys)[keyof typeof OutAppGlobalPropsKeys]

export interface OutAppGlobalProps {
  [OutAppGlobalPropsKeys.DEVICE_ID]: string
  [OutAppGlobalPropsKeys.APP_VERSION]: string
  [OutAppGlobalPropsKeys.APP_PACKAGE_NAME]: string
  [OutAppGlobalPropsKeys.USER_ID]: string
  [OutAppGlobalPropsKeys.OS_VERSION]?: string
  [key: string]: string | number | boolean | object | undefined
}

export interface OutAppRetryConfig {
  enabled?: boolean
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
}

export interface OutAppEventBatchConfig {
  batchSize?: number
  maxRetries?: number
  flushIntervalMs?: number
  batchWindowMs?: number
  enableBatching?: boolean
  processOnBackground?: boolean
  maxQueueSize?: number
  oldEventThresholdMs?: number
}

export interface OutAppConfig {
  fcmBaseUrl: string
  eventBaseUrl?: string
  apiKey: string
  notificationBaseUrl?: string
  userAttributesBaseUrl?: string
  enableLogging?: boolean
  enableEventService?: boolean
  enableNotificationTracking?: boolean
  enableUserAttributesService?: boolean
  fcmRetryConfig?: OutAppRetryConfig
  eventRetryConfig?: OutAppRetryConfig
  notificationRetryConfig?: OutAppRetryConfig
  userAttributesRetryConfig?: OutAppRetryConfig
  eventBatchConfig?: OutAppEventBatchConfig
  globalProps: OutAppGlobalProps
}

export interface UpdateUserProfileParams {
  userId: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  birthdate?: string
  gender?: string
  city?: string
  locality?: string
  postalCode?: string
  country?: string
  language?: string
  custom?: Record<string, unknown>
}
