import Foundation

@objc public class RavenStorage: NSObject {
  private let storeId: String
  
  @objc public init(id: String,  encryptionKey: String, multiprocess: Bool = false) {
    self.storeId = id
    StorageManager.shared.initialize(storeId: id, encryptionKey: encryptionKey, multiprocess: multiprocess)
  }
  
  @objc public func setString(_ key: String, _ value: String) {
    StorageManager.shared.setString(storeId: storeId, key: key, value: value)
  }
  
  @objc public func getString(_ key: String, defaultValue: String) -> String {
    return StorageManager.shared.getString(storeId: storeId, key: key, defaultValue: defaultValue) ?? defaultValue
  }
  
  @objc public func setLong(_ key: String, _ value: Int64) {
    setString(key, String(value))
  }
  
  @objc public func getLong(_ key: String, defaultValue: Int64) -> Int64 {
    let str = getString(key, defaultValue: String(defaultValue))
    return Int64(str) ?? defaultValue
  }
  
  @objc public func setDouble(_ key: String, _ value: Double) {
    setString(key, String(value))
  }
  
  @objc public func getDouble(_ key: String, defaultValue: Double) -> Double {
    let str = getString(key, defaultValue: String(defaultValue))
    return Double(str) ?? defaultValue
  }
  
  @objc public func setBoolean(_ key: String, _ value: Bool) {
    StorageManager.shared.setBoolean(storeId: storeId, key: key, value: value)
  }
  
  @objc public func getBoolean(_ key: String, defaultValue: Bool) -> Bool {
    return StorageManager.shared.getBoolean(storeId: storeId, key: key, defaultValue: defaultValue)
  }
  
  @objc public func getAllKeys() -> [String] {
    return StorageManager.shared.getAllKeys(storeId: storeId)
  }
  
  @objc public func removeAll() {
    StorageManager.shared.removeAll(storeId: storeId)
  }
  
  @objc public func removeKey(_ key: String) {
    StorageManager.shared.removeKey(storeId: storeId, key: key)
  }
  
  @objc public func containsKey(_ key: String) -> Bool {
    return StorageManager.shared.containsKey(storeId: storeId, key: key)
  }
}
