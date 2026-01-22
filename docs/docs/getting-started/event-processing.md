# Event Processing

Learn how to process app events to trigger Engagement in Raven Client.

## Overview

Raven Client is event-driven. Engagement is triggered based on app events that you send to the SDK. The SDK processes these events, evaluates state machine transitions, and executes actions when conditions are met.

## Processing Events

Use `trackAppEvent` to process events:

```tsx
import {trackAppEvent} from '@dreamhorizonorg/raven-client'

// Process an event
trackAppEvent({
  eventName: 'USER_LOGIN',
  userId: '123',
  timestamp: Date.now(),
})
```

## Event Structure

### CTAEvent

```typescript
type CTAEvent = {
  eventName: string
} & {[key: string]: boolean | string | number}
```

**Properties:**
- `eventName: string` - **Required**: The name of the event (must match events in your Engagement configuration)
- Any additional properties of type `boolean | string | number` can be added as needed

**Note:** The type allows any properties beyond `eventName`. You can add any context properties needed for filtering, analytics, or state machine transitions. All properties must be of type `boolean | string | number`.

### Example

```tsx
trackAppEvent({
  eventName: 'BUTTON_CLICKED',
  buttonId: 'signup-button',
  userId: '123',
  userType: 'premium',
  timestamp: Date.now(),
  // Any other properties of type boolean | string | number
})
```

## Common Event Patterns

### User Actions

```tsx
// User login
trackAppEvent({
  eventName: 'USER_LOGIN',
  userId: currentUser.id,
  routeName: 'Home',
})

// Button click
trackAppEvent({
  eventName: 'BUTTON_CLICKED',
  buttonId: 'signup-button',
  routeName: 'Home',
})

// Screen view
trackAppEvent({
  eventName: 'SCREEN_VIEW',
  screenName: 'Profile',
  routeName: 'Profile',
})
```

### State Changes

```tsx
// App state change
trackAppEvent({
  eventName: 'APP_STATE_CHANGE',
  state: 'active',
  routeName: 'Home',
})

// User property change
trackAppEvent({
  eventName: 'USER_PROPERTY_CHANGED',
  property: 'subscription',
  value: 'premium',
})
```

## Sending Analytics Events

Use `sendNudgeAppEvent` to send analytics events (these don't trigger Engagement):

```tsx
import {sendNudgeAppEvent} from '@dreamhorizonorg/raven-client'

sendNudgeAppEvent('BUTTON_CLICKED', {
  buttonId: 'signup-button',
  timestamp: Date.now(),
})
```

## Integration Examples

### React Component

```tsx
import {trackAppEvent} from '@dreamhorizonorg/raven-client'

function LoginScreen() {
  const handleLogin = async () => {
    try {
      await loginUser()

      // Process login event
      trackAppEvent({
        eventName: 'USER_LOGIN',
        userId: user.id,
        routeName: 'Home',
      })
    } catch (error) {
      // Handle error
    }
  }

  return <Button onPress={handleLogin} title="Login" />
}
```

### Navigation Listener

```tsx
import {useEffect} from 'react'
import {useNavigation} from '@react-navigation/native'
import {trackAppEvent} from '@dreamhorizonorg/raven-client'

function useScreenTracking() {
  const navigation = useNavigation()

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      const routeName = navigation.getCurrentRoute()?.name || ''

      trackAppEvent({
        eventName: 'SCREEN_VIEW',
        screenName: routeName,
        routeName: routeName,
      })
    })

    return unsubscribe
  }, [navigation])
}
```

### Redux Middleware

```tsx
import {trackAppEvent} from '@dreamhorizonorg/raven-client'

const ravenMiddleware = (store) => (next) => (action) => {
  const result = next(action)

  // Process specific actions
  if (action.type === 'USER_LOGIN') {
    trackAppEvent({
      eventName: 'USER_LOGIN',
      userId: action.payload.userId,
      routeName: store.getState().navigation.currentRoute,
    })
  }

  return result
}
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
