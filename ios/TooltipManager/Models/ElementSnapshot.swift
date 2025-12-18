import UIKit

// MARK: - UIColor Extension for Hex Support

extension UIColor {
    /// Creates a UIColor from a hex string.
    /// Supports 3, 6, or 8 character hex strings with or without '#' prefix.
    /// - Parameter hexString: The hex color string (e.g., "#FF0000", "FF0000", "F00")
    /// - Returns: UIColor instance or nil if the hex string is invalid
    convenience init?(hexString: String) {
        let hex = hexString.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int = UInt32()
        Scanner(string: hex).scanHexInt32(&int)
        let a, r, g, b: UInt32
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            return nil
        }
        self.init(red: CGFloat(r) / 255, green: CGFloat(g) / 255, blue: CGFloat(b) / 255, alpha: CGFloat(a) / 255)
    }
}

// MARK: - Element Snapshot Model

/// Represents a snapshot of a UI element at a specific point in time.
/// Contains the element's frame, visibility state, and metadata.
struct ElementSnapshot {
    let targetId: String
    let frame: CGRect
    let isVisible: Bool
    let elementType: String
    let text: String?
    let view: UIView?
    
    init(targetId: String, frame: CGRect, isVisible: Bool, elementType: String, text: String? = nil, view: UIView? = nil) {
        self.targetId = targetId
        self.frame = frame
        self.isVisible = isVisible
        self.elementType = elementType
        self.text = text
        self.view = view
    }
}

// MARK: - Tooltip Configuration Model

/// Comprehensive configuration for tooltip display and behavior.
/// Parses options from JavaScript/React Native and provides default values for all properties.
struct TooltipConfiguration {
    // Content
    let message: String
    let subtitle: String?
    
    // Appearance
    let position: CustomTooltipPosition
    let backgroundColor: UIColor
    let titleColor: UIColor
    let subTitleColor: UIColor
    let duration: TimeInterval?
    let screen: String?
    
    // Layout
    let cornerRadius: CGFloat
    let paddingTop: CGFloat
    let paddingBottom: CGFloat
    let paddingLeft: CGFloat
    let paddingRight: CGFloat
    let marginTop: CGFloat
    let marginBottom: CGFloat
    let marginLeft: CGFloat
    let marginRight: CGFloat
    
    // Typography
    let titleFontSize: CGFloat
    let subTitleFontSize: CGFloat
    let titleAlignment: NSTextAlignment
    let subTitleAlignment: NSTextAlignment
    let titleFontFamily: String
    let titleFontWeight: String
    let subTitleFontFamily: String
    let subTitleFontWeight: String
    
    // Arrow
    let arrowSize: CGFloat
    
    // Interaction
    let dismissOnOutsideTouch: Bool
    let autoDismissMs: Int?
    let triggerDelay: Int?
    
