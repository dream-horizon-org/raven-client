# Quick Start

Get up and running with Raven Client in 5 minutes!

> **Note**: Make sure you've completed the [Installation](/getting-started/installation) guide first.

## Step 1: Set Up Navigation

The SDK requires React Navigation. Set up your navigation container:

```tsx
import {NavigationContainer} from '@react-navigation/native'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import {
  Nudge,
  RAVEN_ROUTE_NAME,
  setNavigationRef,
  useNavigationTracker,
  type RavenClientOptions,
} from '@dreamhorizonorg/raven-client'

const Stack = createNativeStackNavigator()

function App() {
  const navigationRef = useRef<NavigationContainerRef>(null)

  // Connect navigation tracker for tooltip system
  useNavigationTracker(navigationRef)

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <NavigationContainer
          ref={(ref) => {
            navigationRef.current = ref
            setNavigationRef(ref)
          }}>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />

            {/* Required: Add Nudge screen for bottom sheets */}
            <Stack.Screen
              name={RAVEN_ROUTE_NAME}
              component={Nudge}
              options={{
                headerShown: false,
                presentation: 'transparentModal',
                animation: 'fade',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
```

## Step 2: Initialize the SDK

Initialize the SDK in your root component:

```tsx
import {useEffect} from 'react'
import {
  ravenClient,
  fetchCTA,
  type RavenClientOptions,
} from '@dreamhorizonorg/raven-client'
import {Platform} from 'react-native'

function App() {
  useEffect(() => {
    // Initialize the SDK
    ravenClient.init({
      listeners: {
        appEvent: (eventName, props) => {
          // Handle analytics events
          console.log('Analytics event:', eventName, props)
        },
        getAccessToken: () => ({
          token: 'your-access-token',
          tokenType: 'Bearer',
        }),
      },
      config: {
        baseUrl: 'https://your-api-base-url.com',
        userId: 'user-123',
        appVersion: '1.0.0',
        platform: Platform.OS, // 'ios' or 'android'
        packageName: 'com.yourcompany.yourapp',
      },
    } as RavenClientOptions)

    // Fetch Engagement after initialization
    fetchCTA().catch(console.error)
  }, [])

  // ... rest of your app
}
```

## Step 3: Process Events

Process app events to trigger Engagement:

```tsx
import {trackAppEvent} from '@dreamhorizonorg/raven-client'

// When a user logs in
trackAppEvent({
  eventName: 'USER_LOGIN',
  userId: '123',
})
```

## Step 4: Send Analytics Events (Optional)

Send analytics events to track user behavior:

```tsx
import {sendNudgeAppEvent} from '@dreamhorizonorg/raven-client'

sendNudgeAppEvent('BUTTON_CLICKED', {
  buttonId: 'signup-button',
  timestamp: Date.now(),
})
```

## Complete Example

Here's a complete example combining all the steps:

```tsx
import React, {useEffect, useRef} from 'react'
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import {Platform} from 'react-native'
import {
  Nudge,
  RAVEN_ROUTE_NAME,
  setNavigationRef,
  ravenClient,
  useNavigationTracker,
  fetchCTA,
  trackAppEvent,
  type RavenClientOptions,
} from '@dreamhorizonorg/raven-client'

const Stack = createNativeStackNavigator()

function HomeScreen() {
  const handleLogin = () => {
    // Process event to trigger CTAs
    trackAppEvent({
      eventName: 'USER_LOGIN',
    })
  }

  return (
    // Your screen content
    <Button onPress={handleLogin} title="Login" />
  )
}

export default function App() {
  const navigationRef = useRef<NavigationContainerRef>(null)

  useNavigationTracker(navigationRef)

  useEffect(() => {
    ravenClient.init({
      listeners: {
        appEvent: (eventName, props) => {
          console.log('Analytics:', eventName, props)
        },
        getAccessToken: () => ({
          token: 'your-token',
          tokenType: 'Bearer',
        }),
      },
      config: {
        baseUrl: 'https://api.example.com',
        userId: 'user-123',
        appVersion: '1.0.0',
        platform: Platform.OS,
        packageName: 'com.example.app',
      },
    } as RavenClientOptions)

    fetchCTA().catch(console.error)
  }, [])

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <NavigationContainer
          ref={(ref) => {
            navigationRef.current = ref
            setNavigationRef(ref)
          }}>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name={RAVEN_ROUTE_NAME}
              component={Nudge}
              options={{
                headerShown: false,
                presentation: 'transparentModal',
                animation: 'fade',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
```

## What's Next?

- Learn about [State Machine DSL](/state-machine-dsl/overview)
- Explore [Engagement System](/core-concepts/cta-system)
- Check out [Tooltip System](/features/tooltips)
- Read the [API Reference](/api-reference/nudge-client)
