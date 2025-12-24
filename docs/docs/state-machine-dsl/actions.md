# Actions

Actions define what happens when a state machine reaches a specific state. Raven Client supports multiple action types.

## Action Types

### 1. NUDGE_UI

Display a bottom sheet nudge:

```json
{
  "actionId": "show-welcome",
  "type": "NUDGE_UI",
  "template": {
    "type": "Bottomsheet",
    "props": {
      "title": "Welcome!",
      "message": "Thanks for using our app"
    }
  }
}
```

### 2. POPUP

Display a popup/modal nudge:

```json
{
  "actionId": "show-popup",
  "type": "POPUP",
  "template": {
    "type": "Popup",
    "props": {
      "title": "Important Update",
      "message": "Please update your app"
    }
  }
}
```

### 3. TOOLTIP

Show a tooltip on a specific element:

```json
{
  "actionId": "show-tooltip",
  "type": "TOOLTIP",
  "template": {
    "type": "Tooltip",
    "props": {
      "title": "Tap here",
      "subTitle": "To get started",
      "targetId": "signup-button",
      "position": "bottom"
    }
  }
}
```

### 4. ACTION

Trigger an analytics event (no UI):

```json
{
  "actionId": "track-event",
  "type": "NUDGE_ACTION",
  "template": {
    "eventName": "CTA_TRIGGERED",
    "eventParams": [
      {
        "key": "ctaId",
        "value": "welcome-nudge"
      }
    ]
  }
}
```

## Mapping States to Actions

Use `stateToAction` to map states to actions:

```json
{
  "stateToAction": {
    "1": "show-welcome",
    "2": "show-tooltip",
    "3": "track-event"
  },
  "actions": [
    {
      "actionId": "show-welcome",
      "type": "NUDGE_UI",
      "template": { /* ... */ }
    },
    {
      "actionId": "show-tooltip",
      "type": "TOOLTIP",
      "template": { /* ... */ }
    },
    {
      "actionId": "track-event",
      "type": "NUDGE_ACTION",
      "template": { /* ... */ }
    }
  ]
}
```

## Action Configuration

Actions can have configuration options:

```json
{
  "actionId": "delayed-nudge",
  "type": "NUDGE_UI",
  "config": {
    "triggerDelay": 2000  // Delay in milliseconds
  },
  "template": { /* ... */ }
}
```

## Nudge Actions

### Bottom Sheet (NUDGE_UI)

```json
{
  "actionId": "bottomsheet-nudge",
  "type": "NUDGE_UI",
  "template": {
    "type": "Bottomsheet",
    "props": {
      "title": "Welcome!",
      "message": "Get started with our app",
      "primaryButton": {
        "text": "Get Started",
        "action": { /* action config */ }
      },
      "secondaryButton": {
        "text": "Maybe Later",
        "action": { /* action config */ }
      }
    }
  }
}
```

### Popup (POPUP)

```json
{
  "actionId": "popup-nudge",
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
          "action": { /* action config */ }
        }
      ]
    }
  }
}
```

## Tooltip Actions

```json
{
  "actionId": "button-tooltip",
  "type": "TOOLTIP",
  "template": {
    "type": "Tooltip",
    "props": {
      "title": "Tap here to sign up",
      "subTitle": "Create your account in seconds",
      "targetId": "signup-button",
      "targetScreen": "Home",
      "position": "bottom",
      "backgroundColor": "#000000",
      "titleColor": "#FFFFFF",
      "autoDismissMs": 5000,
      "dismissOnOutsideTouch": true
    },
    "styles": {
      "backgroundColor": "#000000",
      "borderRadius": 8,
      "padding": 16
    }
  }
}
```

## Event Actions

Trigger analytics events without showing UI:

```json
{
  "actionId": "track-cta",
  "type": "NUDGE_ACTION",
  "template": {
    "eventName": "CTA_TRIGGERED",
    "eventParams": [
      {
        "key": "ctaId",
        "value": "welcome-nudge"
      },
      {
        "key": "state",
        "value": "1"
      }
    ]
  }
}
```

## Action Flow

![Action Flow](/img/action-flow.svg)

## Multiple Actions

You can define multiple actions and use them in different states:

```json
{
  "stateToAction": {
    "1": "welcome-nudge",
    "2": "feature-tooltip",
    "3": "track-conversion"
  },
  "actions": [
    {
      "actionId": "welcome-nudge",
      "type": "NUDGE_UI",
      "template": { /* ... */ }
    },
    {
      "actionId": "feature-tooltip",
      "type": "TOOLTIP",
      "template": { /* ... */ }
    },
    {
      "actionId": "track-conversion",
      "type": "NUDGE_ACTION",
      "template": { /* ... */ }
    }
  ]
}
```

## Action Done Tracking

When an action is executed, the SDK tracks it:

- `actionDoneAt`: Array of timestamps when actions were executed
- Used for analytics and frequency control

## Best Practices

1. **Clear Action IDs**: Use descriptive action IDs
2. **Reusable Actions**: Define actions that can be reused across states
3. **Action Order**: Consider the order of actions in multi-step flows
4. **Error Handling**: Actions fail gracefully if templates are invalid
5. **Testing**: Test actions with different configurations

## Next Steps

- [Examples](/state-machine-dsl/examples) - See action examples
- [Tooltip System](/features/tooltips) - Learn about tooltips
- [Nudges](/features/nudges) - Learn about nudges

