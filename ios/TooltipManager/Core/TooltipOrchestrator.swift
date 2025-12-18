import Foundation
import UIKit

/// Orchestrates tooltip display logic, screen management, and element targeting.
/// This class coordinates between ElementLocator and TooltipViewManager to show
/// tooltips at the right time and place.
final class TooltipOrchestrator {
    // MARK: - Properties
    private let viewManager = TooltipViewManager()
    private var currentScreen: String?
    private var screenTooltipQueue: [String: [(targetId: String, configuration: TooltipConfiguration)]] = [:]
    
    // MARK: - Lifecycle
    init() {
        ElementLocator.setupLifecycle()
    }
    
    deinit {
        ElementLocator.teardownLifecycle()
    }
    
    // MARK: - Public API
    
    /// Shows a tooltip for the specified target element.
    /// - Parameters:
    ///   - targetId: The identifier of the target element (nativeID or accessibilityIdentifier)
    ///   - message: The main tooltip message/title
    ///   - subtitle: Optional subtitle text
    ///   - options: Configuration options (position, colors, margins, etc.)
    /// - Returns: `true` if tooltip was shown or scheduled, `false` if element not found or not visible
    func showTooltip(targetId: String, message: String, subtitle: String = "", options: NSDictionary) -> Bool {
        // Ensure main thread execution
        if !Thread.isMainThread {
            var result = false
            DispatchQueue.main.sync {
                result = self.showTooltip(targetId: targetId, message: message, subtitle: subtitle, options: options)
            }
            return result
        }
        
        let configuration = TooltipConfiguration(message: message, subtitle: subtitle.isEmpty ? nil : subtitle, options: options)
        
        // Check screen context - queue if on wrong screen
        if let requiredScreen = configuration.screen {
            // Queue if currentScreen is nil or doesn't match
            if self.currentScreen == nil || self.currentScreen != requiredScreen {
                queueTooltip(targetId: targetId, configuration: configuration, forScreen: requiredScreen)
                return false
            }
        }
        
        // Handle delayed tooltip display
        if let triggerDelay = configuration.triggerDelay {
            let delayInSeconds = TimeInterval(triggerDelay) / 1000.0
            
            DispatchQueue.main.asyncAfter(deadline: .now() + delayInSeconds) { [weak self] in
                guard let self = self else { return }
                
                // Re-validate screen context
                if let requiredScreen = configuration.screen {
                    guard let currentScreen = self.currentScreen, requiredScreen == currentScreen else {
                        return // Screen changed, don't show
                    }
                }
                
                // Re-validate element visibility
                if let element = ElementLocator.findElement(for: targetId), element.isVisible {
                    self.viewManager.showTooltip(for: element, configuration: configuration, delegate: self)
                }
            }
            
            return true
        }
        
        // Show immediately
        if let element = ElementLocator.findElement(for: targetId), element.isVisible {
            viewManager.showTooltip(for: element, configuration: configuration, delegate: self)
            return true
        }
        
        return false
    }
    
    /// Hides the tooltip for a specific target element.
    /// - Parameter targetId: The identifier of the target element
    func hideTooltip(targetId: String) {
        if Thread.isMainThread {
            viewManager.hideTooltip(targetId: targetId)
        } else {
            DispatchQueue.main.async { [weak self] in
                self?.hideTooltip(targetId: targetId)
            }
        }
    }
    
    /// Hides all currently displayed tooltips.
    func hideAllTooltips() {
        if Thread.isMainThread {
            viewManager.hideAllTooltips()
        } else {
            DispatchQueue.main.async { [weak self] in
                self?.hideAllTooltips()
            }
        }
    }
    
    /// Updates the current screen context for tooltip management.
    /// Dismisses existing tooltips and processes any queued tooltips for the new screen.
    /// - Parameter screenName: The name/identifier of the current screen
    func setCurrentScreen(_ screenName: String) {
        if Thread.isMainThread {
            setCurrentScreenInternal(screenName)
        } else {
            DispatchQueue.main.async { [weak self] in
                self?.setCurrentScreenInternal(screenName)
            }
        }
    }
    
    // MARK: - Screen Management
    private func setCurrentScreenInternal(_ screenName: String) {
        // Dismiss all tooltips on screen change
        if currentScreen != screenName {
            viewManager.hideAllTooltips()
        }
        
        currentScreen = screenName
        
        // Process queued tooltips for the new screen
        if let queuedTooltips = screenTooltipQueue[screenName] {
            for queuedTooltip in queuedTooltips {
                let targetId = queuedTooltip.targetId
                let configuration = queuedTooltip.configuration
                
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
                    guard let self = self else { return }
                    
                    // Handle delayed tooltip display if configured
                    if let triggerDelay = configuration.triggerDelay {
                        let delayInSeconds = TimeInterval(triggerDelay) / 1000.0
                        
                        DispatchQueue.main.asyncAfter(deadline: .now() + delayInSeconds) { [weak self] in
                            guard let self = self else { return }
                            
                            // Re-validate screen context
                            if let requiredScreen = configuration.screen {
                                guard let currentScreen = self.currentScreen, requiredScreen == currentScreen else {
                                    return // Screen changed, don't show
                                }
                            }
                            
                            // Re-validate element visibility and show
                            if let element = ElementLocator.findElement(for: targetId), element.isVisible {
                                self.viewManager.showTooltip(for: element, configuration: configuration, delegate: self)
                            }
                        }
                    } else {
                        // Show immediately
                        if let element = ElementLocator.findElement(for: targetId), element.isVisible {
                            self.viewManager.showTooltip(for: element, configuration: configuration, delegate: self)
                        }
                    }
                }
            }
            
            screenTooltipQueue.removeValue(forKey: screenName)
        }
    }
    
    private func queueTooltip(targetId: String, configuration: TooltipConfiguration, forScreen screen: String) {
        if screenTooltipQueue[screen] == nil {
            screenTooltipQueue[screen] = []
        }
        screenTooltipQueue[screen]?.append((targetId: targetId, configuration: configuration))
    }
    
    // MARK: - Debug API
    /// Returns all available target IDs in the current view hierarchy.
    /// Useful for debugging and discovering available tooltip targets.
    /// - Returns: Array of target IDs (accessibilityIdentifiers and nativeIDs)
    func getAllTargetIds() -> [String] {
        if Thread.isMainThread {
            return ElementLocator.collectAllTargetIds()
        } else {
            var result: [String] = []
            DispatchQueue.main.sync {
                result = ElementLocator.collectAllTargetIds()
            }
            return result
        }
    }
    
    /// Finds and returns information about a specific element.
    /// - Parameter targetId: The identifier of the target element
    /// - Returns: Dictionary containing element details (found, type, visibility, position, text)
    func findElement(targetId: String) -> [String: Any] {
        var result: [String: Any] = [
            "found": false,
            "elementType": NSNull(),
            "isVisible": false,
            "position": NSNull(),
            "text": NSNull(),
            "targetId": NSNull()
        ]
        
        let work = {
            if let element = ElementLocator.findElement(for: targetId) {
                result["found"] = true
                result["elementType"] = element.elementType
                result["isVisible"] = element.isVisible
                result["position"] = [
                    "x": element.frame.origin.x,
                    "y": element.frame.origin.y,
                    "width": element.frame.size.width,
                    "height": element.frame.size.height
                ]
                result["text"] = element.text ?? NSNull()
                result["targetId"] = element.targetId
            }
        }
        
        if Thread.isMainThread {
            work()
        } else {
            DispatchQueue.main.sync(execute: work)
        }
        
        return result
    }
}