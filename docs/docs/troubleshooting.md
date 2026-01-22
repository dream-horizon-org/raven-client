# Troubleshooting

Common issues and solutions when using Raven Client.

## Nudges Not Showing

### Issue: Nudges don't appear

**Possible Causes:**

1. Nudge screen not added to navigation stack
2. `fetchCTA()` not called after initialization
3. CTA validation failing (frequency, expiration)

**Solutions:**

1. **Verify Nudge Screen is Added:**

```tsx
import {Nudge, RAVEN_ROUTE_NAME} from '@dreamhorizonorg/raven-client'

<Stack.Screen
  name={RAVEN_ROUTE_NAME}
  component={Nudge}
  options={{
    headerShown: false,
    presentation: 'transparentModal',
    animation: 'fade',
  }}
/>
```

2. **Ensure fetchCTA is Called:**

```tsx
useEffect(() => {
  ravenClient.init({
    /* ... */
  })
  fetchCTA().catch(console.error)
}, [])
```

4. **Check CTA Validation:**

- Verify frequency limits haven't been reached
- Check CTA expiration (`ctaValidTill`)
- Ensure behaviour tag exposure is valid

## Tooltips Not Appearing

### Issue: Tooltips don't show

**Possible Causes:**

1. Navigation tracking not set up
2. `testID` or `nativeID` doesn't match `targetId`
3. Target element not mounted or visible
4. `targetScreen` doesn't match current screen

**Solutions:**

1. **Set Up Navigation Tracking:**

```tsx
import {useNavigationTracker} from '@dreamhorizonorg/raven-client'

function App() {
  const navigationRef = useRef<NavigationContainerRef>(null)
  useNavigationTracker(navigationRef)
  // ...
}
```

2. **Verify Target ID:**

```tsx
// Component
;<Button testID="signup-button" title="Sign Up" />

// Tooltip
TooltipSystem.show({
  targetId: 'signup-button', // Must match testID
  // ...
})
```

3. **Check Element Visibility:**

- Ensure target element is mounted
- Verify element is visible on screen
- Check element isn't hidden or covered

4. **Verify Screen Name:**

```tsx
TooltipSystem.show({
  targetId: 'button',
  targetScreen: 'Home', // Must match current screen
  // ...
})
```

## API Errors

### Issue: API requests failing

**Possible Causes:**

1. Incorrect `baseUrl`
2. Invalid access token
3. Network connectivity issues
4. Backend API errors

**Solutions:**

1. **Verify Base URL:**

```tsx
ravenClient.init({
  config: {
    baseUrl: 'https://api.example.com', // Check URL is correct
    // ...
  },
})
```

2. **Check Access Token:**

```tsx
listeners: {
  getAccessToken: () => {
    const token = await getAuthToken();  // Ensure token is valid
    return {
      token: token,
      tokenType: 'Bearer',
    };
  },
}
```

3. **Handle Network Errors:**

```tsx
fetchCTA()
  .then(() => {
    console.log('CTAs fetched')
  })
  .catch((error) => {
    console.error('Failed to fetch CTAs:', error)
    // Fallback: Load from storage
    getCtaFromStorageToMemory()
  })
```

## State Machine Not Transitioning

### Issue: State machine stays in same state

**Possible Causes:**

1. Event name doesn't match
2. Filters not passing
3. No transition defined for event
4. State machine expired (TTL)

**Solutions:**

1. **Verify Event Name:**

```tsx
// Event name must match exactly
trackAppEvent({
  eventName: 'USER_LOGIN', // Must match CTA configuration
  // ...
})
```

2. **Check Filters:**

- Verify filter conditions are met
- Check event properties match filter requirements
- Test filters with different event data

3. **Verify Transitions:**

```json
{
  "stateTransition": {
    "USER_LOGIN": {
      // Event name must match
      "0": [{"transitionTo": "1"}]
    }
  }
}
```

4. **Check TTL:**

```json
{
  "stateMachineTTL": 3600000 // State machine expires after 1 hour
}
```

## CTAs Not Triggering

### Issue: CTAs don't trigger on events

**Possible Causes:**

1. CTAs not fetched
2. Event not processed
3. CTA validation failing
4. Priority conflicts

**Solutions:**

1. **Ensure CTAs are Fetched:**

```tsx
useEffect(() => {
  ravenClient.init({
    /* ... */
  })
  fetchCTA() // Must be called
}, [])
```

2. **Process Events:**

```tsx
// Process events when they occur
trackAppEvent({
  eventName: 'USER_LOGIN',
})
```

3. **Check CTA Validation:**

- Frequency limits
- Expiration dates
- Behaviour tag rules
- Group by requirements

4. **Check Priority:**

```json
{
  "priority": 1 // Lower number = higher priority (1 is higher than 5)
}
```

## Navigation Issues

### Issue: Navigation not working

**Possible Causes:**

1. Navigation ref not set
2. Navigation container not set up
3. Route names don't match

**Solutions:**

1. **Set Navigation Ref:**

```tsx
<NavigationContainer
  ref={(ref) => {
    navigationRef.current = ref;
    setNavigationRef(ref);  // Must call this
  }}
>
```

2. **Verify Navigation Setup:**

```tsx
import {NavigationContainer} from '@react-navigation/native'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
```

## Performance Issues

### Issue: App performance degraded

**Possible Causes:**

1. Too many active state machines
2. Frequent API calls
3. Large CTA configurations

**Solutions:**

1. **Limit State Machines:**

```json
{
  "groupByConfig": {
    "maxActiveStateMachineCount": 50 // Limit active machines
  }
}
```

2. **Optimize API Calls:**

- Use request queue
- Batch updates
- Cache CTAs locally

3. **Optimize CTA Config:**

- Reduce filter complexity
- Limit context parameters
- Use efficient state transitions

## Getting Help

If you're still experiencing issues:

1. **Check Documentation:**
   - [Installation](/getting-started/installation)
   - [API Reference](/api-reference/nudge-client)
   - [State Machine DSL](/state-machine-dsl/overview)

2. **Review Examples:**
   - [Basic CTA](/examples/basic-cta)
   - [Multi-Step Nudge](/examples/multi-step-nudge)

3. **Report Issues:**
   - [GitHub Issues](https://github.com/dream-horizon-org/raven-client/issues)
   - Include error messages and logs
   - Provide code examples

4. **Ask Questions:**
   - [GitHub Discussions](https://github.com/dream-horizon-org/raven-client/discussions)
