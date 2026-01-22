# CTA Handler API

Functions for processing events and managing CTAs.

## `trackAppEvent(event: CTAEvent)`

Process an app event to trigger CTAs.

```tsx
import {trackAppEvent} from '@dreamhorizonorg/raven-client'

trackAppEvent({
  eventName: 'USER_LOGIN',
  userId: '123',
})
```

### Parameters

- `event: CTAEvent` - The event to process

### CTAEvent

```typescript
type CTAEvent = {
  eventName: string
} & {[key: string]: boolean | string | number}
```

**Properties:**
- `eventName: string` - **Required**: The name of the event
- Any additional properties of type `boolean | string | number` can be added as needed

**Note:** The type allows any properties beyond `eventName`. You can add any context properties needed for filtering, analytics, or state machine transitions. All properties must be of type `boolean | string | number`.

## `sendNudgeAppEvent(eventName: string, props?: Record<string, unknown>)`

Send an analytics event (doesn't trigger CTAs).

```tsx
import {sendNudgeAppEvent} from '@dreamhorizonorg/raven-client'

sendNudgeAppEvent('BUTTON_CLICKED', {
  buttonId: 'signup',
  timestamp: Date.now(),
})
```

### Parameters

- `eventName: string` - Event name
- `props?: Record<string, unknown>` - Event properties

## `fetchCTA(): Promise<void>`

Fetch CTAs from the backend.

```tsx
import {fetchCTA} from '@dreamhorizonorg/raven-client'

await fetchCTA()
```

### Returns

- `Promise<void>` - Resolves when CTAs are fetched

### Example

```tsx
useEffect(() => {
  ravenClient.init({
    /* ... */
  })

  fetchCTA()
    .then(() => {
      console.log('CTAs fetched')
    })
    .catch((error) => {
      console.error('Failed to fetch CTAs:', error)
    })
}, [])
```

## `getCtaFromStorageToMemory()`

Load CTAs from local storage into memory.

```tsx
import {getCtaFromStorageToMemory} from '@dreamhorizonorg/raven-client'

getCtaFromStorageToMemory()
```

### Example

```tsx
useEffect(() => {
  // Load from storage first
  getCtaFromStorageToMemory()

  // Then fetch fresh CTAs
  ravenClient.init({
    /* ... */
  })
  fetchCTA()
}, [])
```

## Example: Event Processing

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
        loginMethod: 'email',
      })
    } catch (error) {
      // Handle error
    }
  }

  return <Button onPress={handleLogin} title="Login" />
}
```

## Example: Screen Tracking

```tsx
import {useEffect} from 'react'
import {useNavigation} from '@react-navigation/native'
import {trackAppEvent} from '@dreamhorizonorg/raven-client'

function useScreenTracking() {
  const navigation = useNavigation()

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      const routeName = navigation.getCurrentRoute()?.name || ''

      trackAppEvent({
        eventName: 'SCREEN_VIEW',
        screenName: routeName,
      })
    })

    return unsubscribe
  }, [navigation])
}
```

## Next Steps

- [Quick Start](/getting-started/quick-start) - Learn about event processing
- [State Machine DSL](/state-machine-dsl/overview) - Understand state machines
