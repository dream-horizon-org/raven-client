# State Machine DSL Overview

The State Machine DSL is the core of Raven Client. It allows you to define complex user flows and conditional logic for CTAs.

## What is a State Machine?

A state machine is a computational model that consists of:
- **States**: Different stages in a user flow
- **Transitions**: Movement between states based on events
- **Actions**: What happens when reaching a state
- **Context**: Data stored during the state machine's lifecycle

## Basic Concepts

### States

States are represented as strings (typically numbers like "0", "1", "2"). Each state can have:
- An associated action
- Transition rules to other states
- Context data

### State Transitions

Transitions define how the state machine moves from one state to another:

```json
{
  "stateTransition": {
    "USER_LOGIN": {
      "0": [
        {
          "transitionTo": "1",
          "filters": { /* optional filters */ }
        }
      ]
    }
  }
}
```

This means: "When USER_LOGIN event occurs in state 0, transition to state 1 (if filters pass)".

### Actions

Actions are executed when a state is reached:

```json
{
  "stateToAction": {
    "1": "action-1"
  },
  "actions": [
    {
      "actionId": "action-1",
      "type": "NUDGE_UI",
      "template": { /* nudge template */ }
    }
  ]
}
```

## State Machine Lifecycle

![State Machine Lifecycle](/img/state-machine-lifecycle.svg)

## Example: Simple Welcome Nudge

A basic example showing state transitions:

```json
{
  "ctaId": "welcome-nudge",
  "rule": {
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
        "template": { "title": "Welcome!" }
      }
    ],
    "resetStates": ["1"]
  }
}
```

**Flow:**

![State Flow](/img/state-flow.svg)

For complete examples with app integration, see [Examples](/examples/basic-cta) and [State Machine DSL Examples](/state-machine-dsl/examples).

## State Machine Properties

### Context

State machines can store context data:

```json
{
  "contextParams": ["userId", "screenName"]
}
```

When events occur, context parameters are extracted and stored:

```tsx
processEventForCTAs({
  eventName: 'USER_LOGIN',
  userId: '123',
  screenName: 'Home',
  // ... other props
});
```

The state machine stores `userId` and `screenName` in its context for later use.

### TTL (Time To Live)

State machines can expire after a certain time:

```json
{
  "stateMachineTTL": 3600000  // 1 hour in milliseconds
}
```

### Reset States

States that trigger a reset when reached:

```json
{
  "resetStates": ["3", "5"]
}
```

When the state machine reaches a reset state, it's deleted and frequency counters are incremented.

## Grouping State Machines

You can create multiple state machines for the same Engagement using `groupByConfig`. See the [Grouping Guide](/guides/grouping-ctas) for detailed information and examples.

## Next Steps

- [State Transitions](/state-machine-dsl/state-transitions) - Learn about transition rules
- [Filters](/state-machine-dsl/filters) - Add conditional logic to transitions
- [Actions](/state-machine-dsl/actions) - Understand different action types
- [Examples](/state-machine-dsl/examples) - See real-world examples

