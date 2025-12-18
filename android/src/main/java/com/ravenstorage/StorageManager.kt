package com.ravenstorage

import android.content.Context
import android.util.Log
import com.tencent.mmkv.MMKV

internal object StorageManager {

  private val mmkvMap = HashMap<String, MMKV>()

  private var isMMKVInitialized: Boolean = false

  private fun initializeMMKV(context: Context) {
    if (!isMMKVInitialized) {
      MMKV.initialize(context.applicationContext)
      isMMKVInitialized = true
    }

  }

  fun initialize(
    context: Context,
    storeId: String,
    encryptionKey: String,
    multiprocess: Boolean,
  ) {
    initializeMMKV(context)
    if (!mmkvMap.contains(storeId)) {
      val processMode = if (multiprocess) {
        MMKV.MULTI_PROCESS_MODE
      } else MMKV.SINGLE_PROCESS_MODE
      mmkvMap[storeId] = MMKV.mmkvWithID(storeId, processMode, encryptionKey)
    }
  }

  private fun getMMKVStore(storeId: String): MMKV? {
    return mmkvMap.getOrElse(storeId) {
      Log.d("RavenStorage", "MMKV store with ID $storeId not initialized.")
      null
    }
  }

  private inline fun handleError(invoke: () -> Unit) {
    try {
      invoke()
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }

  fun setString(storeId: String, key: String, value: String) = handleError {
    getMMKVStore(storeId)?.encode(key, value)
  }

  fun getString(
    storeId: String, key: String, defaultValue: String?
  ): String? = handleErrorAndReturn(defaultValue) {
    val value = getValue(storeId, key, defaultValue, ValueType.STRING)
    return@handleErrorAndReturn value
  }

  fun setBoolean(storeId: String, key: String, value: Boolean) = handleError {
    getMMKVStore(storeId)?.encode(key, value)
  }

  fun getBoolean(
    storeId: String, key: String, defaultValue: Boolean
  ): Boolean = handleErrorAndReturn(defaultValue) {
    val value = getValue(storeId, key, defaultValue, ValueType.BOOLEAN)
    return@handleErrorAndReturn value
  }


  internal fun setBoolRN(
    storeId: String, key: String, value: java.lang.Boolean
  ) = handleError {
    getMMKVStore(storeId)?.encode(key, value.booleanValue())
  }

  internal fun getBoolRN(
    storeId: String, key: String, defaultValue: java.lang.Boolean?
  ): java.lang.Boolean? = handleErrorAndReturn(defaultValue) {
    val value = getValue(storeId, key, defaultValue, ValueType.BOOLEAN)
    return@handleErrorAndReturn value
  }

  fun getAllKeys(storeId: String): ArrayList<String> = handleErrorAndReturn(
    ArrayList()
  ) {
    val keys = getMMKVStore(storeId)?.allKeys()  // This returns an Array<String>?
    return@handleErrorAndReturn if (keys != null) {
      ArrayList(keys.toList())  // Convert Array<String> to ArrayList<String>
    } else {
      ArrayList()  // Return an empty ArrayList if no keys are found
    }
  }

  fun removeAll(storeId: String) = handleError {
    getMMKVStore(storeId)?.clearAll()
  }

  fun removeKey(storeId: String, key: String) = handleError {
    getMMKVStore(storeId)?.removeValueForKey(key)
  }

  fun containsKey(storeId: String, key: String): java.lang.Boolean = handleErrorAndReturn(
    java.lang.Boolean(false)
  ) {
    val contains = getMMKVStore(storeId)?.containsKey(key) ?: false
    return@handleErrorAndReturn java.lang.Boolean(contains)
  }


  @Suppress("UNCHECKED_CAST")
  private fun <T> getValue(
    storeId: String, key: String, defaultValue: T, valueType: ValueType
  ): T {
    val mmkv = getMMKVStore(storeId)
    return when (valueType) {
      ValueType.BOOLEAN -> mmkv?.decodeBool(key, defaultValue as Boolean) as T
      ValueType.STRING -> mmkv?.decodeString(key, defaultValue as String) as T
    } ?: defaultValue
  }


  private inline fun <T> handleErrorAndReturn(defValue: T, invoke: () -> T): T {
    try {
      return invoke()
    } catch (e: Exception) {
      e.printStackTrace()
    }
    return defValue
  }
}

