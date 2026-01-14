# Nudge Client API

The `ravenClient` is the main entry point for initializing and configuring Raven Client.

## Initialization

### `init(options: RavenClientOptions)`

Initialize the SDK with configuration and listeners.

```tsx
import {ravenClient} from '@dreamhorizonorg/raven-client'

ravenClient.init({
  listeners: {
    appEvent: (eventName, props) => {
      // Handle analytics events
    },
    fetchCtaApi: async (url, method, variables) => {
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
    platform: 'ios',
    nudgeRouteName: 'Nudge',
    packageName: 'com.example.app',
    tenantId: 'your-tenant-id', // Optional
  },
})
```

## Configuration Methods

### `getAccessToken()`

Get the current access token.

```tsx
const token = ravenClient.getAccessToken()
// Returns: { token: string, tokenType: string }
```

### `getAppVersion()`

Get the app version.

```tsx
const version = ravenClient.getAppVersion()
// Returns: string
```

### `getUserId()`

Get the current user ID.

```tsx
const userId = ravenClient.getUserId()
// Returns: string | number
```

### `getPackageNameValue()`

Get the package name.

```tsx
const packageName = ravenClient.getPackageNameValue()
// Returns: string
```

### `getTenantId()`

Get the tenant ID (if configured).

```tsx
const tenantId = ravenClient.getTenantId()
// Returns: string | undefined
```

## Configuration Properties

### `config`

Access and modify configuration:

```tsx
// Read
const baseUrl = ravenClient.config?.baseUrl

// Modify
ravenClient.config.userId = 'new-user-id'
```

### `platform`

Current platform:

```tsx
const platform = ravenClient.platform
// Returns: 'ios' | 'android'
```

## Types

### `RavenClientOptions`

```typescript
interface RavenClientOptions {
  listeners: RavenClientListeners
  config: RavenClientConfig
}
```

### `RavenClientConfig`

```typescript
interface RavenClientConfig {
  baseUrl: string // API base URL
  userId: string | number // Current user ID
  appVersion: string // App version
  codepushVersion?: string // CodePush version (optional)
  platform: string // 'ios' or 'android'
  nudgeRouteName: string // Route name for Nudge screen
  packageName: string // App package/bundle ID
  tenantId?: string // Tenant ID for multi-tenant apps
}
```

### `RavenClientListeners`

```typescript
interface RavenClientListeners {
  appEvent: (eventName: string, props?: unknown) => void
  fetchCtaApi: <TVariables, TData>(
    url: string,
    method: string,
    variables?: TVariables,
  ) => Promise<TData>
  getAccessToken: () => AccessToken
}
```

### `AccessToken`

```typescript
interface AccessToken {
  token: string
  tokenType: string
}
```

## Example

```tsx
import {useEffect} from 'react'
import {ravenClient, fetchCTA} from '@dreamhorizonorg/raven-client'
import {Platform} from 'react-native'

function App() {
  useEffect(() => {
    ravenClient.init({
      listeners: {
        appEvent: (eventName, props) => {
          console.log('Analytics:', eventName, props)
          // Send to your analytics service
        },
        fetchCtaApi: async () => {
          throw new Error('Not used')
        },
        getAccessToken: () => {
          // Get from your auth system
          return {
            token: 'your-token',
            tokenType: 'Bearer',
          }
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
    })

    fetchCTA()
  }, [])

  return <YourApp />
}
```

## Next Steps

- [Quick Start](/getting-started/quick-start) - Learn how to initialize
- [CTA Handler](/api-reference/cta-handler) - Process events
