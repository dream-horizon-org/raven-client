import Foundation
import UIKit

/// Locates and caches UI elements by their identifier (accessibilityIdentifier or React Native nativeID).
/// This class provides thread-safe element lookup with caching for optimal performance.
class ElementLocator {
    // MARK: - Performance Cache
    private static var elementCache: NSMapTable<NSString, UIView> = NSMapTable.strongToWeakObjects()
    private static var cacheQueue = DispatchQueue(label: "com.tooltipmodule.cache", attributes: .concurrent)
    private static var cacheCleanupTimer: Timer?
    private static var memoryWarningObserver: NSObjectProtocol?

    // MARK: - Lifecycle Management
    
    /// Sets up cache cleanup and memory pressure handling. Call this once during initialization.
    static func setupLifecycle() {
        startCacheCleanup()
        setupMemoryPressureHandling()
    }

    /// Tears down lifecycle management. Call this during cleanup or deinitialization.
    static func teardownLifecycle() {
        stopCacheCleanup()
        stopMemoryPressureHandling()
    }

    // MARK: - Public API (Thread Safe)
    
    /// Finds a UI element by its identifier and returns a snapshot with visibility information.
    /// This method is thread-safe and uses caching for optimal performance.
    /// - Parameter targetId: The accessibilityIdentifier or React Native nativeID to search for
    /// - Returns: An ElementSnapshot if found, nil otherwise
    static func findElement(for targetId: String) -> ElementSnapshot? {
        var result: ElementSnapshot?
        
        let work = {
            // Try cache first for performance
            if let cachedView = getCachedView(for: targetId) {
                result = createSnapshot(from: cachedView, targetId: targetId)
                return
            }

            // Search through all windows
            let windows = allWindows()
            for window in windows {
                if let foundView = search(in: window, targetId: targetId) {
                    cacheView(foundView, for: targetId)
                    result = createSnapshot(from: foundView, targetId: targetId)
                    break
                }
            }
        }

        // Ensure thread safety
        if Thread.isMainThread {
            work()
        } else {
            DispatchQueue.main.sync(execute: work)
        }
        
        return result
    }

    /// Collects all available target IDs from all visible elements across all windows.
    /// This method is thread-safe and useful for debugging or listing available targets.
    /// - Returns: An array of unique target IDs (accessibilityIdentifiers and nativeIDs)
    static func collectAllTargetIds() -> [String] {
        var targetIds: [String] = []
        
        let work = {
            let windows = allWindows()
            for window in windows {
                collectTargetIds(from: window, into: &targetIds)
            }
        }

        if Thread.isMainThread {
            work()
        } else {
            DispatchQueue.main.sync(execute: work)
        }
        
        return targetIds
    }

