import {RavenStorage as NativeRavenStorage} from './RavenStorage'
import type {StorageConfig, StorageItem, IStorage} from './types'

/**
 * Raven Storage - A powerful storage wrapper built on MMKV
 *
 * Features:
 * - Type-safe operations
 * - Batch operations
 * - Error handling
 * - Encryption support
 * - Multiple isolated storage instances
 *
 * @example
 * ```typescript
 * const storage = new RavenStorage({ storeId: 'my-app', encryptionKey: 'secret' })
 * storage.setString('username', 'john_doe')
 * const username = storage.getString('username', 'guest')
 * ```
 */
class RavenStorage implements IStorage {
  private storage: NativeRavenStorage
  private storeId: string

  constructor(config: StorageConfig) {
    this.storeId = config.storeId

    try {
      this.storage = new NativeRavenStorage(
        config.storeId,
        config.encryptionKey || '',
        config.multiprocess || false,
      )
    } catch (error) {
      console.error(
        `[RavenStorage] Error initializing storage '${config.storeId}':`,
        error,
      )
      throw error
    }
  }

  // ==================== String Operations ====================

  /**
   * Store a string value
   */
  setString(key: string, value: string): void {
    try {
      this.storage.setString(key, value)
    } catch (error) {
      console.error(`[RavenStorage] Error setting string '${key}':`, error)
      throw error
    }
  }

  /**
   * Retrieve a string value
   */
  getString(key: string, defaultValue: string = ''): string {
    try {
      return this.storage.getString(key, defaultValue)
    } catch (error) {
      console.error(`[RavenStorage] Error getting string '${key}':`, error)
      return defaultValue
    }
  }

  // ==================== Number Operations ====================

  /**
   * Store a number value
   */
  setNumber(key: string, value: number): void {
    try {
      this.storage.setNumber(key, value)
    } catch (error) {
      console.error(`[RavenStorage] Error setting number '${key}':`, error)
      throw error
    }
  }

  /**
   * Retrieve a number value
   */
  getNumber(key: string, defaultValue: number = 0): number {
    try {
      return this.storage.getNumber(key, defaultValue)
    } catch (error) {
      console.error(`[RavenStorage] Error getting number '${key}':`, error)
      return defaultValue
    }
  }

  // ==================== Boolean Operations ====================

  /**
   * Store a boolean value
   */
  setBoolean(key: string, value: boolean): void {
    try {
      this.storage.setBoolean(key, value)
    } catch (error) {
      console.error(`[RavenStorage] Error setting boolean '${key}':`, error)
      throw error
    }
  }

  /**
   * Retrieve a boolean value
   */
  getBoolean(key: string, defaultValue: boolean = false): boolean {
    try {
      return this.storage.getBoolean(key, defaultValue)
    } catch (error) {
      console.error(`[RavenStorage] Error getting boolean '${key}':`, error)
      return defaultValue
    }
  }

  // ==================== Object Operations (JSON) ====================

  /**
   * Store an object as JSON string
   */
  setObject<T = any>(key: string, value: T): void {
    try {
      const jsonString = JSON.stringify(value)
      this.storage.setString(key, jsonString)
    } catch (error) {
      console.error(`[RavenStorage] Error setting object '${key}':`, error)
      throw error
    }
  }

  /**
   * Retrieve an object from JSON string
   */
  getObject<T = any>(key: string, defaultValue: T): T {
    try {
      const jsonString = this.storage.getString(key, '')
      if (!jsonString) return defaultValue
      return JSON.parse(jsonString) as T
    } catch (error) {
      console.error(`[RavenStorage] Error getting object '${key}':`, error)
      return defaultValue
    }
  }

  // ==================== Advanced Operations ====================

  /**
   * Check if a key exists
   */
  contains(key: string): boolean {
    try {
      return this.storage.contains(key)
    } catch (error) {
      console.error(`[RavenStorage] Error checking key '${key}':`, error)
      return false
    }
  }

  /**
   * Remove a specific key
   */
  remove(key: string): void {
    try {
      this.storage.remove(key)
    } catch (error) {
      console.error(`[RavenStorage] Error removing key '${key}':`, error)
      throw error
    }
  }

  /**
   * Remove all keys from storage
   */
  removeAll(): void {
    try {
      this.storage.removeAll()
    } catch (error) {
      console.error('[RavenStorage] Error removing all keys:', error)
      throw error
    }
  }

  /**
   * Get all keys in storage
   */
  getAllKeys(): string[] {
    try {
      return this.storage.getAllKeys()
    } catch (error) {
      console.error('[RavenStorage] Error getting all keys:', error)
      return []
    }
  }

  // ==================== Batch Operations ====================

  /**
   * Set multiple values at once
   */
  setBatch(items: StorageItem[]): boolean {
    try {
      items.forEach((item) => {
        switch (item.type) {
          case 'string':
            this.setString(item.key, item.value as string)
            break
          case 'number':
            this.setNumber(item.key, item.value as number)
            break
          case 'boolean':
            this.setBoolean(item.key, item.value as boolean)
            break
        }
      })
      return true
    } catch (error) {
      console.error('[RavenStorage] Error in batch set:', error)
      return false
    }
  }

  /**
   * Get all key-value pairs as strings
   */
  getAll(): Record<string, string> | null {
    try {
      const keys = this.getAllKeys()
      if (keys.length === 0) return null

      const result: Record<string, string> = {}
      keys.forEach((key) => {
        result[key] = this.getString(key, '')
      })
      return result
    } catch (error) {
      console.error('[RavenStorage] Error getting all values:', error)
      return null
    }
  }

  /**
   * Delete multiple keys at once
   */
  deleteByKeys(keys: string[]): boolean {
    try {
      keys.forEach((key) => this.remove(key))
      return true
    } catch (error) {
      console.error('[RavenStorage] Error deleting multiple keys:', error)
      return false
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Get the store ID
   */
  getStoreId(): string {
    return this.storeId
  }

  /**
   * Get storage size (number of keys)
   */
  size(): number {
    return this.getAllKeys().length
  }

  /**
   * Check if storage is empty
   */
  isEmpty(): boolean {
    return this.size() === 0
  }

  /**
   * Clear and delete specific keys matching a pattern
   */
  clearByPattern(pattern: RegExp): number {
    try {
      const keys = this.getAllKeys()
      const matchingKeys = keys.filter((key) => pattern.test(key))
      matchingKeys.forEach((key) => this.remove(key))
      return matchingKeys.length
    } catch (error) {
      console.error('[RavenStorage] Error clearing by pattern:', error)
      return 0
    }
  }
}

/**
 * Factory function to create a storage instance
 */
export function createStorage(config: StorageConfig): RavenStorage {
  return new RavenStorage(config)
}

/**
 * Factory function to create a secure (encrypted) storage instance
 */
export function createSecureStorage(
  storeId: string,
  encryptionKey: string,
): RavenStorage {
  if (!encryptionKey) {
    throw new Error(
      '[RavenStorage] Encryption key is required for secure storage',
    )
  }
  return new RavenStorage({storeId, encryptionKey})
}
const config = {
  storeId: 'raven',
}
export const NudgeStorage = createStorage(config)
