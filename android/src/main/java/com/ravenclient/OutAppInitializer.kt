package com.ravenclient

import com.ds.horizon.comms.platform.DsComms
import com.ds.horizon.comms.platform.DsCommsConfig
import com.ds.horizon.comms.platform.events.batch.BatchConfig
import com.ds.horizon.comms.platform.network.RetryConfig
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType

object OutAppInitializer {

    fun updateUserProfile(params: ReadableMap, context: ReactApplicationContext, promise: Promise) {
        try {
            if (!DsComms.isInitialized()) {
                promise.reject(OutAppBridgeConstants.ERROR_UPDATE_USER_PROFILE, "Raven SDK not initialized. Call initializeOutApp first.")
                return
            }
            val userId = params.getString(OutAppBridgeConstants.UserProfile.USER_ID)?.takeIf { it.isNotEmpty() }
                ?: run {
                    promise.reject(OutAppBridgeConstants.ERROR_UPDATE_USER_PROFILE, "userId is required")
                    return
                }
            val firstName = params.getString(OutAppBridgeConstants.UserProfile.FIRST_NAME)
            val lastName = params.getString(OutAppBridgeConstants.UserProfile.LAST_NAME)
            val email = params.getString(OutAppBridgeConstants.UserProfile.EMAIL)
            val phone = params.getString(OutAppBridgeConstants.UserProfile.PHONE)
            val birthdate = params.getString(OutAppBridgeConstants.UserProfile.BIRTHDATE)
            val gender = params.getString(OutAppBridgeConstants.UserProfile.GENDER)
            val city = params.getString(OutAppBridgeConstants.UserProfile.CITY)
            val locality = params.getString(OutAppBridgeConstants.UserProfile.LOCALITY)
            val postalCode = params.getString(OutAppBridgeConstants.UserProfile.POSTAL_CODE)
            val country = params.getString(OutAppBridgeConstants.UserProfile.COUNTRY)
            val language = params.getString(OutAppBridgeConstants.UserProfile.LANGUAGE)
            val customMap = params.getMap(OutAppBridgeConstants.UserProfile.CUSTOM)
            val custom = customMap?.let { readableMapToMap(it) }
            val manager = try {
                DsComms.getUserAttributesManager()
            } catch (e: Exception) {
                promise.reject(OutAppBridgeConstants.ERROR_UPDATE_USER_PROFILE, e.message ?: "User attributes not available", e)
                return
            }
            manager.updateUserAttributes(
                userId = userId,
                firstName = firstName,
                lastName = lastName,
                email = email,
                phone = phone,
                birthdate = birthdate,
                gender = gender,
                city = city,
                locality = locality,
                postalCode = postalCode,
                country = country,
                language = language,
                custom = custom
            ) { result ->
                context.runOnUiQueueThread {
                    result.fold(
                        onSuccess = { promise.resolve(null) },
                        onFailure = { e -> promise.reject("UPDATE_USER_PROFILE_ERROR", e.message, e) }
                    )
                }
            }
        } catch (e: Exception) {
            promise.reject(OutAppBridgeConstants.ERROR_UPDATE_USER_PROFILE, e.message, e)
        }
    }

    fun initializeOutApp(config: ReadableMap, context: ReactApplicationContext, promise: Promise) {
        try {
            validateMandatoryConfig(config)
            val dsCommsConfig = parseConfig(config)
            context.runOnUiQueueThread {
                try {
                    DsComms.initialize(context, dsCommsConfig)
                    promise.resolve(null)
                } catch (e: Exception) {
                    promise.reject(OutAppBridgeConstants.ERROR_OUT_APP_INIT, e.message, e)
                }
            }
        } catch (e: Exception) {
            promise.reject(OutAppBridgeConstants.ERROR_OUT_APP_INIT, e.message, e)
        }
    }

