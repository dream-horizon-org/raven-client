import Foundation
import MMKV
import React

@objc(StorageModule)
public class StorageModule: NSObject {
    private static var instance: StorageModule? = nil

    // Private initializer for Singleton with encryption key
    private override init() {
        super.init()
        // Store this instance as the shared instance for native access
      StorageModule.setReactNativeInstance(self)
    }


    @objc
    public static func getInstance() -> StorageModule {
        if(instance == nil){
            instance = StorageModule()
        }
        return instance!
    }

    // Helper method to store and reuse the React Native-created instance
    @objc public static func setReactNativeInstance(_ instance: StorageModule) {
        if self.instance == nil {
            self.instance = instance
        }
    }
  
    @objc
    public func setString(storeId: String, forKey key: String, value: String) {
      StorageManager.shared.setString(storeId: storeId, key: key, value: value)
    }

    @objc
    public func initialize(storeId: String, encryptionKey:String, multiprocess:Bool) {
      StorageManager.shared.initialize(storeId: storeId,  encryptionKey: encryptionKey, multiprocess: multiprocess)
    }

    @objc
    public func getString(storeId: String, forKey key: String, defaultValue: String) -> String {
      let value = StorageManager.shared.getString(storeId: storeId, key: key, defaultValue: defaultValue) ?? defaultValue
        return value
    }


    @objc
    public func setBoolean(storeId: String, forKey key: String, value: Bool) {
      StorageManager.shared.setBoolean(storeId: storeId, key: key, value: value)
    }

    @objc public func getBoolean(storeId:String, forKey key: String, defaultValue: Bool) -> Bool {

      let value = StorageManager.shared.getBoolean(storeId: storeId, key: key, defaultValue: defaultValue)
        return value
    }


    @objc
    public func setNumber(storeId:String, forKey key: String, value: String) {
      StorageManager.shared.setString(storeId: storeId, key: key, value: value)
    }

    @objc
    public func getNumber(storeId:String, forKey key: String, defaultValue: String) -> String {
      let value = StorageManager.shared.getString(storeId: storeId, key: key, defaultValue: defaultValue)
      return value ?? defaultValue
    }


    @objc
  public func getAllKeys(storeId:String) -> [String] {
        return StorageManager.shared.getAllKeys(storeId: storeId)
    }

    @objc
    public func containsKey(storeId:String, forKey key: String) -> Bool {
      return StorageManager.shared.containsKey(storeId: storeId, key: key)
    }


    @objc
    public func removeKey(storeId:String, forKey key: String) {
      StorageManager.shared.removeKey(storeId: storeId, key: key)
    }

    // Remove all keys
    @objc
    public func removeAll(storeId:String) {
      StorageManager.shared.removeAll(storeId: storeId)
    }

    // Required for React Native
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}

