# Nudges

Nudges are in-app messages displayed as bottom sheets or popups to guide users and drive actions.

## Overview

Raven Client supports multiple nudge types:

- **Bottom Sheets**: Slide up from bottom (NUDGE_UI)
- **Popups**: Modal dialogs (POPUP)

## Bottom Sheet Nudges

Bottom sheets slide up from the bottom of the screen:

```json
{
  "actionId": "welcome-nudge",
  "type": "NUDGE_UI",
  "template": {
    "type": "Bottomsheet",
    "props": {
      "title": "Welcome!",
      "message": "Thanks for using our app",
      "primaryButton": {
        "text": "Get Started",
        "action": {
          "type": "DEEPLINK",
          "url": "app://home"
        }
      }
    }
  }
}
```

## Popup Nudges

Popup nudges appear as modal dialogs:

```json
{
  "actionId": "update-popup",
  "type": "POPUP",
  "template": {
    "type": "Popup",
    "props": {
      "title": "Update Available",
      "message": "A new version is available",
      "image": "https://example.com/update.png",
      "buttons": [
        {
          "text": "Update Now",
          "action": {
            "type": "DEEPLINK",
            "url": "app://update"
          }
        }
      ]
    }
  }
}
```

## Nudge Components

### Title and Message

```json
{
  "title": "Welcome!",
  "message": "Get started with our app"
}
```

### Buttons

#### Primary Button

```json
{
  "primaryButton": {
    "text": "Get Started",
    "action": {
      "type": "DEEPLINK",
      "url": "app://home"
    }
  }
}
```

#### Secondary Button

```json
{
  "secondaryButton": {
    "text": "Maybe Later",
    "action": {
      "type": "DISMISS"
    }
  }
}
```

### Images

```json
{
  "image": "https://example.com/image.png"
}
```

### Lottie Animations

```json
{
  "lottie": {
    "source": "https://example.com/animation.json",
    "autoPlay": true,
    "loop": true
  }
}
```

## Button Actions

### Deep Link

Navigate to a screen:

```json
{
  "type": "DEEPLINK",
  "url": "app://home"
}
```

### Event

Trigger an analytics event:

```json
{
  "type": "EVENT",
  "eventName": "BUTTON_CLICKED",
  "eventParams": [{"key": "buttonId", "value": "signup"}]
}
```

### Dismiss

Dismiss the nudge:

```json
{
  "type": "DISMISS"
}
```

## Nudge Lifecycle

![Nudge Lifecycle](/img/nudge-lifecycle.svg)

## Required Setup

### Add Nudge Screen

You must add the `Nudge` screen to your navigation stack:

```tsx
import {Nudge} from '@dreamhorizonorg/raven-client'

;<Stack.Screen
  name="Nudge"
  component={Nudge}
  options={{
    headerShown: false,
    presentation: 'transparentModal',
    animation: 'fade',
  }}
/>
```

### Configure Route Name

Set `nudgeRouteName` in SDK configuration:

```tsx
ravenClient.init({
  config: {
    nudgeRouteName: 'Nudge', // Must match route name
    // ... other config
  },
})
```

## Triggering Nudges

Nudges are triggered automatically when:

1. State machine reaches a state with a nudge action
2. Action type is `NUDGE_UI` or `POPUP`
3. CTA validation passes (frequency, expiration, etc.)

## Examples

For complete nudge examples with app integration, see:

- [Basic CTA Example](/examples/basic-cta) - Simple welcome nudge
- [Multi-Step Nudge](/examples/multi-step-nudge) - Multi-step onboarding flow
- [State Machine DSL Examples](/state-machine-dsl/examples) - Various state machine examples

## Customization

### Styling

Customize nudge appearance through template props:

```json
{
  "template": {
    "type": "Bottomsheet",
    "props": {
      "title": "Custom Nudge",
      "backgroundColor": "#FFFFFF",
      "titleColor": "#000000",
      "messageColor": "#666666"
    }
  }
}
```

### Delay

Add delay before showing nudge:

```json
{
  "actionId": "delayed-nudge",
  "type": "NUDGE_UI",
  "config": {
    "triggerDelay": 2000 // Show after 2 seconds
  },
  "template": {
    /* ... */
  }
}
```

## Best Practices

1. **Clear Messaging**: Keep titles and messages concise
2. **Action Buttons**: Always provide clear action buttons
3. **Frequency Control**: Set frequency limits to avoid annoyance
4. **Contextual**: Show nudges at relevant moments
5. **Test Thoroughly**: Test nudges on different devices

## Troubleshooting

### Nudge not showing

- Verify `Nudge` screen is added to navigation stack
- Check `nudgeRouteName` matches route name
- Ensure `fetchCTA()` is called after initialization
- Verify CTA validation passes (frequency, expiration)

### Nudge appearing on wrong screen

- Check navigation setup
- Verify route name configuration
- Ensure navigation ref is set correctly

### Buttons not working

- Verify action types are correct
- Check deep link URLs are valid
- Ensure navigation is set up properly

## Next Steps

- [State Machine DSL](/state-machine-dsl/overview) - Learn how nudges are triggered
- [Quick Start](/getting-started/quick-start) - Set up navigation and initialize
- [Examples](/examples/basic-cta) - See nudge examples