    /// Initializes tooltip configuration from React Native options dictionary.
    /// Provides sensible defaults for all optional properties.
    /// - Parameters:
    ///   - message: The main tooltip message/title (required)
    ///   - subtitle: Optional subtitle text
    ///   - options: Dictionary of configuration options from JavaScript
    init(message: String, subtitle: String? = nil, options: NSDictionary) {
        self.message = message
        self.subtitle = subtitle
        
        // Position
        if let positionString = options["position"] as? String {
            self.position = CustomTooltipPosition(rawValue: positionString) ?? .auto
        } else {
            self.position = .auto
        }
        
        // Colors (supports named colors and hex)
        self.backgroundColor = Self.parseColor(
            from: options["backgroundColor"] as? String,
            defaultColor: .systemBlue
        )
        self.titleColor = Self.parseColor(
            from: options["titleColor"] as? String,
            defaultColor: .white
        )
        self.subTitleColor = Self.parseColor(
            from: options["subTitleColor"] as? String,
            defaultColor: UIColor.white.withAlphaComponent(0.85)
        )
        
        // Duration and screen
        self.duration = (options["duration"] as? NSNumber)?.doubleValue
        self.screen = options["targetScreen"] as? String
        
        // Layout
        self.cornerRadius = CGFloat((options["borderRadius"] as? NSNumber)?.doubleValue ?? 8.0)
        self.paddingTop = CGFloat((options["paddingTop"] as? NSNumber)?.doubleValue ?? 12.0)
        self.paddingBottom = CGFloat((options["paddingBottom"] as? NSNumber)?.doubleValue ?? 12.0)
        self.paddingLeft = CGFloat((options["paddingLeft"] as? NSNumber)?.doubleValue ?? 12.0)
        self.paddingRight = CGFloat((options["paddingRight"] as? NSNumber)?.doubleValue ?? 12.0)
        self.marginTop = CGFloat((options["marginTop"] as? NSNumber)?.doubleValue ?? 10.0)
        self.marginBottom = CGFloat((options["marginBottom"] as? NSNumber)?.doubleValue ?? 10.0)
        self.marginLeft = CGFloat((options["marginLeft"] as? NSNumber)?.doubleValue ?? 10.0)
        self.marginRight = CGFloat((options["marginRight"] as? NSNumber)?.doubleValue ?? 10.0)
        
        // Typography
        self.titleFontSize = CGFloat((options["titleFontSize"] as? NSNumber)?.doubleValue ?? 14.0)
        self.subTitleFontSize = CGFloat((options["subTitleFontSize"] as? NSNumber)?.doubleValue ?? 12.0)
        self.titleAlignment = Self.parseAlignment(options["titleAlignment"] as? String ?? "center")
        self.subTitleAlignment = Self.parseAlignment(options["subTitleAlignment"] as? String ?? "center")
        self.titleFontFamily = Self.parseFontFamily(options["titleFontFamily"] as? String)
        self.titleFontWeight = Self.parseFontWeight(options["titleFontWeight"] as? String)
        self.subTitleFontFamily = Self.parseFontFamily(options["subTitleFontFamily"] as? String)
        self.subTitleFontWeight = Self.parseFontWeight(options["subTitleFontWeight"] as? String)
        
        // Arrow
        self.arrowSize = CGFloat((options["arrowSize"] as? NSNumber)?.doubleValue ?? 10.0)
        
        // Interaction
        self.dismissOnOutsideTouch = (options["dismissOnOutsideTouch"] as? NSNumber)?.boolValue ?? true
        
        if let autoDismissValue = (options["autoDismissMs"] as? NSNumber)?.intValue, autoDismissValue > 0 {
            self.autoDismissMs = autoDismissValue
        } else {
            self.autoDismissMs = nil
        }
        
        if let triggerDelayValue = (options["triggerDelay"] as? NSNumber)?.intValue, triggerDelayValue > 0 {
            self.triggerDelay = triggerDelayValue
        } else {
            self.triggerDelay = nil
        }
    }
    
    // MARK: - Helper Methods
    
    /// Named color lookup map for fast, case-insensitive color parsing.
    /// Created once and reused for all tooltip configurations.
    private static let namedColorMap: [String: UIColor] = [
        "black": .black, "white": .white, "red": .red, "green": .green,
        "blue": .blue, "yellow": .yellow, "orange": .orange, "purple": .purple,
        "brown": .brown, "cyan": .cyan, "magenta": .magenta,
        "gray": .gray, "grey": .gray,
        "darkgray": .darkGray, "darkgrey": .darkGray,
        "lightgray": .lightGray, "lightgrey": .lightGray,
        "clear": .clear,
        "systemblue": .systemBlue, "systemgreen": .systemGreen,
        "systemred": .systemRed, "systemorange": .systemOrange,
        "systemyellow": .systemYellow, "systempink": .systemPink,
        "systempurple": .systemPurple, "systemteal": .systemTeal,
        "systemindigo": .systemIndigo, "systemgray": .systemGray
    ]
    
