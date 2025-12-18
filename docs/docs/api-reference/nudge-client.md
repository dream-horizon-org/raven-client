# Nudge Client API

The `nudgeClient` is the main entry point for initializing and configuring Raven Client.

## Initialization

### `init(options: NudgeClientOptions)`

Initialize the SDK with configuration and listeners.

```tsx
import { nudgeClient } from '@dreamhorizonorg/raven-client';

nudgeClient.init({
  listeners: {
    appEvent: (eventName, props) => {
      // Handle analytics events
    },
    fetchCtaApi: async (url, method, variables) => {
      throw new Error('Not used');
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
    platform: 'ios',
    nudgeRouteName: 'Nudge',
    packageName: 'com.example.app',
    tenantId: 'your-tenant-id', // Optional
  },
});
```

## Configuration Methods

### `getAccessToken()`

Get the current access token.

```tsx
const token = nudgeClient.getAccessToken();
// Returns: { token: string, tokenType: string }
```

### `getAppVersion()`

Get the app version.

```tsx
const version = nudgeClient.getAppVersion();
// Returns: string
```

### `getUserId()`

Get the current user ID.

```tsx
const userId = nudgeClient.getUserId();
// Returns: string | number
```

### `getPackageNameValue()`

Get the package name.

```tsx
const packageName = nudgeClient.getPackageNameValue();
// Returns: string
```

### `getTenantId()`

Get the tenant ID (if configured).

```tsx
const tenantId = nudgeClient.getTenantId();
// Returns: string | undefined
```

## Configuration Properties

### `config`

Access and modify configuration:

```tsx
// Read
const baseUrl = nudgeClient.config?.baseUrl;

// Modify
nudgeClient.config.userId = 'new-user-id';
```

### `platform`

Current platform:

```tsx
const platform = nudgeClient.platform;
// Returns: 'ios' | 'android'
```

## Types

### `NudgeClientOptions`

```typescript
interface NudgeClientOptions {
  listeners: NudgeClientListeners;
  config: NudgeClientConfig;
}
```

### `NudgeClientConfig`

```typescript
interface NudgeClientConfig {
  baseUrl: string;              // API base URL
  userId: string | number;       // Current user ID
  appVersion: string;            // App version
  codepushVersion?: string;      // CodePush version (optional)
  platform: string;             // 'ios' or 'android'
  nudgeRouteName: string;        // Route name for Nudge screen
  packageName: string;          // App package/bundle ID
  tenantId?: string;            // Tenant ID for multi-tenant apps
}
```

### `NudgeClientListeners`

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

### `AccessToken`

```typescript
interface AccessToken {
  token: string;
  tokenType: string;
}
```

## Example

```tsx
import { useEffect } from 'react';
import { nudgeClient, fetchCTA } from '@dreamhorizonorg/raven-client';
import { Platform } from 'react-native';

function App() {
  useEffect(() => {
    nudgeClient.init({
      listeners: {
        appEvent: (eventName, props) => {
          console.log('Analytics:', eventName, props);
          // Send to your analytics service
        },
        fetchCtaApi: async () => {
          throw new Error('Not used');
        },
        getAccessToken: () => {
          // Get from your auth system
          return {
            token: 'your-token',
            tokenType: 'Bearer',
          };
        },
      },
      config: {
        baseUrl: 'https://api.example.com',
        userId: 'user-123',
        appVersion: '1.0.0',
        platform: Platform.OS,
        nudgeRouteName: 'Nudge',
        packageName: 'com.example.app',
        tenantId: 'your-tenant-id', // Optional
      },
    });

    fetchCTA();
  }, []);

  return <YourApp />;
}
```

## Next Steps

- [Quick Start](/getting-started/quick-start) - Learn how to initialize
- [CTA Handler](/api-reference/cta-handler) - Process events

