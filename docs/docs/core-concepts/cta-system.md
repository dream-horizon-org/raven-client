# Engagement System

The Engagement system is the core of Raven Client. It manages the lifecycle of in-app messages, nudges, and tooltips.

## What is Engagement?

Engagement is a configuration that defines:
- **When** to show something (state machine transitions)
- **What** to show (actions)
- **How often** to show it (frequency rules)
- **Who** should see it (filters and grouping)

## CTA Structure

```typescript
interface Cta {
  ctaId: string;                    // Unique identifier
  rule: {
    actions: CtaActionType[];      // Actions to execute
    contextParams: string[];        // Context parameters to store
    priority: number;               // Priority (higher = shown first)
    frequency: FrequencyRules;      // Frequency control
    groupByConfig?: GroupByConfig;  // Grouping configuration
    stateToAction: Record<string, string>;  // State → Action mapping
    resetStates: string[];          // States that trigger reset
    resetCTAonFirstLaunch: boolean; // Reset on first launch
    stateTransition: StateTransition; // State transition rules
    stateMachineTTL: number | null;  // Time to live
    ctaValidTill: number | null;    // CTA expiration
  };
  resetAt: number[];               // Timestamps when reset
  actionDoneAt: number[];           // Timestamps when actions executed
  activeStateMachines: ActiveStateMachines; // Active state machines
  behaviourTagName?: string;        // Optional behaviour tag
}
```

## Engagement Lifecycle

![Engagement Lifecycle](/img/engagement-lifecycle.svg)

## Priority

Engagement is processed in priority order. Lower priority numbers are evaluated first (priority 1 is higher than priority 5):

```json
{
  "priority": 1  // Lower number = higher priority
}
```

If multiple Engagement match an event, the one with the lowest priority number (highest priority) is processed first.

## Frequency Control

Control how often Engagement is shown using frequency rules. See the [Frequency Control Guide](/guides/frequency-control) for detailed information.

## Grouping

Group Engagement by user attributes to create personalized experiences. See the [Grouping Guide](/guides/grouping-ctas) for detailed information and examples.

## Validation

Engagement is validated before processing:

1. **Expiration Check**: Is `ctaValidTill` in the future?
2. **Frequency Check**: Has frequency limit been reached?
3. **Behaviour Tag Check**: Is behaviour tag exposure valid?
4. **Group By Check**: Are required groupBy keys present?

## State Machine Management

Each Engagement can have multiple active state machines (when using `groupByConfig`):

```json
{
  "activeStateMachines": {
    "user-123": {
      "currentState": "1",
      "lastTransitionAt": 1234567890,
      "context": {"userId": "123"},
      "createdAt": 1234567890
    },
    "user-456": {
      "currentState": "2",
      "lastTransitionAt": 1234567891,
      "context": {"userId": "456"},
      "createdAt": 1234567890
    }
  }
}
```

## Engagement Expiration

Engagement can expire:

```json
{
  "ctaValidTill": 1735689600000  // Unix timestamp
}
```

After expiration, the Engagement is no longer processed.

## Reset on First Launch

Reset Engagement state on first app launch:

```json
{
  "resetCTAonFirstLaunch": true
}
```

Useful for onboarding flows that should start fresh.

## Best Practices

1. **Unique Engagement IDs**: Use descriptive, unique IDs
2. **Set Priorities**: Use priorities to control order (lower number = higher priority)
3. **Limit Frequency**: Always set frequency limits
4. **Use Grouping**: Group when personalization is needed
5. **Set Expiration**: Set expiration for time-sensitive Engagement
6. **Test Thoroughly**: Test Engagement with different scenarios

## Engagement Processing Flow

![Engagement Processing Flow](/img/engagement-processing-flow.svg)

## Next Steps

- [State Machine DSL](/state-machine-dsl/overview) - Learn about state machines
- [Behaviour Tags](/core-concepts/behaviour-tags) - Organize Engagement
- [Filters](/core-concepts/filters) - Add conditional logic
- [Frequency Control](/guides/frequency-control) - Control how often Engagement is shown
- [Grouping](/guides/grouping-ctas) - Group Engagement by user attributes

