package com.ravenstorage

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class StorageModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val NAME = "StorageModule"
    
    init {
      try {
        System.loadLibrary("raven_storage")
      } catch (ignored: Exception) {
      }
    }
  }

  private external fun installStorageModule(runtimePtr: Long)

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun installJSIModule(): Boolean {
    val context = reactApplicationContext ?: return false
    val reactContext = context.javaScriptContextHolder
    val reactContextValue = reactContext?.get() ?: 0L

    return if (reactContextValue != 0L) {
      installStorageModule(reactContextValue)
      true
    } else {
      false
    }
  }

  fun initialize(storeId: String, encryptionKey: String, multiprocess: java.lang.Boolean) {
    StorageManager.initialize(
      reactApplicationContext,
      storeId,
      encryptionKey, multiprocess.booleanValue()
    )
  }

  fun setString(storeId: String, key: String, value: String) =
    StorageManager.setString(storeId, key, value)

  fun getString(
    storeId: String,
    key: String,
    defaultValue: String?
  ): String? = StorageManager.getString(storeId, key, defaultValue)

  fun setNumber(
    storeId: String,
    key: String,
    stringValue: String
  ) = StorageManager.setString(storeId, key, stringValue)

  fun getNumber(
    storeId: String,
    key: String,
    defaultValue: String
  ): String = StorageManager.getString(storeId, key, defaultValue) ?: defaultValue

  fun setBoolean(storeId: String, key: String, value: java.lang.Boolean) =
    StorageManager.setBoolRN(storeId, key, value)


  fun getBoolean(
    storeId: String,
    key: String,
    defaultValue: java.lang.Boolean?
  ): java.lang.Boolean? = StorageManager.getBoolRN(storeId, key, defaultValue)

  fun getAllKeys(storeId: String): ArrayList<String> =
    StorageManager.getAllKeys(storeId)

  fun removeAll(storeId: String) =
    StorageManager.removeAll(storeId)


  fun removeKey(storeId: String, key: String) =
    StorageManager.removeKey(storeId, key)

  fun containsKey(storeId: String, key: String): java.lang.Boolean =
    StorageManager.containsKey(storeId, key)


  override fun getName(): String {
    return "StorageModule"
  }
}

