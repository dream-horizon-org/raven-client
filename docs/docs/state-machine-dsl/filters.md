# Filters

Filters allow you to add conditional logic to state transitions. They evaluate event properties and determine whether a transition should occur.

## Overview

Filters support:
- **Property Comparison**: Compare event properties with values
- **Logical Operators**: AND/OR combinations
- **Nested Conditions**: Complex filter groups
- **Mathematical Functions**: Perform calculations on properties

## Basic Filter

```json
{
  "filters": {
    "operator": "AND",
    "filter": [
      {
        "propertyName": "userId",
        "propertyType": "string",
        "comparisonType": "=",
        "comparisonValue": "123"
      }
    ]
  }
}
```

**Meaning**: Transition only if `userId` equals "123".

## Filter Structure

```typescript
interface Filter {
  propertyName: string;        // Event property to check
  propertyType: 'string' | 'number' | 'boolean';
  comparisonType: '=' | '>' | '<' | '>=' | '<=' | '!=';
  comparisonValue: string | boolean | number;
  functions?: FilterFunctions;  // Optional: Mathematical operations
}
```

## Comparison Types

### String Comparisons

```json
{
  "propertyName": "userType",
  "propertyType": "string",
  "comparisonType": "=",
  "comparisonValue": "premium"
}
```

Supported: `=`, `!=`

### Number Comparisons

```json
{
  "propertyName": "loginCount",
  "propertyType": "number",
  "comparisonType": ">",
  "comparisonValue": 5
}
```

Supported: `=`, `>`, `<`, `>=`, `<=`, `!=`

### Boolean Comparisons

```json
{
  "propertyName": "isPremium",
  "propertyType": "boolean",
  "comparisonType": "=",
  "comparisonValue": true
}
```

Supported: `=` (equality only)

## Logical Operators

### AND Operator

All filters must pass:

```json
{
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
```

**Meaning**: User must be premium AND have logged in more than 5 times.

### OR Operator

At least one filter must pass:

```json
{
  "operator": "OR",
  "filter": [
    {
      "propertyName": "userType",
      "propertyType": "string",
      "comparisonType": "=",
      "comparisonValue": "premium"
    },
    {
      "propertyName": "userType",
      "propertyType": "string",
      "comparisonType": "=",
      "comparisonValue": "vip"
    }
  ]
}
```

**Meaning**: User must be premium OR vip.

## Nested Filter Groups

Combine AND and OR with nested groups:

```json
{
  "operator": "AND",
  "filter": [
    {
      "propertyName": "userType",
      "propertyType": "string",
      "comparisonType": "=",
      "comparisonValue": "premium"
    },
    {
      "operator": "OR",
      "filter": [
        {
          "propertyName": "loginCount",
          "propertyType": "number",
          "comparisonType": ">",
          "comparisonValue": 10
        },
        {
          "propertyName": "daysSinceSignup",
          "propertyType": "number",
          "comparisonType": ">",
          "comparisonValue": 30
        }
      ]
    }
  ]
}
```

**Meaning**: User is premium AND (loginCount > 10 OR daysSinceSignup > 30)

## Mathematical Functions

Perform calculations on event properties:

```json
{
  "propertyName": "timestamp",
  "propertyType": "number",
  "comparisonType": ">",
  "comparisonValue": 0,
  "functions": {
    "operator": "-",
    "operand1": "$.currentTime",
    "operand2": "$.timestamp"
  }
}
```

**Meaning**: Check if `currentTime - timestamp > 0` (i.e., timestamp is in the past).

### Function Operators

- `+`: Addition
- `-`: Subtraction

### Operands

- **Numbers**: Direct values
- **Event Properties**: Use `$.propertyName` to reference event properties
- **Special Values**: `$.currentTime` for current timestamp

### Nested Functions

```json
{
  "functions": {
    "operator": "+",
    "operand1": {
      "operator": "-",
      "operand1": "$.currentTime",
      "operand2": "$.timestamp"
    },
    "operand2": 3600000
  }
}
```

**Meaning**: `(currentTime - timestamp) + 3600000`

## Real-World Examples

### User Segment Filter

```json
{
  "operator": "AND",
  "filter": [
    {
      "propertyName": "userType",
      "propertyType": "string",
      "comparisonType": "=",
      "comparisonValue": "premium"
    },
    {
      "propertyName": "accountAge",
      "propertyType": "number",
      "comparisonType": ">",
      "comparisonValue": 30
    },
    {
      "propertyName": "isActive",
      "propertyType": "boolean",
      "comparisonType": "=",
      "comparisonValue": true
    }
  ]
}
```

### Time-Based Filter

```json
{
  "propertyName": "timestamp",
  "propertyType": "number",
  "comparisonType": "<",
  "comparisonValue": 0,
  "functions": {
    "operator": "-",
    "operand1": "$.currentTime",
    "operand2": "$.timestamp"
  }
}
```

**Meaning**: Event occurred less than the calculated time ago.

### Complex Condition

```json
{
  "operator": "AND",
  "filter": [
    {
      "propertyName": "userType",
      "propertyType": "string",
      "comparisonType": "=",
      "comparisonValue": "premium"
    },
    {
      "operator": "OR",
      "filter": [
        {
          "propertyName": "loginCount",
          "propertyType": "number",
          "comparisonType": ">",
          "comparisonValue": 10
        },
        {
          "propertyName": "purchaseCount",
          "propertyType": "number",
          "comparisonType": ">",
          "comparisonValue": 5
        }
      ]
    }
  ]
}
```

## Best Practices

1. **Use AND for Required Conditions**: All must pass
2. **Use OR for Alternatives**: At least one must pass
3. **Order Matters**: Place more specific conditions first
4. **Test Filters**: Verify filters work with your event data
5. **Keep It Simple**: Avoid overly complex nested filters when possible

## Common Patterns

### Check Multiple Values

```json
{
  "operator": "OR",
  "filter": [
    {"propertyName": "screen", "propertyType": "string", "comparisonType": "=", "comparisonValue": "Home"},
    {"propertyName": "screen", "propertyType": "string", "comparisonType": "=", "comparisonValue": "Profile"}
  ]
}
```

### Range Check

```json
{
  "operator": "AND",
  "filter": [
    {"propertyName": "value", "propertyType": "number", "comparisonType": ">=", "comparisonValue": 10},
    {"propertyName": "value", "propertyType": "number", "comparisonType": "<=", "comparisonValue": 100}
  ]
}
```

## Next Steps

- [State Transitions](/state-machine-dsl/state-transitions) - Use filters in transitions
- [Actions](/state-machine-dsl/actions) - Understand actions
- [Examples](/state-machine-dsl/examples) - See filter examples

