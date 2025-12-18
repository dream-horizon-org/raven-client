# Navigation Setup

Raven Client requires React Navigation to be properly configured. This guide will help you set it up correctly.

## Why Navigation is Required

The SDK uses React Navigation for:
- **Tooltip System**: Tracking screen changes to show/hide tooltips
- **Bottom Sheets**: Navigating to the Nudge screen for displaying bottom sheets
- **Screen Tracking**: Knowing which screen the user is on for context-aware CTAs

## Basic Setup

### 1. Install React Navigation

```bash
npm install @react-navigation/native @react-navigation/native-stack
```

For bare React Native projects, also install:

```bash
npm install react-native-screens react-native-safe-area-context
```

### 2. Wrap Your App

Wrap your app with the required providers:

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigationTracker, setNavigationRef } from '@dreamhorizonorg/raven-client';

function App() {
  const navigationRef = useRef<NavigationContainerRef>(null);

  // Connect navigation tracker for tooltip system
  useNavigationTracker(navigationRef);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer
          ref={(ref) => {
            navigationRef.current = ref;
            setNavigationRef(ref);
          }}
        >
          {/* Your navigation stack */}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

## Required: Add Nudge Screen

You **must** add the `Nudge` screen to your navigation stack for bottom sheets to work:

```tsx
import { Nudge } from '@dreamhorizonorg/raven-client';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <Stack.Navigator>
      {/* Your app screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      
      {/* Required: Nudge screen for bottom sheets */}
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
  );
}
```

### Important Notes

- The `Nudge` screen name must match the `nudgeRouteName` in your SDK configuration
- Use `transparentModal` presentation for proper bottom sheet display
- Set `headerShown: false` to avoid header conflicts

## Navigation Tracker

The `useNavigationTracker` hook automatically tracks navigation changes for the tooltip system. It:

- Detects screen changes
- Updates tooltip visibility based on screen
- Handles screen-specific tooltip configurations

```tsx
import { useNavigationTracker } from '@dreamhorizonorg/raven-client';

function App() {
  const navigationRef = useRef<NavigationContainerRef>(null);
  
  // This hook automatically tracks navigation
  useNavigationTracker(navigationRef);
  
  // ... rest of your app
}
```

## TypeScript Support

For TypeScript projects, define your navigation types:

```tsx
import { NavigationContainerRef } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  Nudge: undefined;
  // ... other screens
};

const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
```

## Common Issues

### Tooltips not appearing

- Ensure `useNavigationTracker` is called with your navigation ref
- Verify the `targetId` matches the view's `testID` or `nativeID`
- Check that the target view is mounted and visible

### Bottom sheets not showing

- Verify the `Nudge` screen is added to your navigation stack
- Ensure `nudgeRouteName` in config matches your route name
- Check that `fetchCTA()` is called after initialization

## Next Steps

- [Initialization](/getting-started/initialization) - Initialize the SDK
- [Event Processing](/getting-started/event-processing) - Set up event handling

