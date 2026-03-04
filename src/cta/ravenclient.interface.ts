export const GlobalPropsKeys = {
  USER_ID: 'userId',
  APP_VERSION: 'appVersion',
  APP_PACKAGE_NAME: 'appPackageName',
  DEVICE_ID: 'deviceId',
  PLATFORM: 'platform',
  TENANT_ID: 'tenantId',
  CODEPUSH_VERSION: 'codepushVersion',
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

export type KnownGlobalPropsKey =
  (typeof GlobalPropsKeys)[keyof typeof GlobalPropsKeys]

export interface GlobalProps {
  [GlobalPropsKeys.USER_ID]: string
  [GlobalPropsKeys.APP_VERSION]: string
  [GlobalPropsKeys.APP_PACKAGE_NAME]: string
  [GlobalPropsKeys.DEVICE_ID]: string
  [GlobalPropsKeys.PLATFORM]?: string
  [GlobalPropsKeys.TENANT_ID]?: string
  [GlobalPropsKeys.CODEPUSH_VERSION]?: string
  [GlobalPropsKeys.OS_VERSION]?: string
  [key: string]: string | number | boolean | object | undefined
}

export interface RetryConfig {
  enabled?: boolean
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
}

export interface EventBatchConfig {
  batchSize?: number
  maxRetries?: number
  flushIntervalMs?: number
  batchWindowMs?: number
  enableBatching?: boolean
  processOnBackground?: boolean
  maxQueueSize?: number
  oldEventThresholdMs?: number
}

export interface RavenListeners {
  appEvent?: (eventName: string, props?: unknown) => void
}

export interface RavenConfig {
  baseUrl: string
  apiKey: string
  globalProps: GlobalProps

  listeners?: RavenListeners

  eventBaseUrl?: string
  notificationBaseUrl?: string
  userAttributesBaseUrl?: string

  enableLogging?: boolean
  enableEventService?: boolean
  enableNotificationTracking?: boolean
  enableUserAttributesService?: boolean

  fcmRetryConfig?: RetryConfig
  eventRetryConfig?: RetryConfig
  notificationRetryConfig?: RetryConfig
  userAttributesRetryConfig?: RetryConfig
  eventBatchConfig?: EventBatchConfig
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