    /// Parses color from string (named or hex format).
    /// - Parameters:
    ///   - colorString: Color string (e.g., "blue", "#FF0000", "FF0000")
    ///   - defaultColor: Fallback color if parsing fails
    /// - Returns: Parsed UIColor or default color
    private static func parseColor(from colorString: String?, defaultColor: UIColor) -> UIColor {
        guard let colorString = colorString, !colorString.isEmpty else {
            return defaultColor
        }
        
        if let namedColor = namedColorMap[colorString.lowercased()] {
            return namedColor
        }
        
        if let hexColor = UIColor(hexString: colorString) {
            return hexColor
        }
        
        return defaultColor
    }
    
    /// Parses text alignment from string.
    /// - Parameter alignment: Alignment string (e.g., "left", "center", "right")
    /// - Returns: Corresponding NSTextAlignment value
    private static func parseAlignment(_ alignment: String) -> NSTextAlignment {
        switch alignment.lowercased() {
        case "left": return .left
        case "right": return .right
        case "center": return .center
        case "justified": return .justified
        case "natural": return .natural
        default: return .center
        }
    }
    
    /// Parses font family from string.
    /// Supports: Roboto, Inter, Trim
    /// - Parameter fontFamily: Font family string (e.g., "Roboto", "Inter", "Trim")
    /// - Returns: Normalized font family name or "Roboto" as default
    private static func parseFontFamily(_ fontFamily: String?) -> String {
        guard let family = fontFamily?.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() else {
            return "Roboto"
        }
        
        switch family {
        case "roboto":
            return "Roboto"
        case "inter", "inter24pt":
            return "Inter24pt"
        case "trim":
            return "Trim"
        default:
            return "Roboto"
        }
    }
    
    /// Parses font weight from string.
    /// Supports: Bold, Medium, Regular
    /// - Parameter fontWeight: Font weight string (e.g., "bold", "medium", "regular")
    /// - Returns: Normalized font weight name or "Regular" as default
    private static func parseFontWeight(_ fontWeight: String?) -> String {
        guard let weight = fontWeight?.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() else {
            return "Regular"
        }
        
        switch weight {
        case "bold":
            return "Bold"
        case "medium":
            return "Medium"
        case "regular":
            return "Regular"
        default:
            return "Regular"
        }
    }
    
    /// Creates a UIFont with the specified family, weight, and size.
    /// Combines font family and weight to construct the full font name (e.g., "Roboto-Medium").
    /// - Parameters:
    ///   - family: Font family (e.g., "Roboto", "Inter24pt", "Trim")
    ///   - weight: Font weight (e.g., "Bold", "Medium", "Regular")
    ///   - size: Font size in points
    /// - Returns: UIFont instance or system font as fallback
    static func createFont(family: String, weight: String, size: CGFloat) -> UIFont {
        let fontName = "\(family)-\(weight)"
        if let font = UIFont(name: fontName, size: size) {
            return font
        }
        
        // Fallback to system font with appropriate weight
        let systemWeight: UIFont.Weight
        switch weight {
        case "Bold": systemWeight = .bold
        case "Medium": systemWeight = .medium
        case "SemiBold": systemWeight = .semibold
        default: systemWeight = .regular
        }
        return UIFont.systemFont(ofSize: size, weight: systemWeight)
    }
}

// MARK: - Position Enums

/// Tooltip position options exposed to JavaScript/React Native.
/// Maps to internal display positions for rendering.
enum CustomTooltipPosition: String, CaseIterable {
    case top
    case bottom
    case left
    case right
    case auto
    
    /// Converts to internal display position representation.
    var displayPosition: TooltipDisplayPosition {
        switch self {
        case .top: return .above
        case .bottom: return .below
        case .left: return .left
        case .right: return .right
        case .auto: return .auto
        }
    }
}

/// Internal representation of tooltip display position.
/// Used by the view manager for rendering calculations.
enum TooltipDisplayPosition {
    case above
    case below
    case left
    case right
    case auto
}