import UIKit
import Foundation

// MARK: - Pass Through Overlay View

/// Transparent overlay view that allows touches to pass through while managing tooltip dismissal.
/// This view sits between the window and tooltip content, handling touch-to-dismiss functionality
/// while allowing user interactions with the underlying app UI.
final class PassThroughOverlayView: UIView {
    // MARK: - Properties
    
    /// Weak reference to the orchestrator for coordinating tooltip dismissal
    weak var tooltipDelegate: TooltipOrchestrator?
    
    /// Controls whether tapping outside the tooltip dismisses it
    var shouldDismissOnOutsideTouch: Bool = true
    
    /// Tracks removal state to prevent race conditions during cleanup
    private var isBeingRemoved = false
    
    // MARK: - Touch Handling
    
    /// Custom hit testing to enable pass-through behavior and touch-to-dismiss.
    /// - Parameters:
    ///   - point: The touch point in the view's coordinate system
    ///   - event: The event containing the touch
    /// - Returns: The view to handle the touch, or nil to pass through
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        guard !isBeingRemoved else { return nil }
        
        let hitView = super.hitTest(point, with: event)
        if hitView != self {
            return hitView
        }
        
        if shouldDismissOnOutsideTouch {
            guard let delegate = tooltipDelegate else { return nil }
            
            DispatchQueue.main.async { [weak delegate] in
                delegate?.hideAllTooltips()
            }
        }
        
        return nil
    }
    
    // MARK: - Lifecycle
    
    /// Safely removes the view from its superview, cleaning up delegate references.
    override func removeFromSuperview() {
        isBeingRemoved = true
        tooltipDelegate = nil
        super.removeFromSuperview()
    }
    
    /// Safe layout implementation that prevents crashes during removal.
    override func layoutSubviews() {
        guard !isBeingRemoved, window != nil else { return }
        super.layoutSubviews()
    }
}
