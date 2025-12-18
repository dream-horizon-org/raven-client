import Foundation
import UIKit
import React

/// Tracks the current screen/route name
class CurrentScreenTracker {
    static var currentRouteName: String = "Unknown"
}

/// React Native bridge module for screen inspection functionality.
/// Provides methods to capture screen hierarchy and screenshots from JavaScript.
@objc(ScreenInspector)
class ScreenInspectorModule: NSObject {
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    /// Called from JS whenever route changes
    @objc
    func setCurrentScreen(_ routeName: String) {
        CurrentScreenTracker.currentRouteName = routeName
    }
    
    /// Capture full view hierarchy + screenshot
    @objc
    func captureScreen(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            guard let window = self.keyWindow(),
                  let rootView = window.rootViewController?.view else {
                reject("NO_VIEW", "No root view found", nil)
                return
            }
            
            do {
                var hierarchy: [[String: Any]] = []
                self.traverseFlatHierarchy(view: rootView, parentId: nil, list: &hierarchy)
                
                let screenshot = self.takeScreenshot(of: rootView)
                
                let result: [String: Any] = [
                    "routeName": CurrentScreenTracker.currentRouteName,
                    "hierarchy": hierarchy,
                    "screenshot": screenshot ?? ""
                ]
                
                resolve(result)
            } catch {
                reject("CAPTURE_ERROR", error.localizedDescription, error)
            }
        }
    }
    
    // MARK: - Private Helpers
    
    private func keyWindow() -> UIWindow? {
        if #available(iOS 13.0, *) {
            return UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .flatMap { $0.windows }
                .first { $0.isKeyWindow }
        } else {
            return UIApplication.shared.keyWindow
        }
    }
    
    private func traverseFlatHierarchy(view: UIView, parentId: String?, list: inout [[String: Any]]) {
        let id = String(ObjectIdentifier(view).hashValue)
        let frame = view.convert(view.bounds, to: nil)
        
        var node: [String: Any] = [
            "id": id,
            "className": String(describing: type(of: view)),
            "visible": !view.isHidden && view.alpha > 0,
            "bounds": [
                "x": Int(frame.origin.x),
                "y": Int(frame.origin.y),
                "width": Int(frame.size.width),
                "height": Int(frame.size.height)
            ],
            "zIndex": Double(view.layer.zPosition)
        ]
        
        if let parentId = parentId {
            node["parentId"] = parentId
        }
        
        // Get targetId from accessibilityIdentifier or React Native nativeID
        var targetId = view.accessibilityIdentifier ?? ""
        if targetId.isEmpty, view.responds(to: Selector("nativeID")) {
            if let nativeID = view.value(forKey: "nativeID") as? String {
                targetId = nativeID
            }
        }
        node["targetId"] = targetId
        
        list.append(node)
        
        // Traverse children
        for subview in view.subviews {
            traverseFlatHierarchy(view: subview, parentId: id, list: &list)
        }
    }
    
    private func takeScreenshot(of view: UIView) -> String? {
        guard view.bounds.width > 0, view.bounds.height > 0 else {
            return nil
        }
        
        UIGraphicsBeginImageContextWithOptions(view.bounds.size, false, UIScreen.main.scale)
        defer { UIGraphicsEndImageContext() }
        
        guard let context = UIGraphicsGetCurrentContext() else {
            return nil
        }
        
        view.layer.render(in: context)
        
        guard let image = UIGraphicsGetImageFromCurrentImageContext(),
              let imageData = image.jpegData(compressionQuality: 0.7) else {
            return nil
        }
        
        return imageData.base64EncodedString()
    }
}

