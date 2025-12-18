# Analytics

Raven Client includes built-in analytics tracking for CTAs and user interactions.

## Overview

The SDK automatically tracks:
- CTA processing events
- State machine transitions
- Action executions
- User interactions
- Error events

## Event Types

### CTA Processing Events

- `NudgeCtaProcessingStart`: CTA processing started
- `NudgeCtaStateTransition`: State machine transition occurred
- `NudgeCtaStateTransitionAction`: Action executed
- `NudgeCtaStateMachineReset`: State machine reset
- `NudgeCtaInValid`: CTA validation failed
- `NudgeCtaEventProcessingFailed`: Event processing failed

### Template Events

- `NudgeCtaTemplateFetch`: CTA template fetched

## Sending Events

### Automatic Events

The SDK automatically sends analytics events. Configure the `appEvent` listener:

```tsx
nudgeClient.init({
  listeners: {
    appEvent: (eventName, props) => {
      // Send to your analytics service
      yourAnalyticsService.track(eventName, props);
    },
    // ...
  },
});
```

### Manual Events

Send custom analytics events:

```tsx
import { sendNudgeAppEvent } from '@dreamhorizonorg/raven-client';

sendNudgeAppEvent('BUTTON_CLICKED', {
  buttonId: 'signup',
  timestamp: Date.now(),
});
```

## Event Properties

Events include contextual information:

```typescript
{
  appEventName: string;      // Original app event name
  ctaId: string;             // CTA ID
  stateMachineId: string;    // State machine ID
  currentState: string;      // Current state
  prevState?: string;       // Previous state
  nudgeShownCount: number;   // Number of times shown
  ctaValidTill?: number;     // CTA expiration
  reason?: string;           // Failure reason (if applicable)
  errorMessage?: string;     // Error message (if applicable)
}
```

## Integration Examples

### Firebase Analytics

```tsx
import analytics from '@react-native-firebase/analytics';

nudgeClient.init({
  listeners: {
    appEvent: (eventName, props) => {
      analytics().logEvent(eventName, props);
    },
    // ...
  },
});
```

### Mixpanel

```tsx
import Mixpanel from 'react-native-mixpanel';

nudgeClient.init({
  listeners: {
    appEvent: (eventName, props) => {
      Mixpanel.track(eventName, props);
    },
    // ...
  },
});
```

### Custom Analytics

```tsx
nudgeClient.init({
  listeners: {
    appEvent: (eventName, props) => {
      fetch('https://api.example.com/analytics', {
        method: 'POST',
        body: JSON.stringify({
          event: eventName,
          properties: props,
          timestamp: Date.now(),
        }),
      });
    },
    // ...
  },
});
```

## Event Batching

The SDK batches events for efficient sending:

```tsx
// Events are batched automatically
// Sent when:
// - State machine transitions occur
// - Actions are executed
// - Processing completes
```

## Best Practices

1. **Handle All Events**: Process all analytics events
2. **Include Context**: Add relevant context to events
3. **Error Handling**: Handle analytics errors gracefully
4. **Privacy**: Respect user privacy settings
5. **Performance**: Don't block main thread

## Next Steps

- [Quick Start](/getting-started/quick-start) - Set up analytics
- [API Reference](/api-reference/nudge-client) - See API details

