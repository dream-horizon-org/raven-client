# Tooltips

Raven Client includes a powerful native tooltip system that can display contextual tooltips on specific UI elements.

## Overview

Tooltips are small informational messages that appear near UI elements to guide users. The SDK provides:
- **Native Implementation**: iOS and Android native tooltips
- **Screen Tracking**: Automatic show/hide based on screen changes
- **CTA Integration**: Trigger tooltips from CTAs
- **Customizable**: Full control over appearance and behavior

## Basic Usage

### Show a Tooltip

```tsx
import { TooltipSystem } from '@dreamhorizonorg/raven-client';

TooltipSystem.show({
  title: 'Welcome!',
  subTitle: 'Tap here to get started',
  targetId: 'signup-button',
  position: 'bottom',
  backgroundColor: '#000000',
  titleColor: '#FFFFFF',
});
```

### Hide a Tooltip

```tsx
// Hide specific tooltip
TooltipSystem.hide('signup-button');

// Hide all tooltips
TooltipSystem.hideAll();
```

## Tooltip Options

```typescript
interface TooltipOptions {
  title: string;                    // Required: Tooltip title
  subTitle?: string;                // Optional: Subtitle
  targetId: string;                 // Required: Target element ID
  position?: 'top' | 'bottom' | 'left' | 'right';
  backgroundColor?: string;          // Background color
  titleColor?: string;              // Title text color
  subTitleColor?: string;          // Subtitle text color
  titleFontSize?: number;           // Title font size
  subTitleFontSize?: number;        // Subtitle font size
  titleFontFamily?: string;        // Title font family
  subTitleFontFamily?: string;     // Subtitle font family
  titleFontWeight?: 'Bold' | 'Medium' | 'Regular';
  subTitleFontWeight?: 'Bold' | 'Medium' | 'Regular';
  targetScreen?: string;           // Screen where tooltip should show
  triggerType?: 'mount' | 'click' | 'event';
  triggerDelay?: number;            // Delay before showing (ms)
  autoDismissMs?: number;           // Auto dismiss after (ms)
  dismissOnOutsideTouch?: boolean; // Dismiss on outside touch
  titleAlignment?: 'left' | 'center' | 'right';
  subTitleAlignment?: 'left' | 'center' | 'right';
  arrowSize?: number;               // Arrow size
  borderRadius?: number;           // Border radius
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}
```

## Target Element

Tooltips target elements by their `testID` or `nativeID`:

```tsx
<Button
  testID="signup-button"  // or nativeID
  title="Sign Up"
  onPress={handleSignUp}
/>
```

## Position

Control where the tooltip appears relative to the target:

```tsx
TooltipSystem.show({
  title: 'Tap here',
  targetId: 'button',
  position: 'bottom',  // 'top' | 'bottom' | 'left' | 'right'
});
```

## Screen-Specific Tooltips

Show tooltips only on specific screens:

```tsx
TooltipSystem.show({
  title: 'Welcome!',
  targetId: 'signup-button',
  targetScreen: 'Home',  // Only show on Home screen
});
```

## Auto Dismiss

Automatically dismiss tooltips after a delay:

```tsx
TooltipSystem.show({
  title: 'Quick tip',
  targetId: 'button',
  autoDismissMs: 5000,  // Dismiss after 5 seconds
});
```

## Trigger Types

### Mount Trigger

Show when target element is mounted:

```tsx
TooltipSystem.show({
  title: 'Welcome!',
  targetId: 'button',
  triggerType: 'mount',
  triggerDelay: 1000,  // Wait 1 second after mount
});
```

### Click Trigger

Show when target element is clicked:

```tsx
TooltipSystem.show({
  title: 'Great!',
  targetId: 'button',
  triggerType: 'click',
});
```

### Event Trigger

Show when a specific event occurs (used with CTAs).

## Styling

Customize tooltip appearance:

```tsx
TooltipSystem.show({
  title: 'Custom Tooltip',
  targetId: 'button',
  backgroundColor: '#000000',
  titleColor: '#FFFFFF',
  borderRadius: 8,
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 12,
  paddingBottom: 12,
  arrowSize: 12,
});
```

## Navigation Tracking

The SDK automatically tracks navigation changes and shows/hides tooltips based on the current screen. Ensure navigation tracking is set up:

```tsx
import { useNavigationTracker } from '@dreamhorizonorg/raven-client';

function App() {
  const navigationRef = useRef<NavigationContainerRef>(null);
  
  // This enables automatic screen-based tooltip management
  useNavigationTracker(navigationRef);
  
  // ... rest of app
}
```

## Tooltips from CTAs

Tooltips can be triggered from CTAs:

```json
{
  "actionId": "show-tooltip",
  "type": "TOOLTIP",
  "template": {
    "type": "Tooltip",
    "props": {
      "title": "Sign up now",
      "subTitle": "Create your account",
      "targetId": "signup-button",
      "targetScreen": "Home",
      "position": "bottom"
    }
  }
}
```

## Example: Onboarding Tooltips

```tsx
import { useEffect } from 'react';
import { TooltipSystem } from '@dreamhorizonorg/raven-client';

function HomeScreen() {
  useEffect(() => {
    // Show tooltip after screen loads
    setTimeout(() => {
      TooltipSystem.show({
        title: 'Get Started',
        subTitle: 'Tap the sign up button',
        targetId: 'signup-button',
        targetScreen: 'Home',
        position: 'bottom',
        autoDismissMs: 5000,
      });
    }, 1000);
  }, []);

  return (
    <View>
      <Button testID="signup-button" title="Sign Up" />
    </View>
  );
}
```

## Best Practices

1. **Use testID/nativeID**: Always set testID or nativeID on target elements
2. **Screen-Specific**: Use targetScreen for screen-specific tooltips
3. **Auto Dismiss**: Set autoDismissMs to prevent tooltips from staying forever
4. **Clear Messages**: Keep tooltip text concise and clear
5. **Position Carefully**: Choose position that doesn't obstruct UI
6. **Track Navigation**: Ensure navigation tracking is enabled

## Troubleshooting

### Tooltip not appearing

- Verify `testID` or `nativeID` matches `targetId`
- Check that target element is mounted and visible
- Ensure `useNavigationTracker` is called
- Verify `targetScreen` matches current screen (if specified)

### Tooltip appearing on wrong screen

- Check `targetScreen` value
- Verify navigation tracking is working
- Ensure screen names match exactly

### Tooltip not dismissing

- Check `autoDismissMs` is set
- Verify `dismissOnOutsideTouch` is true (default)
- Manually hide with `TooltipSystem.hide()`

## Next Steps

- [Quick Start](/getting-started/quick-start) - Set up navigation tracking
- [State Machine DSL Examples](/state-machine-dsl/examples) - See tooltip examples in state machine configurations

