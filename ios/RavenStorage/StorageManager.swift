import Foundation
import MMKV

struct StorageError: Error {
  let message: String
}

enum ValueType {
  case boolean, string, double, long
}

class StorageManager {
  static let shared = StorageManager()
  
  private var mmkvMap: [String: MMKV] = [:]
  private var isMMKVInitialized = false
  private var isMMKVInitializedForMultiProcess: Bool = false
  private init() {}
  
  private func initMMKVForSingleProcess(){
    MMKV.initialize(rootDir: nil,logLevel: MMKVLogLevel.info)
  }
  
  private func initMMKVForMultiProcess() -> Bool {
    if let appGroupId = Bundle.main.object(forInfoDictionaryKey: "AppGroupID") as? String {
      print("App Group ID: \(appGroupId)")
      if let groupURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupId) {
        MMKV.initialize(rootDir: groupURL.path)
        return true
      }
    }
    return false
  }
  
  func initMMKV() {
    if (!isMMKVInitialized) {
      isMMKVInitializedForMultiProcess = initMMKVForMultiProcess()
      if(!isMMKVInitializedForMultiProcess) {
        initMMKVForSingleProcess()
      }
      isMMKVInitialized = true
    }
  }
  
  func initialize(storeId: String, encryptionKey: String, multiprocess: Bool) {
    initMMKV()
    if mmkvMap[storeId] == nil {
      let mode: MMKVMode = multiprocess ? .multiProcess : .singleProcess
      NSLog("Initialing \(storeId) with \(mode)")
      if(mode == .multiProcess && !isMMKVInitializedForMultiProcess) {
        fatalError("RavenStorage is not initialized for multi-process usage. Please set the `AppGroupId` key in your Info.plist with the appropriate App Group ID for your target.")
      }
      let mmkv = MMKV(mmapID: storeId, cryptKey: encryptionKey.data(using: .utf8), mode: mode)
      mmkvMap[storeId] = mmkv
    }
  }
  
  private func getMMKVStore(storeId: String) -> MMKV? {
    if let store = mmkvMap[storeId] {
      return store
    } else {
      print("RavenStorage: Storage store ID \(storeId) not initialized.")
      return nil
    }
  }
  
  func setString(storeId: String, key: String, value: String) {
      getMMKVStore(storeId: storeId)?.set(value, forKey: key)
  }
  
  func getString(storeId: String, key: String, defaultValue: String?) -> String? {
    return getValue(storeId: storeId, key: key, defaultValue: defaultValue)
  }
  
  func setBoolean(storeId: String, key: String, value: Bool) {
    getMMKVStore(storeId: storeId)?.set(value, forKey: key)
  }
  
  func getBoolean(storeId: String, key: String, defaultValue: Bool) -> Bool {
    return getValue(storeId: storeId, key: key, defaultValue: defaultValue)
  }
  
  func getAllKeys(storeId: String) -> [String] {
    getMMKVStore(storeId: storeId)?.allKeys().compactMap { $0 as? String } ?? []
  }
  
  func removeAll(storeId: String) {
    getMMKVStore(storeId: storeId)?.clearAll()
  }
  
  func removeKey(storeId: String, key: String) {
    getMMKVStore(storeId: storeId)?.removeValue(forKey: key)
  }
  
  func containsKey(storeId: String, key: String) -> Bool {
    return getMMKVStore(storeId: storeId)?.contains(key: key) ?? false
  }
  
  private func getValue<T>(storeId: String, key: String, defaultValue: T) -> T {
    guard let mmkv = getMMKVStore(storeId: storeId) else {
      return defaultValue
    }
    switch defaultValue {
    case is String:
      return (mmkv.string(forKey: key) as? T) ?? defaultValue
    case is Bool:
      return (mmkv.bool(forKey: key) as? T) ?? defaultValue
    case is Double:
      return (mmkv.double(forKey: key) as? T) ?? defaultValue
    case is Int64:
      return (mmkv.int64(forKey: key) as? T) ?? defaultValue
    default:
      print("Unsupported type for key \(key)")
      return defaultValue
    }
  }
}

