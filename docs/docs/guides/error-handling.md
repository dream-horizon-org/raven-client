# Error Handling

Learn how to handle errors gracefully in Raven Client.

## Overview

The SDK is designed to fail gracefully. Errors won't crash your app, but you should handle them appropriately.

## Initialization Errors

Handle initialization errors:

```tsx
try {
  ravenClient.init({
    // ... configuration
  })
} catch (error) {
  console.error('Failed to initialize SDK:', error)
  // Fallback behavior
}
```

## CTA Fetch Errors

Handle CTA fetch errors:

```tsx
fetchCTA()
  .then(() => {
    console.log('CTAs fetched successfully')
  })
  .catch((error) => {
    console.error('Failed to fetch CTAs:', error)
    // Fallback: Load from storage
    getCtaFromStorageToMemory()
  })
```

## Event Processing Errors

Event processing errors are handled internally. The SDK logs errors but doesn't throw:

```tsx
// Safe to call - won't throw
trackAppEvent({
  eventName: 'USER_LOGIN',
})
```

## API Errors

Handle API errors in listeners:

```tsx
listeners: {
  getAccessToken: () => {
    try {
      const token = await getAuthToken();
      return {
        token: token,
        tokenType: 'Bearer',
      };
    } catch (error) {
      console.error('Failed to get access token:', error);
      // Return a default or throw
      throw error;
    }
  },
}
```

## Network Errors

Handle network failures:

```tsx
fetchCTA().catch((error) => {
  if (error.message.includes('network')) {
    // Network error - load from storage
    getCtaFromStorageToMemory()
  } else {
    // Other error - log and continue
    console.error('CTA fetch error:', error)
  }
})
```

## Validation Errors

CTAs that fail validation are skipped automatically. Check analytics events:

```tsx
listeners: {
  appEvent: (eventName, props) => {
    if (eventName === 'NudgeCtaInValid') {
      console.warn('CTA validation failed:', props);
      // Handle invalid CTA
    }
  },
}
```

## Error Events

The SDK sends error events:

- `NudgeCtaEventProcessingFailed`: Event processing failed
- `NudgeCtaInValid`: CTA validation failed

Listen for these events:

```tsx
listeners: {
  appEvent: (eventName, props) => {
    if (eventName.includes('Failed') || eventName.includes('InValid')) {
      // Handle error event
      console.error('SDK Error:', eventName, props);
    }
  },
}
```

## Best Practices

1. **Always Handle Errors**: Don't ignore errors
2. **Fallback Behavior**: Provide fallback behavior
3. **Log Errors**: Log errors for debugging
4. **User Experience**: Don't let errors affect UX
5. **Monitor Errors**: Monitor error events in analytics

## Next Steps

- [Troubleshooting](/troubleshooting) - Common issues and solutions
- [Analytics](/features/analytics) - Track error events
