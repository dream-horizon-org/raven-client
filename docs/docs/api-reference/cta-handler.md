# CTA Handler API

Functions for processing events and managing CTAs.

## `processEventForCTAs(event: CTAEvent)`

Process an app event to trigger CTAs.

```tsx
import { processEventForCTAs } from '@dreamhorizonorg/raven-client';

processEventForCTAs({
  eventName: 'USER_LOGIN',
  routeName: 'Home',
  is_from_rn: true,
  actionDone: false,
  userId: '123',
});
```

### Parameters

- `event: CTAEvent` - The event to process

### CTAEvent

```typescript
interface CTAEvent {
  eventName: string;              // Required: Event name
  routeName: string;              // Required: Current route
  is_from_rn: boolean;           // Required: Always true
  actionDone: boolean;            // Required: Action completed?
  ActiveScreenName?: string;      // Optional: Active screen
  [key: string]: boolean | string | number; // Additional properties
}
```

## `sendNudgeAppEvent(eventName: string, props?: Record<string, unknown>)`

Send an analytics event (doesn't trigger CTAs).

```tsx
import { sendNudgeAppEvent } from '@dreamhorizonorg/raven-client';

sendNudgeAppEvent('BUTTON_CLICKED', {
  buttonId: 'signup',
  timestamp: Date.now(),
});
```

### Parameters

- `eventName: string` - Event name
- `props?: Record<string, unknown>` - Event properties

## `fetchCTA(): Promise<void>`

Fetch CTAs from the backend.

```tsx
import { fetchCTA } from '@dreamhorizonorg/raven-client';

await fetchCTA();
```

### Returns

- `Promise<void>` - Resolves when CTAs are fetched

### Example

```tsx
useEffect(() => {
  nudgeClient.init({ /* ... */ });
  
  fetchCTA()
    .then(() => {
      console.log('CTAs fetched');
    })
    .catch((error) => {
      console.error('Failed to fetch CTAs:', error);
    });
}, []);
```

## `getCtaFromStorageToMemory()`

Load CTAs from local storage into memory.

```tsx
import { getCtaFromStorageToMemory } from '@dreamhorizonorg/raven-client';

getCtaFromStorageToMemory();
```

### Example

```tsx
useEffect(() => {
  // Load from storage first
  getCtaFromStorageToMemory();
  
  // Then fetch fresh CTAs
  nudgeClient.init({ /* ... */ });
  fetchCTA();
}, []);
```

## Example: Event Processing

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
        loginMethod: 'email',
      });
    } catch (error) {
      // Handle error
    }
  };

  return <Button onPress={handleLogin} title="Login" />;
}
```

## Example: Screen Tracking

```tsx
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { processEventForCTAs } from '@dreamhorizonorg/raven-client';

function useScreenTracking() {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
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

## Next Steps

- [Quick Start](/getting-started/quick-start) - Learn about event processing
- [State Machine DSL](/state-machine-dsl/overview) - Understand state machines

