import Foundation
import UIKit
import React

/// React Native bridge module for tooltip functionality.
/// Provides methods to show, hide, and manage tooltips from JavaScript.
@objc(TooltipModule)
class TooltipModule: NSObject {
    private let orchestrator = TooltipOrchestrator()
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc
    func test(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve("TooltipModule is working!")
    }
    
    @objc
    func show(_ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("ERROR", "TooltipModule is nil", nil)
                return
            }

            // Extract required parameters from options
            guard let targetId = options["targetId"] as? String,
                  let title = options["title"] as? String else {
                reject("INVALID_PARAMS", "Missing required parameters: targetId or title", nil)
                return
            }
            
            let subTitle = options["subTitle"] as? String ?? ""

            let success = self.orchestrator.showTooltip(targetId: targetId, message: title, subtitle: subTitle, options: options)
            
            if success {
                resolve("Tooltip shown successfully for targetId: \(targetId)")
            } else {
                reject("TOOLTIP_ERROR", "Failed to show tooltip for targetId: \(targetId)", nil)
            }
        }
    }

    @objc
    func setCurrentScreen(_ screenName: String) {
        DispatchQueue.main.async { [weak self] in
            self?.orchestrator.setCurrentScreen(screenName)
        }
    }
    
    @objc
    func hide(_ targetId: String, callback: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async { [weak self] in
            self?.orchestrator.hideTooltip(targetId: targetId)
            callback([NSNull()])
        }
    }
    
    @objc
    func hideAll(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            self?.orchestrator.hideAllTooltips()
            resolve("All tooltips hidden successfully")
        }
    }
}
