# Installation

This guide will help you install and set up Raven Client in your React Native project.

## Prerequisites

Before installing Raven Client, ensure your project meets the following requirements:

### React Native Version

- **Minimum**: React Native 0.70
- **Recommended**: React Native 0.72 or higher

### Required Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | >= 18.0 | React library |
| `react-native` | >= 0.70 | React Native framework |
| `@react-navigation/native` | >= 7.0.0 | Navigation container (required for tooltips) |
| `react-native-gesture-handler` | >= 2.20.0 | Gesture handling for bottom sheets |
| `@gorhom/bottom-sheet` | >= 4.6.0 | Bottom sheet component for nudges |

### Platform Requirements

- **iOS**: iOS 12.0 or higher
- **Android**: Android API level 21 (Android 5.0) or higher

### Development Environment

- Node.js >= 18.0
- npm, yarn, or pnpm package manager
- React Native CLI or Expo CLI

### Optional Dependencies

These are not required but may be useful:
- `react-native-safe-area-context` - For safe area handling
- `lottie-react-native` - For Lottie animations in nudges

## Install the Package

### Using npm

```bash
npm install @dreamhorizonorg/raven-client
```

### Using yarn

```bash
yarn add @dreamhorizonorg/raven-client
```

### Using pnpm

```bash
pnpm add @dreamhorizonorg/raven-client
```

## Install Peer Dependencies

The SDK requires several peer dependencies. Install them if you haven't already:

```bash
npm install @react-navigation/native react-native-gesture-handler @gorhom/bottom-sheet
```

### iOS Setup

For iOS, you'll need to install pods:

```bash
cd ios && pod install && cd ..
```

### Android Setup

No additional Android setup is required beyond the standard React Native setup.

## Expo Configuration

If you're using Expo, add the plugin to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      "@dreamhorizonorg/raven-client/app.plugin"
    ]
  }
}
```

## Verify Installation

After installation, you can verify the SDK is properly installed by importing it:

```typescript
import { nudgeClient } from '@dreamhorizonorg/raven-client';

console.log('Raven Client installed successfully!');
```

## Next Steps

Now that you've installed the SDK, proceed to the [Quick Start Guide](/getting-started/quick-start) to initialize and use it in your app.

