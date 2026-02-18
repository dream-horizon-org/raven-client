package com.ravenclient

object OutAppBridgeConstants {

    const val ERROR_OUT_APP_INIT = "OUT_APP_INIT_ERROR"
    const val ERROR_UPDATE_USER_PROFILE = "UPDATE_USER_PROFILE_ERROR"

    object Config {
        const val FCM_BASE_URL = "fcmBaseUrl"
        const val EVENT_BASE_URL = "eventBaseUrl"
        const val API_KEY = "apiKey"
        const val NOTIFICATION_BASE_URL = "notificationBaseUrl"
        const val USER_ATTRIBUTES_BASE_URL = "userAttributesBaseUrl"
        const val ENABLE_LOGGING = "enableLogging"
        const val ENABLE_EVENT_SERVICE = "enableEventService"
        const val ENABLE_NOTIFICATION_TRACKING = "enableNotificationTracking"
        const val ENABLE_USER_ATTRIBUTES_SERVICE = "enableUserAttributesService"
        const val GLOBAL_PROPS = "globalProps"
        const val FCM_RETRY_CONFIG = "fcmRetryConfig"
        const val EVENT_RETRY_CONFIG = "eventRetryConfig"
        const val NOTIFICATION_RETRY_CONFIG = "notificationRetryConfig"
        const val USER_ATTRIBUTES_RETRY_CONFIG = "userAttributesRetryConfig"
        const val EVENT_BATCH_CONFIG = "eventBatchConfig"
    }

    object GlobalProps {
        const val DEVICE_ID = "deviceId"
        const val APP_VERSION = "appVersion"
        const val APP_PACKAGE_NAME = "appPackageName"
        const val USER_ID = "userId"
    }

    object RetryConfig {
        const val ENABLED = "enabled"
        const val MAX_RETRIES = "maxRetries"
        const val INITIAL_DELAY_MS = "initialDelayMs"
        const val MAX_DELAY_MS = "maxDelayMs"
        const val BACKOFF_MULTIPLIER = "backoffMultiplier"
    }

    object BatchConfig {
        const val BATCH_SIZE = "batchSize"
        const val MAX_RETRIES = "maxRetries"
        const val FLUSH_INTERVAL_MS = "flushIntervalMs"
        const val BATCH_WINDOW_MS = "batchWindowMs"
        const val ENABLE_BATCHING = "enableBatching"
        const val PROCESS_ON_BACKGROUND = "processOnBackground"
        const val MAX_QUEUE_SIZE = "maxQueueSize"
        const val OLD_EVENT_THRESHOLD_MS = "oldEventThresholdMs"
    }

    object UserProfile {
        const val USER_ID = "userId"
        const val FIRST_NAME = "firstName"
        const val LAST_NAME = "lastName"
        const val EMAIL = "email"
        const val PHONE = "phone"
        const val BIRTHDATE = "birthdate"
        const val GENDER = "gender"
        const val CITY = "city"
        const val LOCALITY = "locality"
        const val POSTAL_CODE = "postalCode"
        const val COUNTRY = "country"
        const val LANGUAGE = "language"
        const val CUSTOM = "custom"
    }
}