    private fun validateMandatoryConfig(config: ReadableMap) {
        config.getString(OutAppBridgeConstants.Config.FCM_BASE_URL)?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("fcmBaseUrl is required")
        config.getString(OutAppBridgeConstants.Config.API_KEY)?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("apiKey is required")
        val globalPropsMap = config.getMap(OutAppBridgeConstants.Config.GLOBAL_PROPS)
            ?: throw IllegalArgumentException("globalProps is required")
        globalPropsMap.getString(OutAppBridgeConstants.GlobalProps.DEVICE_ID)?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("globalProps.deviceId is required")
        globalPropsMap.getString(OutAppBridgeConstants.GlobalProps.APP_VERSION)?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("globalProps.appVersion is required")
        globalPropsMap.getString(OutAppBridgeConstants.GlobalProps.APP_PACKAGE_NAME)?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("globalProps.appPackageName is required")
        globalPropsMap.getString(OutAppBridgeConstants.GlobalProps.USER_ID)?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("globalProps.userId is required")
    }

    private fun parseConfig(config: ReadableMap): DsCommsConfig {
        val fcmBaseUrl = config.getString(OutAppBridgeConstants.Config.FCM_BASE_URL)?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("fcmBaseUrl is required")
        val eventBaseUrl = config.getString(OutAppBridgeConstants.Config.EVENT_BASE_URL)?.takeIf { it.isNotEmpty() } ?: fcmBaseUrl
        val apiKey = config.getString(OutAppBridgeConstants.Config.API_KEY)?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("apiKey is required")
        val notificationBaseUrl = config.getString(OutAppBridgeConstants.Config.NOTIFICATION_BASE_URL)?.takeIf { it.isNotEmpty() } ?: fcmBaseUrl
        val userAttributesBaseUrl = config.getString(OutAppBridgeConstants.Config.USER_ATTRIBUTES_BASE_URL)?.takeIf { it.isNotEmpty() } ?: fcmBaseUrl
        val enableLogging = if (config.hasKey(OutAppBridgeConstants.Config.ENABLE_LOGGING)) config.getBoolean(OutAppBridgeConstants.Config.ENABLE_LOGGING) else true
        val enableEventService = if (config.hasKey(OutAppBridgeConstants.Config.ENABLE_EVENT_SERVICE)) config.getBoolean(OutAppBridgeConstants.Config.ENABLE_EVENT_SERVICE) else true
        val enableNotificationTracking = if (config.hasKey(OutAppBridgeConstants.Config.ENABLE_NOTIFICATION_TRACKING)) config.getBoolean(OutAppBridgeConstants.Config.ENABLE_NOTIFICATION_TRACKING) else true
        val enableUserAttributesService = if (config.hasKey(OutAppBridgeConstants.Config.ENABLE_USER_ATTRIBUTES_SERVICE)) config.getBoolean(OutAppBridgeConstants.Config.ENABLE_USER_ATTRIBUTES_SERVICE) else true

        val globalPropsMap = config.getMap(OutAppBridgeConstants.Config.GLOBAL_PROPS)
        val globalProps = mutableMapOf<String, Any>()
        if (globalPropsMap != null) {
            val iterator = globalPropsMap.keySetIterator()
            while (iterator.hasNextKey()) {
                val key = iterator.nextKey()
                val value = globalPropsMap.getDynamic(key)
                when {
                    value.isNull -> continue
                    value.type == ReadableType.String -> {
                        val stringValue = value.asString()
                        if (stringValue != null) globalProps[key] = stringValue
                    }
                    value.type == ReadableType.Number -> globalProps[key] = value.asDouble()
                    value.type == ReadableType.Boolean -> globalProps[key] = value.asBoolean()
                    value.type == ReadableType.Map -> value.asMap()?.let { globalProps[key] = readableMapToMap(it) }
                    value.type == ReadableType.Array -> value.asArray()?.let { globalProps[key] = readableArrayToList(it) }
                    else -> globalProps[key] = value.toString()
                }
            }
        }
        config.getString(OutAppBridgeConstants.Config.API_KEY)?.takeIf { it.isNotEmpty() }?.let { globalProps[OutAppBridgeConstants.Config.API_KEY] = it }

        val fcmRetryConfigMap = config.getMap(OutAppBridgeConstants.Config.FCM_RETRY_CONFIG)
        val fcmRetryConfig = if (fcmRetryConfigMap != null) parseRetryConfig(fcmRetryConfigMap) else RetryConfig.DEFAULT

        val eventRetryConfigMap = config.getMap(OutAppBridgeConstants.Config.EVENT_RETRY_CONFIG)
        val eventRetryConfig = if (eventRetryConfigMap != null) parseRetryConfig(eventRetryConfigMap) else RetryConfig.DEFAULT

        val notificationRetryConfigMap = config.getMap(OutAppBridgeConstants.Config.NOTIFICATION_RETRY_CONFIG)
        val notificationRetryConfig = if (notificationRetryConfigMap != null) parseRetryConfig(notificationRetryConfigMap) else RetryConfig.DEFAULT

        val userAttributesRetryConfigMap = config.getMap(OutAppBridgeConstants.Config.USER_ATTRIBUTES_RETRY_CONFIG)
        val userAttributesRetryConfig = if (userAttributesRetryConfigMap != null) parseRetryConfig(userAttributesRetryConfigMap) else RetryConfig.DEFAULT

        val eventBatchConfigMap = config.getMap(OutAppBridgeConstants.Config.EVENT_BATCH_CONFIG)
        val eventBatchConfig = if (eventBatchConfigMap != null) parseBatchConfig(eventBatchConfigMap) else BatchConfig.DEFAULT

        return DsCommsConfig(
            fcmBaseUrl = fcmBaseUrl,
            eventBaseUrl = eventBaseUrl,
            apiKey = apiKey,
            notificationBaseUrl = notificationBaseUrl,
            userAttributesBaseUrl = userAttributesBaseUrl,
            enableLogging = enableLogging,
            enableEventService = enableEventService,
            enableNotificationTracking = enableNotificationTracking,
            enableUserAttributesService = enableUserAttributesService,
            fcmRetryConfig = fcmRetryConfig,
            eventRetryConfig = eventRetryConfig,
            notificationRetryConfig = notificationRetryConfig,
            userAttributesRetryConfig = userAttributesRetryConfig,
            eventBatchConfig = eventBatchConfig,
            globalProps = globalProps
        )
    }

