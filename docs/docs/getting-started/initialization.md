# Initialization

This guide covers how to initialize Raven Client with proper configuration.

## Basic Initialization

Initialize the SDK in your root component's `useEffect`:

```tsx
import { useEffect } from 'react';
import { nudgeClient, fetchCTA, type NudgeClientOptions } from '@dreamhorizonorg/raven-client';
import { Platform } from 'react-native';

function App() {
  useEffect(() => {
    nudgeClient.init({
      listeners: {
        appEvent: (eventName, props) => {
          // Handle analytics events
          console.log('Analytics event:', eventName, props);
        },
        fetchCtaApi: async (url, method, variables) => {
          // This callback is typically not used
          throw new Error('Use makeCtaApiCall directly');
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
        platform: Platform.OS,
        nudgeRouteName: 'Nudge',
        packageName: 'com.yourcompany.yourapp',
        tenantId: 'your-tenant-id', // Optional: Multi-tenant identifier
      },
    } as NudgeClientOptions);

    // Fetch CTAs after initialization
    fetchCTA().catch(console.error);
  }, []);

  // ... rest of your app
}
```

## Configuration Options

### NudgeClientConfig

```typescript
interface NudgeClientConfig {
  baseUrl: string;              // API base URL
  userId: string | number;       // Current user ID
  appVersion: string;            // App version
  codepushVersion?: string;      // CodePush version (optional)
  platform: string;             // 'ios' or 'android'
  nudgeRouteName: string;        // Route name for Nudge screen
  packageName: string;           // App package/bundle ID
  tenantId?: string;            // Tenant ID for multi-tenant apps (optional)
}
```

### NudgeClientListeners

```typescript
interface NudgeClientListeners {
  appEvent: (eventName: string, props?: unknown) => void;
  fetchCtaApi: <TVariables, TData>(
    url: string,
    method: string,
    variables?: TVariables,
  ) => Promise<TData>;
  getAccessToken: () => AccessToken;
}
```

## Listener Implementations

### appEvent Listener

Called when the SDK needs to send analytics events. Integrate with your analytics service:

```tsx
listeners: {
  appEvent: (eventName, props) => {
    // Send to your analytics service
    yourAnalyticsService.track(eventName, props);
    
    // Or use Firebase Analytics
    analytics().logEvent(eventName, props);
    
    // Or use Mixpanel
    mixpanel.track(eventName, props);
  },
}
```

### getAccessToken Listener

Returns the current authentication token for API requests:

```tsx
listeners: {
  getAccessToken: () => {
    // Get token from your auth system
    const token = await getAuthToken();
    return {
      token: token,
      tokenType: 'Bearer',
    };
  },
}
```

### fetchCtaApi Listener

This callback is typically not used. The SDK handles API calls internally. You can throw an error if called:

```tsx
listeners: {
  fetchCtaApi: async (url, method, variables) => {
    throw new Error('Use makeCtaApiCall directly - this callback is not used');
  },
}
```

## Fetching CTAs

After initialization, fetch CTAs from your backend:

```tsx
useEffect(() => {
  nudgeClient.init({ /* ... */ });
  
  // Fetch CTAs
  fetchCTA()
    .then(() => {
      console.log('CTAs fetched successfully');
    })
    .catch((error) => {
      console.error('Failed to fetch CTAs:', error);
    });
}, []);
```

### Loading CTAs from Storage

If you want to load CTAs from local storage on app start:

```tsx
import { getCtaFromStorageToMemory } from '@dreamhorizonorg/raven-client';

useEffect(() => {
  // Load CTAs from storage first
  getCtaFromStorageToMemory();
  
  // Then initialize and fetch fresh CTAs
  nudgeClient.init({ /* ... */ });
  fetchCTA();
}, []);
```

## Dynamic Configuration

You can update configuration at runtime:

```tsx
// Update user ID when user logs in
nudgeClient.config.userId = newUserId;

// Fetch CTAs again with new user context
fetchCTA();
```

## Error Handling

Handle initialization errors gracefully:

```tsx
useEffect(() => {
  try {
    nudgeClient.init({
      // ... configuration
    });
    
    fetchCTA().catch((error) => {
      console.error('Failed to fetch CTAs:', error);
      // Fallback: Load from storage
      getCtaFromStorageToMemory();
    });
  } catch (error) {
    console.error('Failed to initialize SDK:', error);
  }
}, []);
```

## Best Practices

1. **Initialize Early**: Initialize the SDK as early as possible in your app lifecycle
2. **Handle Errors**: Always handle errors when fetching CTAs
3. **Update User Context**: Update `userId` when users log in/out
4. **Token Refresh**: Ensure `getAccessToken` returns valid tokens
5. **Network Handling**: Handle network failures gracefully

## Next Steps

- [Event Processing](/getting-started/event-processing) - Set up event handling
- [State Machine DSL](/state-machine-dsl/overview) - Learn about state machines

