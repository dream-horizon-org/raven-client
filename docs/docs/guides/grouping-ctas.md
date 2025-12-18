# Grouping Engagement

Learn how to group Engagement by user attributes for personalized experiences.

## Overview

Grouping allows you to create separate state machines for different user segments, enabling personalized Engagement flows.

## Basic Grouping

Group by a single attribute:

```json
{
  "groupByConfig": {
    "groupByKeys": ["userId"]
  }
}
```

This creates separate state machines for each unique `userId`.

## Multiple Attributes

Group by multiple attributes:

```json
{
  "groupByConfig": {
    "groupByKeys": ["userId", "userType"]
  }
}
```

This creates separate state machines for each unique combination of `userId` and `userType`.

## Limiting State Machines

Limit the number of active state machines:

```json
{
  "groupByConfig": {
    "groupByKeys": ["userId"],
    "maxActiveStateMachineCount": 100
  }
}
```

When the limit is reached, new state machines won't be created until old ones are reset.

## Context Parameters

Store group by keys in state machine context. See [State Machine DSL Overview](/state-machine-dsl/overview#context) for detailed information about context parameters.

## Example: User-Specific Welcome

```json
{
  "ctaId": "personalized-welcome",
  "rule": {
    "groupByConfig": {
      "groupByKeys": ["userId"],
      "maxActiveStateMachineCount": 1000
    },
    "contextParams": ["userId", "userName"],
    "stateTransition": {
      "USER_LOGIN": {
        "0": [{"transitionTo": "1"}]
      }
    },
    "stateToAction": {
      "1": "welcome-nudge"
    },
    "actions": [
      {
        "actionId": "welcome-nudge",
        "type": "NUDGE_UI",
        "template": {
          "type": "BOTTOMSHEET",
          "props": {
            "title": "Welcome back, {{userName}}!"
          }
        }
      }
    ],
    "resetStates": ["1"]
  }
}
```

## Example: User Type Segmentation

```json
{
  "ctaId": "user-type-cta",
  "rule": {
    "groupByConfig": {
      "groupByKeys": ["userType"],
      "maxActiveStateMachineCount": 10
    },
    "stateTransition": {
      "APP_LAUNCH": {
        "0": [
          {
            "transitionTo": "1",
            "filters": {
              "operator": "AND",
              "filter": [
                {
                  "propertyName": "userType",
                  "propertyType": "string",
                  "comparisonType": "=",
                  "comparisonValue": "premium"
                }
              ]
            }
          }
        ]
      }
    },
    "stateToAction": {
      "1": "premium-nudge"
    },
    "actions": [
      {
        "actionId": "premium-nudge",
        "type": "NUDGE_UI",
        "template": { /* ... */ }
      }
    ],
    "resetStates": ["1"]
  }
}
```

## State Machine ID

The state machine ID is generated from group by keys:

```tsx
// If groupByKeys = ["userId"]
// State machine ID = event.userId

// If groupByKeys = ["userId", "userType"]
// State machine ID = `${event.userId}-${event.userType}`
```

## Best Practices

1. **Choose Relevant Keys**: Group by attributes that affect Engagement behavior
2. **Set Limits**: Use `maxActiveStateMachineCount` to prevent memory issues
3. **Use Context**: Store group by keys in context for later use
4. **Test Grouping**: Test with different user segments
5. **Monitor Performance**: Monitor state machine count

## Next Steps

- [Engagement System](/core-concepts/cta-system) - Learn about Engagement
- [State Machine DSL](/state-machine-dsl/overview) - Understand state machines

