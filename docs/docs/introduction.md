# Introduction

Welcome to the **Raven Client** documentation! 

Raven Client is a powerful React Native SDK designed to help you manage in-app messaging, nudges, ToolTip, and Engagement in your mobile applications. Built with a sophisticated state machine system, it enables you to create complex, event-driven user experiences with ease.

## What is Raven Client?

Raven Client provides a comprehensive solution for:

- 🎯 **In App Engagement**: Display contextual nudges and bottom sheets
- 💬 **ToolTip**: Native tooltip system with screen tracking
- 📊 **Event Driven Engagement**: Trigger Engagement based on app events
- 🔄 **State Management**: Built-in state machine for Engagement lifecycle
- 📱 **Cross-Platform**: Works seamlessly on both iOS and Android
- 🎨 **Customizable**: Fully customizable UI components

## Key Features

### State Machine DSL

The SDK includes a powerful State Machine DSL that allows you to define complex user flows. You can create multi-step nudges, conditional transitions, and sophisticated user journeys based on app events.

### Event-Driven Architecture

Engagement is triggered based on app events, allowing you to create contextual experiences that respond to user behavior in real-time.

### Frequency Control

Control how often Engagement is shown with fine-grained frequency rules:
- **Session-based**: Limit per app session
- **Window-based**: Limit within a time window
- **Lifespan-based**: Limit across the app's lifetime

### Grouping & Context

Group Engagement by user attributes or context, enabling personalized experiences for different user segments.

### Behaviour Tags

Organize and manage multiple Engagement together using behaviour tags, with shared exposure rules and relationships.

## Architecture Overview

The SDK follows a clean, event-driven architecture:

![Architecture Diagram](/img/architecture-diagram.svg)

## How It Works

1. **Initialization**: Initialize the SDK with your configuration
2. **Fetch Engagement**: Fetch Engagement configurations from your backend
3. **Event Processing**: Process app events to trigger state transitions
4. **State Transitions**: State machine evaluates transitions based on events and filters
5. **Action Execution**: Actions are executed when states are reached
6. **UI Rendering**: Nudges, ToolTip, or other actions are displayed to users

## Next Steps

Ready to get started? Check out our [Installation Guide](/getting-started/installation) to begin integrating Raven Client into your React Native application.

## Support

- 📖 Read the [full documentation](/getting-started/installation)
- 🐛 Report bugs on [GitHub Issues](https://github.com/dream-horizon-org/raven-client/issues)
- 💬 Ask questions in [GitHub Discussions](https://github.com/dream-horizon-org/raven-client/discussions)
- 📝 Check out [Contributing Guidelines](https://github.com/dream-horizon-org/raven-client/blob/main/CONTRIBUTING.md)

---

Made with ❤️ by Horizon Engineering

