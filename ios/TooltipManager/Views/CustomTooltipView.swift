import UIKit

// MARK: - Custom Tooltip View

/// Legacy custom-drawn tooltip view.
/// Note: This class is currently not used in production. The main tooltip rendering
/// is handled directly in TooltipViewManager for better control and performance.
/// Kept for reference and potential future use cases.
final class CustomTooltipView: UIView {
    // MARK: - Properties
    private let message: String
    private let targetFrame: CGRect
    private let position: TooltipDisplayPosition
    private let tooltipBackgroundColor: UIColor
    private let textColor: UIColor
    
    private let cornerRadius: CGFloat = 8
    private let padding: CGFloat = 12
    private let arrowSize: CGFloat = 8
    
    // MARK: - Initialization
    
    /// Creates a custom-drawn tooltip view.
    /// - Parameters:
    ///   - message: The tooltip message text
    ///   - targetFrame: The frame of the target element
    ///   - position: Desired tooltip position
    ///   - backgroundColor: Tooltip background color
    ///   - textColor: Text color
    init(message: String, targetFrame: CGRect, position: TooltipDisplayPosition, backgroundColor: UIColor, textColor: UIColor) {
        self.message = message
        self.targetFrame = targetFrame
        self.position = position
        self.tooltipBackgroundColor = backgroundColor
        self.textColor = textColor
        super.init(frame: .zero)
        setupView()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupView() {
        backgroundColor = UIColor.clear
        isOpaque = false
    }
    
    // MARK: - Drawing
    
    /// Custom drawing implementation for the tooltip bubble and arrow.
    override func draw(_ rect: CGRect) {
        guard let context = UIGraphicsGetCurrentContext() else { return }
        
        let textSize = message.boundingRect(
            with: CGSize(width: 200, height: CGFloat.greatestFiniteMagnitude),
            options: [.usesLineFragmentOrigin, .usesFontLeading],
            attributes: [NSAttributedString.Key.font: UIFont.systemFont(ofSize: 14)],
            context: nil
        ).size
        
        let bubbleWidth = min(max(textSize.width + padding * 2, 120), 300)
        let bubbleHeight = textSize.height + padding * 2
        
        let (bubbleRect, arrowPath) = calculateLayout(bubbleWidth: bubbleWidth, bubbleHeight: bubbleHeight)
        
        // Draw tooltip shape
        let path = UIBezierPath(roundedRect: bubbleRect, cornerRadius: cornerRadius)
        path.append(arrowPath)
        
        tooltipBackgroundColor.setFill()
        path.fill()
        
        context.setShadow(offset: CGSize(width: 0, height: 2), blur: 4, color: UIColor.black.withAlphaComponent(0.2).cgColor)
        
        // Draw text
        let textRect = CGRect(
            x: bubbleRect.origin.x + padding,
            y: bubbleRect.origin.y + padding,
            width: bubbleRect.width - padding * 2,
            height: bubbleRect.height - padding * 2
        )
        
        let textStyle = NSMutableParagraphStyle()
        textStyle.alignment = .center
        
        message.draw(in: textRect, withAttributes: [
            NSAttributedString.Key.font: UIFont.systemFont(ofSize: 14),
            NSAttributedString.Key.foregroundColor: textColor,
            NSAttributedString.Key.paragraphStyle: textStyle
        ])
    }
    
    // MARK: - Layout Calculation
    
    /// Calculates the optimal layout for the tooltip bubble and arrow.
    /// Implements smart positioning to avoid screen edges.
    /// - Parameters:
    ///   - bubbleWidth: The calculated width of the tooltip bubble
    ///   - bubbleHeight: The calculated height of the tooltip bubble
    /// - Returns: A tuple containing the bubble rect and arrow path
    private func calculateLayout(bubbleWidth: CGFloat, bubbleHeight: CGFloat) -> (CGRect, UIBezierPath) {
        let screenBounds = UIScreen.main.bounds
        let padding: CGFloat = 10
        
        let spaceAbove = targetFrame.minY
        let spaceBelow = screenBounds.height - targetFrame.maxY
        let spaceLeft = targetFrame.minX
        let spaceRight = screenBounds.width - targetFrame.maxX
        
        let requiredHeight = bubbleHeight + arrowSize + padding
        let requiredWidth = bubbleWidth + padding * 2
        
        var actualPosition = position
        
        // Determine actual position if auto
        if actualPosition == .auto {
            if spaceAbove >= requiredHeight && spaceBelow >= requiredHeight {
                actualPosition = spaceAbove > spaceBelow ? .above : .below
            } else if spaceAbove >= requiredHeight {
                actualPosition = .above
            } else if spaceBelow >= requiredHeight {
                actualPosition = .below
            } else if spaceLeft >= requiredWidth {
                actualPosition = .left
            } else if spaceRight >= requiredWidth {
                actualPosition = .right
            } else {
                actualPosition = spaceAbove > spaceBelow ? .above : .below
            }
        }
        
        let bubbleRect: CGRect
        let arrowPath = UIBezierPath()
        
        // Create bubble and arrow based on position
        switch actualPosition {
        case .above:
            let tooltipX = max(padding, min(targetFrame.midX - bubbleWidth/2, screenBounds.width - bubbleWidth - padding))
            let tooltipY = targetFrame.minY - bubbleHeight - arrowSize - 5
            bubbleRect = CGRect(x: tooltipX, y: tooltipY, width: bubbleWidth, height: bubbleHeight)
            
            let arrowX = max(tooltipX + 15, min(targetFrame.midX, tooltipX + bubbleWidth - 15))
            arrowPath.move(to: CGPoint(x: arrowX, y: tooltipY + bubbleHeight))
            arrowPath.addLine(to: CGPoint(x: arrowX - arrowSize, y: tooltipY + bubbleHeight + arrowSize))
            arrowPath.addLine(to: CGPoint(x: arrowX + arrowSize, y: tooltipY + bubbleHeight + arrowSize))
            arrowPath.close()
            
        case .below:
            let tooltipX = max(padding, min(targetFrame.midX - bubbleWidth/2, screenBounds.width - bubbleWidth - padding))
            let tooltipY = targetFrame.maxY + arrowSize + 5
            bubbleRect = CGRect(x: tooltipX, y: tooltipY, width: bubbleWidth, height: bubbleHeight)
            
            let arrowX = max(tooltipX + 15, min(targetFrame.midX, tooltipX + bubbleWidth - 15))
            arrowPath.move(to: CGPoint(x: arrowX, y: tooltipY))
            arrowPath.addLine(to: CGPoint(x: arrowX - arrowSize, y: tooltipY - arrowSize))
            arrowPath.addLine(to: CGPoint(x: arrowX + arrowSize, y: tooltipY - arrowSize))
            arrowPath.close()
            
        case .left:
            let tooltipX = targetFrame.minX - bubbleWidth - arrowSize - 5
            let tooltipY = max(padding, min(targetFrame.midY - bubbleHeight/2, screenBounds.height - bubbleHeight - padding))
            bubbleRect = CGRect(x: tooltipX, y: tooltipY, width: bubbleWidth, height: bubbleHeight)
            
            let arrowY = max(tooltipY + 15, min(targetFrame.midY, tooltipY + bubbleHeight - 15))
            arrowPath.move(to: CGPoint(x: tooltipX + bubbleWidth, y: arrowY))
            arrowPath.addLine(to: CGPoint(x: tooltipX + bubbleWidth + arrowSize, y: arrowY - arrowSize))
            arrowPath.addLine(to: CGPoint(x: tooltipX + bubbleWidth + arrowSize, y: arrowY + arrowSize))
            arrowPath.close()
            
        case .right:
            let tooltipX = targetFrame.maxX + arrowSize + 5
            let tooltipY = max(padding, min(targetFrame.midY - bubbleHeight/2, screenBounds.height - bubbleHeight - padding))
            bubbleRect = CGRect(x: tooltipX, y: tooltipY, width: bubbleWidth, height: bubbleHeight)
            
            let arrowY = max(tooltipY + 15, min(targetFrame.midY, tooltipY + bubbleHeight - 15))
            arrowPath.move(to: CGPoint(x: tooltipX, y: arrowY))
            arrowPath.addLine(to: CGPoint(x: tooltipX - arrowSize, y: arrowY - arrowSize))
            arrowPath.addLine(to: CGPoint(x: tooltipX - arrowSize, y: arrowY + arrowSize))
            arrowPath.close()
            
        case .auto:
            let tooltipX = max(padding, min(targetFrame.midX - bubbleWidth/2, screenBounds.width - bubbleWidth - padding))
            let tooltipY = targetFrame.maxY + arrowSize + 5
            bubbleRect = CGRect(x: tooltipX, y: tooltipY, width: bubbleWidth, height: bubbleHeight)
            
            let arrowX = max(tooltipX + 15, min(targetFrame.midX, tooltipX + bubbleWidth - 15))
            arrowPath.move(to: CGPoint(x: arrowX, y: tooltipY))
            arrowPath.addLine(to: CGPoint(x: arrowX - arrowSize, y: tooltipY - arrowSize))
            arrowPath.addLine(to: CGPoint(x: arrowX + arrowSize, y: tooltipY - arrowSize))
            arrowPath.close()
        }
        
        // Calculate final frame and adjust coordinates
        let totalFrame = bubbleRect.union(arrowPath.bounds)
        self.frame = totalFrame.insetBy(dx: -5, dy: -5)
        
        let adjustedBubbleRect = CGRect(
            x: bubbleRect.origin.x - self.frame.origin.x,
            y: bubbleRect.origin.y - self.frame.origin.y,
            width: bubbleRect.width,
            height: bubbleRect.height
        )
        
        let adjustedArrowPath = UIBezierPath(cgPath: arrowPath.cgPath)
        adjustedArrowPath.apply(CGAffineTransform(translationX: -self.frame.origin.x, y: -self.frame.origin.y))
        
        return (adjustedBubbleRect, adjustedArrowPath)
    }
}
