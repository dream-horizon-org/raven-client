package com.ravenstorage

import android.content.Context

class RavenStorage(context: Context, private val id: String, encryptionKey: String, multiprocess: Boolean = false) {

  init {
    StorageManager.initialize(context, id, encryptionKey, multiprocess)
  }

  fun setString(key: String, value: String) {
    StorageManager.setString(id, key, value)
  }

  fun getString(key: String, defValue: String): String? =
    StorageManager.getString(id, key, defValue)

  fun setLong(key: String, value: Long) {
    StorageManager.setString(id, key, value.toString())
  }

  fun getLong(key: String, defValue: Long): Long =
    try {
      StorageManager.getString(id, key, defValue.toString())?.toLong() ?: defValue
    } catch (e: Exception) {
      defValue
    }


  fun setDouble(key: String, value: Double) {
    StorageManager.setString(id, key, value.toString())
  }

  fun getDouble(key: String, defValue: Double): Double = try {
    StorageManager.getString(id, key, defValue.toString())?.toDouble() ?: defValue
  } catch (e: Exception) {
    defValue
  }


  fun setBoolean(key: String, value: Boolean) {
    StorageManager.setBoolean(id, key, value)
  }


  fun getBoolean(key: String, defValue: Boolean) =
    StorageManager.getBoolean(storeId = id, key, defValue)

  fun getAllKeys(): ArrayList<String> {
    return StorageManager.getAllKeys(storeId = id)
  }

  fun removeAll() {
    StorageManager.removeAll(storeId = id)
  }

  fun remove(key: String) {
    StorageManager.removeKey(id, key)
  }

  fun contains(key: String): Boolean = StorageManager.containsKey(id, key).booleanValue()
}
