# Event Processing

Learn how to process app events to trigger Engagement in Raven Client.

## Overview

Raven Client is event-driven. Engagement is triggered based on app events that you send to the SDK. The SDK processes these events, evaluates state machine transitions, and executes actions when conditions are met.

## Processing Events

Use `processEventForCTAs` to process events:

```tsx
import { processEventForCTAs } from '@dreamhorizonorg/raven-client';

// Process an event
processEventForCTAs({
  eventName: 'USER_LOGIN',
  routeName: 'Home',
  is_from_rn: true,
  actionDone: false,
  userId: '123',
  timestamp: Date.now(),
});
```

## Event Structure

### CTAEvent

```typescript
interface CTAEvent {
  eventName: string;              // Required: Event name
  routeName: string;              // Required: Current route name
  is_from_rn: boolean;           // Required: Always true for React Native
  actionDone: boolean;            // Required: Whether action was completed
  ActiveScreenName?: string;      // Optional: Active screen name
  [key: string]: boolean | string | number; // Additional event properties
}
```

### Required Fields

- `eventName`: The name of the event (must match events in your Engagement configuration)
- `routeName`: Current navigation route name
- `is_from_rn`: Always set to `true` for React Native
- `actionDone`: Whether the action associated with this event was completed

### Optional Fields

You can add any additional properties that might be used in filters:

```tsx
processEventForCTAs({
  eventName: 'BUTTON_CLICKED',
  routeName: 'Home',
  is_from_rn: true,
  actionDone: false,
  buttonId: 'signup-button',
  userId: '123',
  userType: 'premium',
  timestamp: Date.now(),
});
```

## Common Event Patterns

### User Actions

```tsx
// User login
processEventForCTAs({
  eventName: 'USER_LOGIN',
  routeName: 'Home',
  is_from_rn: true,
  actionDone: false,
  userId: currentUser.id,
});

// Button click
processEventForCTAs({
  eventName: 'BUTTON_CLICKED',
  routeName: 'Home',
  is_from_rn: true,
  actionDone: false,
  buttonId: 'signup-button',
});

// Screen view
processEventForCTAs({
  eventName: 'SCREEN_VIEW',
  routeName: 'Profile',
  is_from_rn: true,
  actionDone: false,
  screenName: 'Profile',
});
```

### State Changes

```tsx
// App state change
processEventForCTAs({
  eventName: 'APP_STATE_CHANGE',
  routeName: 'Home',
  is_from_rn: true,
  actionDone: false,
  state: 'active',
});

// User property change
processEventForCTAs({
  eventName: 'USER_PROPERTY_CHANGED',
  routeName: 'Settings',
  is_from_rn: true,
  actionDone: false,
  property: 'subscription',
  value: 'premium',
});
```

## Sending Analytics Events

Use `sendNudgeAppEvent` to send analytics events (these don't trigger Engagement):

```tsx
import { sendNudgeAppEvent } from '@dreamhorizonorg/raven-client';

sendNudgeAppEvent('BUTTON_CLICKED', {
  buttonId: 'signup-button',
  timestamp: Date.now(),
});
```

## Integration Examples

### React Component

```tsx
import { processEventForCTAs } from '@dreamhorizonorg/raven-client';

function LoginScreen() {
  const handleLogin = async () => {
    try {
      await loginUser();
      
      // Process login event
      processEventForCTAs({
        eventName: 'USER_LOGIN',
        routeName: 'Home',
        is_from_rn: true,
        actionDone: true,
        userId: user.id,
      });
    } catch (error) {
      // Handle error
    }
  };

  return <Button onPress={handleLogin} title="Login" />;
}
```

### Navigation Listener

```tsx
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { processEventForCTAs } from '@dreamhorizonorg/raven-client';

function useScreenTracking() {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      const routeName = navigation.getCurrentRoute()?.name || '';
      
      processEventForCTAs({
        eventName: 'SCREEN_VIEW',
        routeName: routeName,
        is_from_rn: true,
        actionDone: false,
        screenName: routeName,
      });
    });

    return unsubscribe;
  }, [navigation]);
}
```

### Redux Middleware

```tsx
import { processEventForCTAs } from '@dreamhorizonorg/raven-client';

const ravenMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Process specific actions
  if (action.type === 'USER_LOGIN') {
    processEventForCTAs({
      eventName: 'USER_LOGIN',
      routeName: store.getState().navigation.currentRoute,
      is_from_rn: true,
      actionDone: true,
      userId: action.payload.userId,
    });
  }
  
  return result;
};
```

## Best Practices

1. **Process Events Immediately**: Process events as soon as they occur
2. **Include Context**: Add relevant context properties to events
3. **Consistent Naming**: Use consistent event names across your app
4. **Route Tracking**: Always include the current route name
5. **Error Handling**: Handle errors gracefully (SDK won't throw)

## Event Flow

![Event Flow](/img/event-flow.svg)

## Next Steps

- [State Machine DSL](/state-machine-dsl/overview) - Learn how events trigger state transitions
- [Filters](/state-machine-dsl/filters) - Learn about event filters
- [Engagement System](/core-concepts/cta-system) - Understand the Engagement system

