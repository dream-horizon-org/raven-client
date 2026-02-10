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
            val userId = params.getString("userId")?.takeIf { it.isNotEmpty() }
                ?: run {
                    promise.reject("UPDATE_USER_PROFILE_ERROR", "userId is required")
                    return
                }
            val firstName = params.getString("firstName")
            val lastName = params.getString("lastName")
            val email = params.getString("email")
            val phone = params.getString("phone")
            val birthdate = params.getString("birthdate")
            val gender = params.getString("gender")
            val city = params.getString("city")
            val locality = params.getString("locality")
            val postalCode = params.getString("postalCode")
            val country = params.getString("country")
            val language = params.getString("language")
            val customMap = params.getMap("custom")
            val custom = customMap?.let { readableMapToMap(it) }
            val manager = try {
                DsComms.getUserAttributesManager()
            } catch (e: Exception) {
                promise.reject("UPDATE_USER_PROFILE_ERROR", e.message ?: "User attributes not available", e)
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
            promise.reject("UPDATE_USER_PROFILE_ERROR", e.message, e)
        }
    }

    fun initializeOutApp(config: ReadableMap, context: ReactApplicationContext, promise: Promise) {
        try {
            val dsCommsConfig = parseConfig(config)
            context.runOnUiQueueThread {
                try {
                    DsComms.initialize(context, dsCommsConfig)
                    promise.resolve(null)
                } catch (e: Exception) {
                    promise.reject("OUT_APP_INIT_ERROR", e.message, e)
                }
            }
        } catch (e: Exception) {
            promise.reject("OUT_APP_INIT_ERROR", e.message, e)
        }
    }

    private fun parseConfig(config: ReadableMap): DsCommsConfig {
        val fcmBaseUrl = config.getString("fcmBaseUrl")
            ?: throw IllegalArgumentException("fcmBaseUrl is required")
        val eventBaseUrl = config.getString("eventBaseUrl")
            ?: throw IllegalArgumentException("eventBaseUrl is required")
        val apiKey = config.getString("apiKey")
            ?: throw IllegalArgumentException("apiKey is required")
        val enableLogging = if (config.hasKey("enableLogging")) config.getBoolean("enableLogging") else true
        val enableEventService = if (config.hasKey("enableEventService")) config.getBoolean("enableEventService") else true

        val globalPropsMap = config.getMap("globalProps")
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
        config.getString("apiKey")?.takeIf { it.isNotEmpty() }?.let { globalProps["apiKey"] = it }

        val fcmRetryConfigMap = config.getMap("fcmRetryConfig")
        val fcmRetryConfig = if (fcmRetryConfigMap != null) parseRetryConfig(fcmRetryConfigMap) else RetryConfig.DEFAULT

        val eventRetryConfigMap = config.getMap("eventRetryConfig")
        val eventRetryConfig = if (eventRetryConfigMap != null) parseRetryConfig(eventRetryConfigMap) else RetryConfig.DEFAULT

        val eventBatchConfigMap = config.getMap("eventBatchConfig")
        val eventBatchConfig = if (eventBatchConfigMap != null) parseBatchConfig(eventBatchConfigMap) else BatchConfig.DEFAULT

        return DsCommsConfig(
            fcmBaseUrl = fcmBaseUrl,
            eventBaseUrl = eventBaseUrl,
            apiKey = apiKey,
            enableLogging = enableLogging,
            enableEventService = enableEventService,
            fcmRetryConfig = fcmRetryConfig,
            eventRetryConfig = eventRetryConfig,
            eventBatchConfig = eventBatchConfig,
            globalProps = globalProps
        )
    }

    private fun parseRetryConfig(map: ReadableMap): RetryConfig = RetryConfig(
        enabled = if (map.hasKey("enabled")) map.getBoolean("enabled") else true,
        maxRetries = if (map.hasKey("maxRetries")) map.getInt("maxRetries") else 3,
        initialDelayMs = if (map.hasKey("initialDelayMs")) map.getDouble("initialDelayMs").toLong() else 1000L,
        maxDelayMs = if (map.hasKey("maxDelayMs")) map.getDouble("maxDelayMs").toLong() else 30000L,
        backoffMultiplier = if (map.hasKey("backoffMultiplier")) map.getDouble("backoffMultiplier") else 2.0
    )

    private fun parseBatchConfig(map: ReadableMap): BatchConfig = BatchConfig(
        batchSize = if (map.hasKey("batchSize")) map.getInt("batchSize") else BatchConfig.DEFAULT_BATCH_SIZE,
        maxRetries = if (map.hasKey("maxRetries")) map.getInt("maxRetries") else BatchConfig.DEFAULT_MAX_RETRIES,
        flushIntervalMs = if (map.hasKey("flushIntervalMs")) map.getDouble("flushIntervalMs").toLong() else BatchConfig.DEFAULT_FLUSH_INTERVAL_MS,
        batchWindowMs = if (map.hasKey("batchWindowMs")) map.getDouble("batchWindowMs").toLong() else BatchConfig.DEFAULT_BATCH_WINDOW_MS,
        enableBatching = if (map.hasKey("enableBatching")) map.getBoolean("enableBatching") else true,
        processOnBackground = if (map.hasKey("processOnBackground")) map.getBoolean("processOnBackground") else true,
        maxQueueSize = if (map.hasKey("maxQueueSize")) map.getInt("maxQueueSize") else BatchConfig.DEFAULT_MAX_QUEUE_SIZE,
        oldEventThresholdMs = if (map.hasKey("oldEventThresholdMs")) map.getDouble("oldEventThresholdMs").toLong() else BatchConfig.DEFAULT_OLD_EVENT_THRESHOLD_MS
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
