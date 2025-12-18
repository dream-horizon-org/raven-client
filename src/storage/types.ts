/**
 * Supported storage value types
 */
export type StorageValue = string | number | boolean

/**
 * Storage item for batch operations
 */
export interface StorageItem {
  key: string
  value: StorageValue
  type: 'string' | 'number' | 'boolean'
}

/**
 * Configuration for creating a storage instance
 */
export interface StorageConfig {
  /** Unique identifier for this storage instance */
  storeId: string
  /** Optional encryption key for secure storage */
  encryptionKey?: string
  /** Enable multiprocess support (for app extensions/widgets) */
  multiprocess?: boolean
}

/**
 * Storage interface for dependency injection and testing
 */
export interface IStorage {
  // Basic operations
  setString(key: string, value: string): void
  getString(key: string, defaultValue: string): string

  setNumber(key: string, value: number): void
  getNumber(key: string, defaultValue: number): number

  setBoolean(key: string, value: boolean): void
  getBoolean(key: string, defaultValue: boolean): boolean

  // Advanced operations
  contains(key: string): boolean
  remove(key: string): void
  removeAll(): void
  getAllKeys(): string[]

  // Utility methods
  setBatch(items: StorageItem[]): boolean
  getAll(): Record<string, string> | null
  deleteByKeys(keys: string[]): boolean
}