    private fun parseRetryConfig(map: ReadableMap): RetryConfig = RetryConfig(
        enabled = if (map.hasKey(OutAppBridgeConstants.RetryConfig.ENABLED)) map.getBoolean(OutAppBridgeConstants.RetryConfig.ENABLED) else true,
        maxRetries = if (map.hasKey(OutAppBridgeConstants.RetryConfig.MAX_RETRIES)) map.getInt(OutAppBridgeConstants.RetryConfig.MAX_RETRIES) else 3,
        initialDelayMs = if (map.hasKey(OutAppBridgeConstants.RetryConfig.INITIAL_DELAY_MS)) map.getDouble(OutAppBridgeConstants.RetryConfig.INITIAL_DELAY_MS).toLong() else 1000L,
        maxDelayMs = if (map.hasKey(OutAppBridgeConstants.RetryConfig.MAX_DELAY_MS)) map.getDouble(OutAppBridgeConstants.RetryConfig.MAX_DELAY_MS).toLong() else 30000L,
        backoffMultiplier = if (map.hasKey(OutAppBridgeConstants.RetryConfig.BACKOFF_MULTIPLIER)) map.getDouble(OutAppBridgeConstants.RetryConfig.BACKOFF_MULTIPLIER) else 2.0
    )

    private fun parseBatchConfig(map: ReadableMap): BatchConfig = BatchConfig(
        batchSize = if (map.hasKey(OutAppBridgeConstants.BatchConfig.BATCH_SIZE)) map.getInt(OutAppBridgeConstants.BatchConfig.BATCH_SIZE) else BatchConfig.DEFAULT_BATCH_SIZE,
        maxRetries = if (map.hasKey(OutAppBridgeConstants.BatchConfig.MAX_RETRIES)) map.getInt(OutAppBridgeConstants.BatchConfig.MAX_RETRIES) else BatchConfig.DEFAULT_MAX_RETRIES,
        flushIntervalMs = if (map.hasKey(OutAppBridgeConstants.BatchConfig.FLUSH_INTERVAL_MS)) map.getDouble(OutAppBridgeConstants.BatchConfig.FLUSH_INTERVAL_MS).toLong() else BatchConfig.DEFAULT_FLUSH_INTERVAL_MS,
        batchWindowMs = if (map.hasKey(OutAppBridgeConstants.BatchConfig.BATCH_WINDOW_MS)) map.getDouble(OutAppBridgeConstants.BatchConfig.BATCH_WINDOW_MS).toLong() else BatchConfig.DEFAULT_BATCH_WINDOW_MS,
        enableBatching = if (map.hasKey(OutAppBridgeConstants.BatchConfig.ENABLE_BATCHING)) map.getBoolean(OutAppBridgeConstants.BatchConfig.ENABLE_BATCHING) else true,
        processOnBackground = if (map.hasKey(OutAppBridgeConstants.BatchConfig.PROCESS_ON_BACKGROUND)) map.getBoolean(OutAppBridgeConstants.BatchConfig.PROCESS_ON_BACKGROUND) else true,
        maxQueueSize = if (map.hasKey(OutAppBridgeConstants.BatchConfig.MAX_QUEUE_SIZE)) map.getInt(OutAppBridgeConstants.BatchConfig.MAX_QUEUE_SIZE) else BatchConfig.DEFAULT_MAX_QUEUE_SIZE,
        oldEventThresholdMs = if (map.hasKey(OutAppBridgeConstants.BatchConfig.OLD_EVENT_THRESHOLD_MS)) map.getDouble(OutAppBridgeConstants.BatchConfig.OLD_EVENT_THRESHOLD_MS).toLong() else BatchConfig.DEFAULT_OLD_EVENT_THRESHOLD_MS
    )

