# State Transitions

State transitions define how your state machine moves between states based on events.

## Basic Transition

A transition specifies:
- **From State**: Current state
- **To State**: Target state
- **Event**: Event that triggers the transition
- **Filters** (optional): Conditions that must be met

## Structure

```json
{
  "stateTransition": {
    "EVENT_NAME": {
      "currentState": [
        {
          "transitionTo": "targetState",
          "filters": { /* optional */ }
        }
      ]
    }
  }
}
```

## Simple Example

```json
{
  "stateTransition": {
    "USER_LOGIN": {
      "0": [
        {
          "transitionTo": "1"
        }
      ]
    }
  }
}
```

**Meaning**: When `USER_LOGIN` event occurs and state machine is in state "0", transition to state "1".

## Multiple Transitions

You can define multiple transitions for the same event:

```json
{
  "stateTransition": {
    "BUTTON_CLICKED": {
      "0": [
        {
          "transitionTo": "1",
          "filters": {
            "operator": "AND",
            "filter": [
              {
                "propertyName": "buttonId",
                "propertyType": "string",
                "comparisonType": "=",
                "comparisonValue": "signup"
              }
            ]
          }
        },
        {
          "transitionTo": "2",
          "filters": {
            "operator": "AND",
            "filter": [
              {
                "propertyName": "buttonId",
                "propertyType": "string",
                "comparisonType": "=",
                "comparisonValue": "login"
              }
            ]
          }
        }
      ]
    }
  }
}
```

**Meaning**:

![Button Transition Flow](/img/button-transition-flow.svg)

## Transition Priority

When multiple transitions are defined, the SDK evaluates them in order and takes the **first matching transition**. Make sure to order them correctly:

```json
{
  "stateTransition": {
    "BUTTON_CLICKED": {
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
        },
        {
          "transitionTo": "2"
          // No filters - this is the default case
        }
      ]
    }
  }
}
```

**Flow**:

![Transition Priority Flow](/img/transition-priority-flow.svg)

## Multiple Events

You can define transitions for multiple events:

```json
{
  "stateTransition": {
    "USER_LOGIN": {
      "0": [{"transitionTo": "1"}]
    },
    "BUTTON_CLICKED": {
      "1": [{"transitionTo": "2"}],
      "2": [{"transitionTo": "3"}]
    },
    "SCREEN_VIEW": {
      "3": [{"transitionTo": "4"}]
    }
  }
}
```

## State Machine Flow Example

```json
{
  "stateTransition": {
    "APP_LAUNCH": {
      "0": [{"transitionTo": "1"}]
    },
    "BUTTON_CLICKED": {
      "1": [{"transitionTo": "2"}],
      "2": [{"transitionTo": "3"}]
    },
    "NUDGE_DISMISSED": {
      "3": [{"transitionTo": "0"}]
    }
  }
}
```

**Flow Diagram**:

![State Machine Flow](/img/state-machine-flow.svg)

## Conditional Transitions with Filters

Use filters to add conditions to transitions:

```json
{
  "stateTransition": {
    "USER_LOGIN": {
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
              },
              {
                "propertyName": "loginCount",
                "propertyType": "number",
                "comparisonType": ">",
                "comparisonValue": 5
              }
            ]
          }
        }
      ]
    }
  }
}
```

**Meaning**: Only transition if user is premium AND has logged in more than 5 times.

See [Filters](/state-machine-dsl/filters) for detailed filter documentation.

## No Transition

If no transition matches, the state machine stays in its current state:

```json
{
  "stateTransition": {
    "BUTTON_CLICKED": {
      "0": [
        {
          "transitionTo": "1",
          "filters": {
            "operator": "AND",
            "filter": [
              {
                "propertyName": "buttonId",
                "propertyType": "string",
                "comparisonType": "=",
                "comparisonValue": "signup"
              }
            ]
          }
        }
      ]
    }
  }
}
```

If `buttonId` is not "signup", no transition occurs and state remains "0".

## Best Practices

1. **Order Matters**: Place more specific transitions before general ones
2. **Use Filters**: Add filters to make transitions conditional
3. **Default Cases**: Include default transitions without filters when needed
4. **Clear State Names**: Use meaningful state names (or numbers) for clarity
5. **Reset States**: Define reset states to clean up completed flows

## Next Steps

- [Filters](/state-machine-dsl/filters) - Learn about conditional filters
- [Actions](/state-machine-dsl/actions) - Understand what happens after transitions
- [Examples](/state-machine-dsl/examples) - See real-world examples

