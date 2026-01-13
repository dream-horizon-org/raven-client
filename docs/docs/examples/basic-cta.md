# Basic Engagement Example

A simple example showing how to create and trigger a basic engagement.

## Overview

This example demonstrates:

- Creating a simple engagement
- Triggering it with an event
- Displaying a welcome nudge

## Engagement Configuration

```json
{
  "ctaId": "welcome-nudge",
  "rule": {
    "priority": 1,
    "frequency": {
      "session": {"limit": 1},
      "lifespan": {"limit": 1}
    },
    "stateTransition": {
      "APP_LAUNCH": {
        "0": [{"transitionTo": "1"}]
      }
    },
    "stateToAction": {
      "1": "show-welcome"
    },
    "actions": [
      {
        "actionId": "show-welcome",
        "type": "NUDGE_UI",
        "template": {
          "type": "Bottomsheet",
          "props": {
            "title": "Welcome!",
            "message": "Thanks for downloading our app",
            "primaryButton": {
              "text": "Get Started",
              "action": {
                "type": "DEEPLINK",
                "url": "app://home"
              }
            },
            "secondaryButton": {
              "text": "Maybe Later",
              "action": {
                "type": "DISMISS"
              }
            }
          }
        }
      }
    ],
    "resetStates": ["1"],
    "resetCTAonFirstLaunch": true
  }
}
```

## App Integration

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
  setNavigationRef,
  ravenClient,
  useNavigationTracker,
  fetchCTA,
  trackAppEvent,
  type RavenClientOptions,
} from '@dreamhorizonorg/raven-client'

const Stack = createNativeStackNavigator()

function HomeScreen() {
  return (
    <View>
      <Text>Welcome to the app!</Text>
    </View>
  )
}

export default function App() {
  const navigationRef = useRef<NavigationContainerRef>(null)

  useNavigationTracker(navigationRef)

  useEffect(() => {
    // Initialize SDK
    ravenClient.init({
      listeners: {
        appEvent: (eventName, props) => {
          console.log('Analytics:', eventName, props)
        },
        fetchCtaApi: async () => {
          throw new Error('Not used')
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
        nudgeRouteName: 'Nudge',
        packageName: 'com.example.app',
      },
    } as RavenClientOptions)

    // Fetch CTAs
    fetchCTA().catch(console.error)

    // Process app launch event
    trackAppEvent({
      eventName: 'APP_LAUNCH',
      routeName: 'Home',
      is_from_rn: true,
      actionDone: false,
    })
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
              name="Nudge"
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

## Flow

1. App launches
2. SDK initializes
3. CTAs are fetched
4. `APP_LAUNCH` event is processed
5. State machine transitions from "0" to "1"
6. Welcome nudge is displayed
7. User interacts with nudge
8. State machine resets

## Next Steps

- [Multi-Step Nudge](/examples/multi-step-nudge) - More complex example
- [State Machine DSL Examples](/state-machine-dsl/examples) - More configuration examples
