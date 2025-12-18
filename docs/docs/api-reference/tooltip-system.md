# Tooltip System API

API for managing tooltips in your app.

## `TooltipSystem.show(options: TooltipOptions)`

Show a tooltip.

```tsx
import { TooltipSystem } from '@dreamhorizonorg/raven-client';

TooltipSystem.show({
  title: 'Welcome!',
  subTitle: 'Tap here to get started',
  targetId: 'signup-button',
  position: 'bottom',
});
```

### Parameters

- `options: TooltipOptions` - Tooltip configuration

### Returns

- `void`

## `TooltipSystem.hide(targetId: string)`

Hide a specific tooltip.

```tsx
TooltipSystem.hide('signup-button');
```

### Parameters

- `targetId: string` - Target element ID

### Returns

- `void`

## `TooltipSystem.hideAll()`

Hide all tooltips.

```tsx
TooltipSystem.hideAll();
```

### Returns

- `void`

## `TooltipSystem.showFromCTA(ctaAction: CtaTooltipAction)`

Show a tooltip from a CTA action.

```tsx
import { TooltipSystem } from '@dreamhorizonorg/raven-client';

TooltipSystem.showFromCTA({
  actionId: 'tooltip-action',
  type: 'TOOLTIP',
  template: {
    type: 'TOOLTIP',
    props: {
      title: 'Sign up',
      targetId: 'signup-button',
      position: 'bottom',
    },
  },
});
```

### Parameters

- `ctaAction: CtaTooltipAction` - CTA tooltip action

### Returns

- `void`

## TooltipOptions

```typescript
interface TooltipOptions {
  title: string;                    // Required
  subTitle?: string;
  targetId: string;                 // Required
  position?: 'top' | 'bottom' | 'left' | 'right';
  backgroundColor?: string;
  titleColor?: string;
  subTitleColor?: string;
  titleFontSize?: number;
  subTitleFontSize?: number;
  titleFontFamily?: string;
  subTitleFontFamily?: string;
  titleFontWeight?: 'Bold' | 'Medium' | 'Regular';
  subTitleFontWeight?: 'Bold' | 'Medium' | 'Regular';
  targetScreen?: string;
  triggerType?: 'mount' | 'click' | 'event';
  triggerDelay?: number;
  autoDismissMs?: number;
  dismissOnOutsideTouch?: boolean;
  titleAlignment?: 'left' | 'center' | 'right';
  subTitleAlignment?: 'left' | 'center' | 'right';
  arrowSize?: number;
  borderRadius?: number;
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

## Example: Basic Tooltip

```tsx
import { TooltipSystem } from '@dreamhorizonorg/raven-client';

function HomeScreen() {
  useEffect(() => {
    TooltipSystem.show({
      title: 'Get Started',
      subTitle: 'Tap the sign up button',
      targetId: 'signup-button',
      position: 'bottom',
      autoDismissMs: 5000,
    });
  }, []);

  return (
    <Button testID="signup-button" title="Sign Up" />
  );
}
```

## Example: Screen-Specific Tooltip

```tsx
TooltipSystem.show({
  title: 'Welcome!',
  targetId: 'button',
  targetScreen: 'Home',  // Only on Home screen
  position: 'bottom',
});
```

## Example: Custom Styled Tooltip

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

## Example: Hide Tooltip

```tsx
// Hide specific tooltip
TooltipSystem.hide('signup-button');

// Hide all tooltips
TooltipSystem.hideAll();
```

## Next Steps

- [Tooltips Guide](/features/tooltips) - Learn about tooltips
- [Quick Start](/getting-started/quick-start) - Set up navigation tracking

