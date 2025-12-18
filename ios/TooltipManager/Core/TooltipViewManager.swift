import Foundation
import UIKit
import QuartzCore

/// Manages the UI presentation layer for tooltips.
/// Handles overlay creation, tooltip rendering, positioning, animations, and dismissal.
final class TooltipViewManager {
    // MARK: - Properties
    private var currentOverlayView: PassThroughOverlayView?
    private var currentTooltipViews: [String: UIView] = [:]
    private var tooltipTimers: [String: Timer] = [:]
    
    // MARK: - Public API
    
    /// Displays a tooltip for the given element with the specified configuration.
    /// Handles smart positioning, arrow rendering, and animations.
    /// - Parameters:
    ///   - element: The target element snapshot containing frame and visibility info
    ///   - configuration: The tooltip configuration with styling and behavior options
    ///   - delegate: Optional orchestrator delegate for dismissal coordination
    func showTooltip(for element: ElementSnapshot, configuration: TooltipConfiguration, delegate: TooltipOrchestrator? = nil) {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in
                self?.showTooltip(for: element, configuration: configuration, delegate: delegate)
            }
            return
        }
        
        guard let keyWindow = ElementLocator.keyWindow() else { 
            return 
        }
        
        // Remove any existing tooltip for this target
        currentTooltipViews[element.targetId]?.removeFromSuperview()
        currentTooltipViews.removeValue(forKey: element.targetId)
        
        // Create overlay if it doesn't exist
        if currentOverlayView == nil {
            createOverlay(in: keyWindow, delegate: delegate)
        }
        
        // Update overlay's dismissOnOutsideTouch setting
        currentOverlayView?.shouldDismissOnOutsideTouch = configuration.dismissOnOutsideTouch
        
        // Create smart tooltip with arrow positioning
        createSmartTooltip(frame: element.frame, message: configuration.message, targetId: element.targetId, in: keyWindow, configuration: configuration)
    }
    
    /// Hides the tooltip for a specific target element.
    /// Cancels any active timers and removes the tooltip with animation.
    /// - Parameter targetId: The identifier of the target element
    func hideTooltip(targetId: String) {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in
                self?.hideTooltip(targetId: targetId)
            }
            return
        }
        
        tooltipTimers[targetId]?.invalidate()
        tooltipTimers.removeValue(forKey: targetId)
        
        if let tooltipView = currentTooltipViews[targetId] {
            removeTooltipWithAnimation(tooltipView)
            currentTooltipViews.removeValue(forKey: targetId)
        }
        
        if currentTooltipViews.isEmpty {
            removeOverlay()
        }
    }
    
    /// Hides all currently displayed tooltips.
    /// Cancels all timers and removes the overlay.
    func hideAllTooltips() {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in
                self?.hideAllTooltips()
            }
            return
        }
        
        tooltipTimers.values.forEach { $0.invalidate() }
        tooltipTimers.removeAll()
        
        currentTooltipViews.values.forEach { removeTooltipWithAnimation($0) }
        currentTooltipViews.removeAll()
        
        removeOverlay()
    }
    
    // MARK: - Smart Tooltip Creation
    
    private func createSmartTooltip(frame: CGRect, message: String, targetId: String, in window: UIWindow, configuration: TooltipConfiguration) {
        // Use configuration values for arrow and spacing
        let arrowSize = configuration.arrowSize
        
        // Calculate content dimensions based on configuration padding
        let horizontalPadding = configuration.paddingLeft + configuration.paddingRight
        let verticalPadding = configuration.paddingTop + configuration.paddingBottom
        
        // Calculate tooltip width based on actual content
        let maxTooltipWidth: CGFloat = window.bounds.width - 40 // Leave some margin from screen edges
        
        // Create fonts once for both width and height calculations
        let titleFont = TooltipConfiguration.createFont(
            family: configuration.titleFontFamily,
            weight: configuration.titleFontWeight,
            size: configuration.titleFontSize
        )
        let subtitleFont = TooltipConfiguration.createFont(
            family: configuration.subTitleFontFamily,
            weight: configuration.subTitleFontWeight,
            size: configuration.subTitleFontSize
        )
        
        // Measure actual text width to determine optimal tooltip width
        let titleSize = (message as NSString).size(withAttributes: [.font: titleFont])
        var optimalContentWidth = ceil(titleSize.width)
        
        // Also check subtitle width if present
        if let subtitle = configuration.subtitle, !subtitle.isEmpty {
            let subtitleSize = (subtitle as NSString).size(withAttributes: [.font: subtitleFont])
            optimalContentWidth = max(optimalContentWidth, ceil(subtitleSize.width))
        }
        
        // Add padding to get final tooltip width (no artificial minimums)
        let tooltipWidth = min(maxTooltipWidth, optimalContentWidth + horizontalPadding)
        let contentWidth = max(1, tooltipWidth - horizontalPadding) // Ensure contentWidth is at least 1
        
        // Calculate tooltip height dynamically based on content (reuse fonts from above)
        let titleHeight = heightForText(message, width: contentWidth, font: titleFont)
        
        var tooltipHeight: CGFloat
        if let subtitle = configuration.subtitle, !subtitle.isEmpty {
            let subtitleHeight = heightForText(subtitle, width: contentWidth, font: subtitleFont)
            tooltipHeight = verticalPadding + titleHeight + 4 + subtitleHeight // 4px spacing between title and subtitle
        } else {
            tooltipHeight = verticalPadding + titleHeight
        }
        
        // Get margin values
        let marginLeft = configuration.marginLeft
        let marginRight = configuration.marginRight
        let marginTop = configuration.marginTop
        let marginBottom = configuration.marginBottom
        
        let safeAreaTop = window.safeAreaInsets.top
        let safeAreaBottom = window.safeAreaInsets.bottom
        let safeAreaLeft = window.safeAreaInsets.left
        let safeAreaRight = window.safeAreaInsets.right
        
        // Calculate available space in all directions
        let spaceAbove = frame.minY - safeAreaTop - marginTop
        let spaceBelow = window.bounds.height - safeAreaBottom - frame.maxY - marginBottom
        let spaceLeft = frame.minX - safeAreaLeft - marginLeft
        let spaceRight = window.bounds.width - safeAreaRight - frame.maxX - marginRight
        
        // Determine if we're using horizontal (left/right) or vertical (top/bottom) positioning
        enum TooltipOrientation {
            case vertical(above: Bool)
            case horizontal(onLeft: Bool)
        }
        
        let orientation: TooltipOrientation
        
        // Check if an explicit position was requested
        switch configuration.position {
        case .left:
            // User explicitly requested left - honor it if there's enough space
            let spacingIfLeft = marginRight
            let tooltipTotalWidthLeft = tooltipWidth + arrowSize + spacingIfLeft
            
            if spaceLeft >= tooltipTotalWidthLeft {
                orientation = .horizontal(onLeft: true)
            } else {
                // Not enough space on left, calculate best alternative
                let tooltipTotalWidthRight = tooltipWidth + arrowSize + marginLeft
                let tooltipTotalHeightAbove = tooltipHeight + arrowSize + marginBottom
                let tooltipTotalHeightBelow = tooltipHeight + arrowSize + marginTop
                
                if spaceRight >= tooltipTotalWidthRight {
                    orientation = .horizontal(onLeft: false)
                } else if spaceAbove >= tooltipTotalHeightAbove {
                    orientation = .vertical(above: true)
                } else if spaceBelow >= tooltipTotalHeightBelow {
                    orientation = .vertical(above: false)
                } else {
                    // Use the side with most space
                    let maxSpace = max(spaceLeft, spaceRight, spaceAbove, spaceBelow)
                    if maxSpace == spaceLeft || maxSpace == spaceRight {
                        orientation = .horizontal(onLeft: maxSpace == spaceLeft)
                    } else {
                        orientation = .vertical(above: maxSpace == spaceAbove)
                    }
                }
            }
            
        case .right:
            // User explicitly requested right - honor it if there's enough space
            let spacingIfRight = marginLeft
            let tooltipTotalWidthRight = tooltipWidth + arrowSize + spacingIfRight
            
            if spaceRight >= tooltipTotalWidthRight {
                orientation = .horizontal(onLeft: false)
            } else {
                // Not enough space on right, calculate best alternative
                let tooltipTotalWidthLeft = tooltipWidth + arrowSize + marginRight
                let tooltipTotalHeightAbove = tooltipHeight + arrowSize + marginBottom
                let tooltipTotalHeightBelow = tooltipHeight + arrowSize + marginTop
                
                if spaceLeft >= tooltipTotalWidthLeft {
                    orientation = .horizontal(onLeft: true)
                } else if spaceAbove >= tooltipTotalHeightAbove {
                    orientation = .vertical(above: true)
                } else if spaceBelow >= tooltipTotalHeightBelow {
                    orientation = .vertical(above: false)
                } else {
                    // Use the side with most space
                    let maxSpace = max(spaceLeft, spaceRight, spaceAbove, spaceBelow)
                    if maxSpace == spaceLeft || maxSpace == spaceRight {
                        orientation = .horizontal(onLeft: maxSpace == spaceLeft)
                    } else {
                        orientation = .vertical(above: maxSpace == spaceAbove)
                    }
                }
            }
            
        case .top:
            // User explicitly requested top - honor it if there's enough space
            let tooltipTotalHeightAbove = tooltipHeight + arrowSize + marginBottom
            let tooltipTotalHeightBelow = tooltipHeight + arrowSize + marginTop
            
            if spaceAbove >= tooltipTotalHeightAbove {
                orientation = .vertical(above: true)
            } else {
                // Not enough space on top, check if bottom has space
                orientation = .vertical(above: spaceBelow < tooltipTotalHeightBelow)
            }
            
        case .bottom:
            // User explicitly requested bottom - honor it if there's enough space
            let tooltipTotalHeightBelow = tooltipHeight + arrowSize + marginTop
            let tooltipTotalHeightAbove = tooltipHeight + arrowSize + marginBottom
            
            if spaceBelow >= tooltipTotalHeightBelow {
                orientation = .vertical(above: false)
            } else {
                // Not enough space on bottom, check if top has space
                orientation = .vertical(above: spaceAbove >= tooltipTotalHeightAbove)
            }
            
        default:
            // Auto mode - use smart vertical positioning
            let tooltipTotalHeightAbove = tooltipHeight + arrowSize + marginBottom
            let tooltipTotalHeightBelow = tooltipHeight + arrowSize + marginTop
            
            if spaceAbove >= tooltipTotalHeightAbove && spaceBelow >= tooltipTotalHeightBelow {
                orientation = .vertical(above: spaceAbove > spaceBelow)
            } else if spaceAbove >= tooltipTotalHeightAbove {
                orientation = .vertical(above: true)
            } else if spaceBelow >= tooltipTotalHeightBelow {
                orientation = .vertical(above: false)
            } else {
                orientation = .vertical(above: spaceAbove > spaceBelow)
            }
        }
        
        // Create container and position based on orientation
        let container: UIView
        let tooltipBox: UIView
        let arrow: UIView
        
        switch orientation {
        case .vertical(let above):
            // Vertical orientation (top/bottom) - existing logic
            let elementToTooltipSpacing = above ? marginBottom : marginTop
            
            // Calculate X position with left/right margin constraints (screen edges)
            let tooltipX = max(marginLeft, min(frame.midX - tooltipWidth/2, window.bounds.width - tooltipWidth - marginRight))
            
            // Calculate Y position
            let containerHeight = tooltipHeight + arrowSize
            var tooltipY: CGFloat
            
            if above {
                // Position above target with marginBottom as spacing
                tooltipY = frame.minY - tooltipHeight - arrowSize - elementToTooltipSpacing
                // Enforce top screen edge constraint (using marginTop)
                let minY = safeAreaTop + marginTop
                if tooltipY < minY {
                    tooltipY = minY
                }
            } else {
                // Position below target with marginTop as spacing
                tooltipY = frame.maxY + arrowSize + elementToTooltipSpacing
                // Enforce bottom screen edge constraint (using marginBottom)
                let maxY = window.bounds.height - safeAreaBottom - marginBottom - containerHeight
                if tooltipY > maxY {
                    tooltipY = maxY
                }
            }
            
            let containerY = above ? tooltipY : tooltipY - arrowSize
            container = UIView(frame: CGRect(x: tooltipX, y: containerY, width: tooltipWidth, height: containerHeight))
            container.backgroundColor = UIColor.clear
            
            // Create main tooltip box
            let tooltipBoxY = above ? 0 : arrowSize
            tooltipBox = UIView(frame: CGRect(x: 0, y: tooltipBoxY, width: tooltipWidth, height: tooltipHeight))
            
            // Calculate arrow position based on target's midX in window coordinates
            let arrowX = frame.midX - tooltipX
            let clampedArrowX = max(arrowSize + 5, min(arrowX, tooltipWidth - arrowSize - 5))
            
            // Create arrow with proper overlap
            arrow = createPerfectArrow(
                x: clampedArrowX,
                y: above ? tooltipHeight - 1.5 : arrowSize + 1.5,
                size: arrowSize,
                pointingUp: !above,
                color: configuration.backgroundColor
            )
            
        case .horizontal(let onLeft):
            // Horizontal orientation (left/right) - new logic
            let elementToTooltipSpacing = onLeft ? marginRight : marginLeft
            
            // Calculate Y position with top/bottom margin constraints
            let tooltipY = max(marginTop + safeAreaTop, min(frame.midY - tooltipHeight/2, window.bounds.height - safeAreaBottom - tooltipHeight - marginBottom))
            
            // Calculate X position
            let containerWidth = tooltipWidth + arrowSize
            var tooltipX: CGFloat
            
            if onLeft {
                // Position to the left of target with marginRight as spacing
                tooltipX = frame.minX - tooltipWidth - arrowSize - elementToTooltipSpacing
                // Enforce left screen edge constraint (using marginLeft)
                let minX = safeAreaLeft + marginLeft
                if tooltipX < minX {
                    tooltipX = minX
                }
            } else {
                // Position to the right of target with marginLeft as spacing
                tooltipX = frame.maxX + arrowSize + elementToTooltipSpacing
                // Enforce right screen edge constraint (using marginRight)
                let maxX = window.bounds.width - safeAreaRight - marginRight - containerWidth
                if tooltipX > maxX {
                    tooltipX = maxX
                }
            }
            
            let containerX = onLeft ? tooltipX : tooltipX - arrowSize
            container = UIView(frame: CGRect(x: containerX, y: tooltipY, width: containerWidth, height: tooltipHeight))
            container.backgroundColor = UIColor.clear
            
            // Create main tooltip box
            let tooltipBoxX = onLeft ? 0 : arrowSize
            tooltipBox = UIView(frame: CGRect(x: tooltipBoxX, y: 0, width: tooltipWidth, height: tooltipHeight))
            
            // Calculate arrow position based on target's midY in window coordinates
            let arrowY = frame.midY - tooltipY
            let clampedArrowY = max(arrowSize + 5, min(arrowY, tooltipHeight - arrowSize - 5))
            
            // Create horizontal arrow
            arrow = createHorizontalArrow(
                x: onLeft ? tooltipWidth - 1.5 : arrowSize + 1.5,
                y: clampedArrowY,
                size: arrowSize,
                pointingLeft: !onLeft,
                color: configuration.backgroundColor
            )
        }
        
        container.backgroundColor = UIColor.clear
        
        // Apply unified shadow to the entire container for smooth appearance
        container.layer.shadowColor = UIColor.black.cgColor
        container.layer.shadowOffset = CGSize(width: 0, height: 2)
        container.layer.shadowOpacity = 0.2
        container.layer.shadowRadius = 6
        
        // Configure tooltip box appearance
        tooltipBox.backgroundColor = configuration.backgroundColor
        tooltipBox.layer.cornerRadius = configuration.cornerRadius
        tooltipBox.clipsToBounds = true
        
        // Add content based on whether we have subtitle or not (reuse fonts from above)
        if let subtitle = configuration.subtitle, !subtitle.isEmpty {
            // Title + Subtitle layout
            let titleY = configuration.paddingTop
            let titleLabel = UILabel(frame: CGRect(x: configuration.paddingLeft, y: titleY, width: contentWidth, height: titleHeight))
            titleLabel.text = message
            titleLabel.textColor = configuration.titleColor
            titleLabel.font = titleFont
            titleLabel.textAlignment = configuration.titleAlignment
            titleLabel.numberOfLines = 0
            tooltipBox.addSubview(titleLabel)
            
            let subtitleY = titleY + titleHeight + 2 // 2px spacing between title and subtitle
            let subtitleHeight = heightForText(subtitle, width: contentWidth, font: subtitleFont)
            let subtitleLabel = UILabel(frame: CGRect(x: configuration.paddingLeft, y: subtitleY, width: contentWidth, height: subtitleHeight))
            subtitleLabel.text = subtitle
            subtitleLabel.textColor = configuration.subTitleColor
            subtitleLabel.font = subtitleFont
            subtitleLabel.textAlignment = configuration.subTitleAlignment
            subtitleLabel.numberOfLines = 0
            tooltipBox.addSubview(subtitleLabel)
        } else {
            // Title only layout
            let titleLabel = UILabel(frame: CGRect(x: configuration.paddingLeft, y: configuration.paddingTop, width: contentWidth, height: titleHeight))
            titleLabel.text = message
            titleLabel.textColor = configuration.titleColor
            titleLabel.font = titleFont
            titleLabel.textAlignment = configuration.titleAlignment
            titleLabel.numberOfLines = 0
            tooltipBox.addSubview(titleLabel)
        }
        
        // Assemble tooltip
        container.addSubview(tooltipBox)
        container.addSubview(arrow)
        
        // Add to overlay for proper touch handling
        guard let overlay = currentOverlayView else {
            return
        }
        
        overlay.addSubview(container)
        currentTooltipViews[targetId] = container
        
        // Add entrance animation
        container.alpha = 0
        container.transform = CGAffineTransform(scaleX: 0.8, y: 0.8)
        
        UIView.animate(withDuration: 0.3, delay: 0, options: [.curveEaseOut]) {
            container.alpha = 1
            container.transform = CGAffineTransform.identity
        }
        
        // Setup auto-dismiss timer if configured
        if let autoDismissMs = configuration.autoDismissMs {
            let timeInterval = TimeInterval(autoDismissMs) / 1000.0
            
            tooltipTimers[targetId]?.invalidate()
            
            let timer = Timer.scheduledTimer(withTimeInterval: timeInterval, repeats: false) { [weak self] _ in
                self?.hideTooltip(targetId: targetId)
            }
            
            tooltipTimers[targetId] = timer
        }
    }
    
    /// Creates a perfect arrow with proper overlap for seamless appearance
    private func createPerfectArrow(x: CGFloat, y: CGFloat, size: CGFloat, pointingUp: Bool, color: UIColor) -> UIView {
        // Add extra height for overlap to eliminate any gaps at corners
        let extraOverlap: CGFloat = 2
        let arrowView = UIView(frame: CGRect(x: x - size, y: y - (pointingUp ? size : 0), width: size * 2, height: size + extraOverlap))
        arrowView.backgroundColor = UIColor.clear
        
        // Create triangle path with extended base for perfect coverage
        let path = UIBezierPath()
        if pointingUp {
            // Arrow pointing up (base extends slightly into tooltip)
            path.move(to: CGPoint(x: size, y: 0)) // Tip
            path.addLine(to: CGPoint(x: 0, y: size + extraOverlap)) // Left base (extended)
            path.addLine(to: CGPoint(x: size * 2, y: size + extraOverlap)) // Right base (extended)
        } else {
            // Arrow pointing down (base extends slightly into tooltip)
            path.move(to: CGPoint(x: size, y: size + extraOverlap)) // Tip
            path.addLine(to: CGPoint(x: 0, y: 0)) // Left base
            path.addLine(to: CGPoint(x: size * 2, y: 0)) // Right base
        }
        path.close()
        
        // Create shape layer (no shadow - container has it)
        let arrowLayer = CAShapeLayer()
        arrowLayer.path = path.cgPath
        arrowLayer.fillColor = color.cgColor
        
        arrowView.layer.addSublayer(arrowLayer)
        return arrowView
    }
    
    /// Creates a horizontal arrow for left/right tooltip positioning
    private func createHorizontalArrow(x: CGFloat, y: CGFloat, size: CGFloat, pointingLeft: Bool, color: UIColor) -> UIView {
        // Add extra width for overlap to eliminate any gaps at corners
        let extraOverlap: CGFloat = 2
        let arrowView = UIView(frame: CGRect(x: x - (pointingLeft ? size : 0), y: y - size, width: size + extraOverlap, height: size * 2))
        arrowView.backgroundColor = UIColor.clear
        
        // Create triangle path with extended base for perfect coverage
        let path = UIBezierPath()
        if pointingLeft {
            // Arrow pointing left (base extends slightly into tooltip)
            path.move(to: CGPoint(x: 0, y: size)) // Tip
            path.addLine(to: CGPoint(x: size + extraOverlap, y: 0)) // Top base (extended)
            path.addLine(to: CGPoint(x: size + extraOverlap, y: size * 2)) // Bottom base (extended)
        } else {
            // Arrow pointing right (base extends slightly into tooltip)
            path.move(to: CGPoint(x: size + extraOverlap, y: size)) // Tip
            path.addLine(to: CGPoint(x: 0, y: 0)) // Top base
            path.addLine(to: CGPoint(x: 0, y: size * 2)) // Bottom base
        }
        path.close()
        
        // Create shape layer (no shadow - container has it)
        let arrowLayer = CAShapeLayer()
        arrowLayer.path = path.cgPath
        arrowLayer.fillColor = color.cgColor
        
        arrowView.layer.addSublayer(arrowLayer)
        return arrowView
    }
    
    // MARK: - Helper Methods
    
    /// Calculates the height required to display text with given constraints
    private func heightForText(_ text: String, width: CGFloat, font: UIFont) -> CGFloat {
        let constraintRect = CGSize(width: width, height: .greatestFiniteMagnitude)
        let boundingBox = text.boundingRect(
            with: constraintRect,
            options: [.usesLineFragmentOrigin, .usesFontLeading],
            attributes: [.font: font],
            context: nil
        )
        return ceil(boundingBox.height)
    }
    
    // MARK: - Private Methods
    
    /// Creates the overlay view for touch-to-dismiss functionality
    private func createOverlay(in window: UIWindow, delegate: TooltipOrchestrator?) {
        let overlay = PassThroughOverlayView(frame: window.bounds)
        overlay.backgroundColor = UIColor.clear
        overlay.tooltipDelegate = delegate
        
        window.addSubview(overlay)
        currentOverlayView = overlay
    }
    
    /// Removes the overlay view from the window
    private func removeOverlay() {
        let overlayToRemove = currentOverlayView
        currentOverlayView = nil
        
        overlayToRemove?.tooltipDelegate = nil
        
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        overlayToRemove?.removeFromSuperview()
        CATransaction.commit()
    }
    
    /// Removes a tooltip view with fade-out animation
    private func removeTooltipWithAnimation(_ tooltipView: UIView) {
        UIView.animate(withDuration: 0.15, delay: 0, options: [.curveEaseIn], animations: {
            tooltipView.alpha = 0
            tooltipView.transform = CGAffineTransform(scaleX: 0.8, y: 0.8)
        }) { _ in
            CATransaction.begin()
            CATransaction.setDisableActions(true)
            tooltipView.removeFromSuperview()
            CATransaction.commit()
        }
    }
}
