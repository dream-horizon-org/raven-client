# Prerequisites

Before integrating Raven Client, ensure your project meets the following requirements.

## React Native Version

- **Minimum**: React Native 0.70
- **Recommended**: React Native 0.72 or higher

## Required Dependencies

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | >= 18.0 | React library |
| `react-native` | >= 0.70 | React Native framework |
| `@react-navigation/native` | >= 7.0.0 | Navigation container (required for tooltips) |
| `react-native-gesture-handler` | >= 2.20.0 | Gesture handling for bottom sheets |
| `@gorhom/bottom-sheet` | >= 4.6.0 | Bottom sheet component for nudges |

### Optional Dependencies

These are not required but may be useful:

- `react-native-safe-area-context` - For safe area handling
- `lottie-react-native` - For Lottie animations in nudges

## Platform Requirements

### iOS

- iOS 12.0 or higher
- Xcode 14.0 or higher (for development)
- CocoaPods installed

### Android

- Android API level 21 (Android 5.0) or higher
- Gradle 7.0 or higher

## Development Environment

### Required Tools

- Node.js >= 18.0
- npm, yarn, or pnpm package manager
- React Native CLI or Expo CLI

### Recommended Tools

- TypeScript (for type safety)
- ESLint (for code quality)
- Prettier (for code formatting)

## Project Structure

Your React Native project should have a standard structure:

```
your-app/
├── src/
├── android/
├── ios/
├── package.json
└── ...
```

## Navigation Setup

Raven Client requires React Navigation to be set up in your app. If you haven't already, you'll need to:

1. Install React Navigation dependencies
2. Set up a NavigationContainer
3. Configure your navigation stack

See the [Navigation Setup](/getting-started/navigation-setup) for detailed instructions.

## Backend Requirements

The SDK communicates with a backend API to:
- Fetch CTA configurations
- Send analytics events
- Sync state machine states

Ensure you have:
- A backend API endpoint for CTA configuration
- Authentication mechanism (token-based)
- Analytics endpoint (optional)

## Next Steps

Once you've verified all prerequisites are met, proceed to the [Quick Start Guide](/getting-started/quick-start).