    // MARK: - Window Management (iOS 13+ Compatible)
    static func keyWindow() -> UIWindow? {
        if #available(iOS 13.0, *) {
            return UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .flatMap { $0.windows }
                .first { $0.isKeyWindow }
        } else {
            return UIApplication.shared.keyWindow
        }
    }

    static func allWindows() -> [UIWindow] {
        if #available(iOS 13.0, *) {
            return UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .flatMap { $0.windows }
        } else {
            return UIApplication.shared.windows
        }
    }

    // MARK: - Enhanced Search Algorithm
    private static func search(in root: UIView, targetId: String) -> UIView? {
        var queue: [UIView] = [root]
        var searchCount = 0
        let maxSearch = 200 // Prevent infinite loops
        let screenBounds = UIScreen.main.bounds

        while !queue.isEmpty && searchCount < maxSearch {
            let view = queue.removeFirst()
            searchCount += 1

            // Early visibility filtering
            guard !view.isHidden,
                  view.alpha > 0.01,
                  !view.bounds.isEmpty else {
                continue
            }

            // Off-screen filtering
            let viewFrame = view.convert(view.bounds, to: nil)
            guard viewFrame.intersects(screenBounds) else {
                continue
            }

            // Check accessibilityIdentifier first (preferred)
            if view.accessibilityIdentifier == targetId {
                return view
            }

            // Safe KVC fallback for React Native nativeID
            if let viewNativeID = safelyGetNativeID(from: view), viewNativeID == targetId {
                return view
            }

            // Priority-based child addition (interactive elements first)
            let children = view.subviews.filter { child in
                !child.isHidden && child.alpha > 0.01 && !child.bounds.isEmpty
            }

            var priorityViews: [UIView] = []
            var otherViews: [UIView] = []

            for child in children {
                if child is UILabel || child is UIButton || child is UIImageView ||
                   child is UITextField || child is UITextView {
                    priorityViews.append(child)
                } else {
                    otherViews.append(child)
                }
            }

            queue.append(contentsOf: priorityViews)
            queue.append(contentsOf: otherViews)
        }

        return nil
    }

    // MARK: - Safe KVC Access
    private static func safelyGetNativeID(from view: UIView) -> String? {
        // Check if view responds to selector first
        guard view.responds(to: Selector("nativeID")) else {
            return nil
        }
        
        do {
            let value = view.value(forKey: "nativeID")
            return value as? String
        } catch {
            return nil
        }
    }
    
    // MARK: - Collection Helper
    private static func collectTargetIds(from root: UIView, into collection: inout [String]) {
        var queue: [UIView] = [root]
        var processedCount = 0
        let maxProcessed = 1000
        let screenBounds = UIScreen.main.bounds
        
        while !queue.isEmpty && processedCount < maxProcessed {
            let view = queue.removeFirst()
            processedCount += 1
            
            guard !view.isHidden,
                  view.alpha > 0.01,
                  !view.bounds.isEmpty else {
                continue
            }
            
            let viewFrame = view.convert(view.bounds, to: nil)
            guard viewFrame.intersects(screenBounds) else {
                continue
            }
            
            // Collect accessibilityIdentifier
            if let accessibilityId = view.accessibilityIdentifier,
               !accessibilityId.isEmpty,
               !collection.contains(accessibilityId) {
                collection.append(accessibilityId)
            }
            
            // Collect React Native nativeID
            if let nativeID = safelyGetNativeID(from: view),
               !nativeID.isEmpty,
               !collection.contains(nativeID) {
                collection.append(nativeID)
            }
            
            for child in view.subviews {
                guard !child.isHidden,
                      child.alpha > 0.01,
                      !child.bounds.isEmpty else {
                    continue
                }
                queue.append(child)
            }
        }
    }
    
    // MARK: - Snapshot Creation
    private static func createSnapshot(from view: UIView, targetId: String) -> ElementSnapshot {
        let frame = view.convert(view.bounds, to: nil)
        let isVisible = isViewVisibleOnScreen(view)
        let elementType = String(describing: type(of: view))
        
        var text: String?
        if let label = view as? UILabel {
            text = label.text
        } else if let button = view as? UIButton {
            text = button.title(for: .normal)
        }
        
        return ElementSnapshot(
            targetId: targetId,
            frame: frame,
            isVisible: isVisible,
            elementType: elementType,
            text: text,
            view: view
        )
    }
    
    // MARK: - Visibility Check
    private static func isViewVisibleOnScreen(_ view: UIView) -> Bool {
        // Basic visibility checks
        if view.isHidden || view.alpha == 0.0 || view.frame.size == .zero {
            return false
        }
        
        // Check parent hierarchy
        var checkView: UIView? = view
        while let currentView = checkView {
            if currentView.isHidden || currentView.alpha == 0.0 {
                return false
            }
            checkView = currentView.superview
        }
        
        // Window coordinate check
        guard let keyWindow = keyWindow() else { return false }
        
        let windowFrame = view.convert(view.bounds, to: keyWindow)
        let screenBounds = UIScreen.main.bounds
        var safeAreaBounds = screenBounds
        
        // Account for safe area
        if #available(iOS 11.0, *) {
            let safeAreaInsets = keyWindow.safeAreaInsets
            safeAreaBounds = CGRect(
                x: safeAreaInsets.left,
                y: safeAreaInsets.top,
                width: screenBounds.width - safeAreaInsets.left - safeAreaInsets.right,
                height: screenBounds.height - safeAreaInsets.top - safeAreaInsets.bottom
            )
        }
        
        let intersectsWithSafeArea = windowFrame.intersects(safeAreaBounds)
        let intersection = windowFrame.intersection(safeAreaBounds)
        let intersectionArea = intersection.width * intersection.height
        let viewArea = windowFrame.width * windowFrame.height
        let visibleRatio = viewArea > 0 ? intersectionArea / viewArea : 0
        
        guard intersectsWithSafeArea && visibleRatio >= 0.1 else {
            return false
        }
        
        // Check if view is actually visible (not covered by other views)
        // Test multiple points to ensure the view is truly visible
        let testPoints = [
            CGPoint(x: windowFrame.midX, y: windowFrame.midY), // Center
            CGPoint(x: windowFrame.minX + 5, y: windowFrame.minY + 5), // Top-left
            CGPoint(x: windowFrame.maxX - 5, y: windowFrame.minY + 5), // Top-right
            CGPoint(x: windowFrame.minX + 5, y: windowFrame.maxY - 5), // Bottom-left
            CGPoint(x: windowFrame.maxX - 5, y: windowFrame.maxY - 5), // Bottom-right
        ]
        
        var visiblePointCount = 0
        for point in testPoints {
            if let hitView = keyWindow.hitTest(point, with: nil) {
                // Check if hitView is the target view or a descendant of it
                var currentHitView: UIView? = hitView
                while currentHitView != nil {
                    if currentHitView === view {
                        visiblePointCount += 1
                        break
                    }
                    currentHitView = currentHitView?.superview
                }
            }
        }
        
        // Require at least 40% of test points to be visible (2 out of 5)
        // This ensures the view is not completely covered by modals, side menus, etc.
        return visiblePointCount >= 2
    }

    // MARK: - Cache Management
    private static func getCachedView(for identifier: String) -> UIView? {
        if let cachedView = elementCache.object(forKey: identifier as NSString) {
            // Verify cached view is still valid
            if cachedView.superview != nil || cachedView.window != nil {
                return cachedView
            } else {
                elementCache.removeObject(forKey: identifier as NSString)
            }
        }
        return nil
    }

    private static func cacheView(_ view: UIView, for identifier: String) {
        elementCache.setObject(view, forKey: identifier as NSString)
    }

    // MARK: - Memory Management
    private static func startCacheCleanup() {
        stopCacheCleanup()
        DispatchQueue.main.async {
            cacheCleanupTimer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { _ in
                pruneCache()
            }
        }
    }

    private static func stopCacheCleanup() {
        cacheCleanupTimer?.invalidate()
        cacheCleanupTimer = nil
    }

    private static func pruneCache() {
        cacheQueue.async(flags: .barrier) {
            guard let allKeys = elementCache.keyEnumerator().allObjects as? [NSString] else { return }
            
            for key in allKeys {
                if let view = elementCache.object(forKey: key) {
                    // Remove if view is no longer in hierarchy
                    if view.superview == nil && view.window == nil {
                        elementCache.removeObject(forKey: key)
                    }
                } else {
                    // Remove if view is nil
                    elementCache.removeObject(forKey: key)
                }
            }
        }
    }

    private static func setupMemoryPressureHandling() {
        memoryWarningObserver = NotificationCenter.default.addObserver(
            forName: UIApplication.didReceiveMemoryWarningNotification,
            object: nil,
            queue: .main
        ) { _ in
            forceCacheCleanup()
        }
    }

    private static func stopMemoryPressureHandling() {
        if let observer = memoryWarningObserver {
            NotificationCenter.default.removeObserver(observer)
            memoryWarningObserver = nil
        }
    }

    @objc
    private static func forceCacheCleanup() {
        pruneCache()
    }
}