    private fun readableMapToMap(readableMap: ReadableMap): Map<String, Any> {
        val result = mutableMapOf<String, Any>()
        val iterator = readableMap.keySetIterator()
        while (iterator.hasNextKey()) {
            val key = iterator.nextKey()
            val value = readableMap.getDynamic(key)
            when {
                value.isNull -> continue
                value.type == ReadableType.String -> value.asString()?.let { result[key] = it }
                value.type == ReadableType.Number -> result[key] = value.asDouble()
                value.type == ReadableType.Boolean -> result[key] = value.asBoolean()
                value.type == ReadableType.Map -> value.asMap()?.let { result[key] = readableMapToMap(it) }
                value.type == ReadableType.Array -> value.asArray()?.let { result[key] = readableArrayToList(it) }
                else -> result[key] = value.toString()
            }
        }
        return result
    }

    private fun readableArrayToList(readableArray: com.facebook.react.bridge.ReadableArray): List<Any> {
        val result = mutableListOf<Any>()
        for (i in 0 until readableArray.size()) {
            val value = readableArray.getDynamic(i)
            when {
                value.isNull -> continue
                value.type == ReadableType.String -> value.asString()?.let { result.add(it) }
                value.type == ReadableType.Number -> result.add(value.asDouble())
                value.type == ReadableType.Boolean -> result.add(value.asBoolean())
                value.type == ReadableType.Map -> value.asMap()?.let { result.add(readableMapToMap(it)) }
                value.type == ReadableType.Array -> value.asArray()?.let { result.add(readableArrayToList(it)) }
                else -> result.add(value.toString())
            }
        }
        return result
    }
}
