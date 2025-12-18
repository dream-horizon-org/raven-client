# Filters

Filters add conditional logic to Engagement and state transitions. They evaluate event properties to determine if conditions are met.

## Overview

Filters are used in:
- **State Transitions**: Conditional transitions based on event data
- **Engagement Validation**: Additional validation beyond frequency rules

## Quick Example

```json
{
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
```

## Filter Capabilities

Filters support:
- **Property Comparison**: Compare event properties with values (string, number, boolean)
- **Logical Operators**: AND/OR combinations
- **Nested Conditions**: Complex filter groups
- **Mathematical Functions**: Perform calculations on properties

## Usage in State Transitions

Filters are commonly used in state transitions to conditionally move between states:

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
              }
            ]
          }
        }
      ]
    }
  }
}
```

## Next Steps

For detailed filter documentation including all comparison types, logical operators, mathematical functions, and examples, see:

- [State Machine DSL - Filters](/state-machine-dsl/filters) - Complete filter documentation
- [State Transitions](/state-machine-dsl/state-transitions) - Use filters in transitions

