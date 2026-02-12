import Foundation
import React

private let queue = DispatchQueue(label: "RavenTurbo", qos: .userInitiated)

@objc(RavenTurbo)
class RavenTurbo: NSObject {
  @objc
  func initializeOutApp(
    _ config: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    queue.async {
      OutAppInitializer.initializeOutApp(config: config, resolve: resolve, reject: reject)
    }
  }

  @objc
  func updateUserProfile(
    _ params: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    queue.async {
      OutAppInitializer.updateUserProfile(params: params, resolve: resolve, reject: reject)
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }
}
