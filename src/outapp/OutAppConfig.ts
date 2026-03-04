import type {
  GlobalProps,
  RetryConfig,
  EventBatchConfig,
} from '../cta/ravenclient.interface'

export interface OutAppConfig {
  fcmBaseUrl: string
  apiKey: string
  globalProps: GlobalProps
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
