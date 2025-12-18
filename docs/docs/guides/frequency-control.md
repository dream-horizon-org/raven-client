# Frequency Control

Learn how to control how often Engagement is shown using frequency rules.

## Overview

Frequency control prevents Engagement from being shown too often, improving user experience. The SDK supports three types of frequency limits:

1. **Session**: Per app session
2. **Window**: Within a time window
3. **Lifespan**: Across app lifetime

## Session Frequency

Limit how many times Engagement is shown per app session:

```json
{
  "frequency": {
    "session": {
      "limit": 2  // Show max 2 times per session
    }
  }
}
```

**Use Cases:**
- Onboarding flows
- Feature announcements
- Session-specific reminders

## Window Frequency

Limit within a time window:

```json
{
  "frequency": {
    "window": {
      "limit": 3,      // Max 3 times
      "unit": "day",   // Within
      "value": 7       // 7 days
    }
  }
}
```

**Supported Units:**
- `"day"`: Days
- `"hour"`: Hours
- `"minute"`: Minutes

**Use Cases:**
- Weekly reminders
- Daily tips
- Time-based promotions

## Lifespan Frequency

Limit across the app's lifetime:

```json
{
  "frequency": {
    "lifespan": {
      "limit": 5  // Show max 5 times ever
    }
  }
}
```

**Use Cases:**
- One-time announcements
- Important updates
- Critical notifications

## Combined Frequency

Combine all three for fine-grained control:

```json
{
  "frequency": {
    "session": {"limit": 1},
    "window": {"limit": 3, "unit": "day", "value": 7},
    "lifespan": {"limit": 10}
  }
}
```

**Meaning:**
- Max 1 time per session
- Max 3 times per 7 days
- Max 10 times ever

All limits must be satisfied for the Engagement to show.

## Examples

### One-Time Welcome

```json
{
  "frequency": {
    "lifespan": {"limit": 1}
  }
}
```

### Daily Reminder

```json
{
  "frequency": {
    "window": {
      "limit": 1,
      "unit": "day",
      "value": 1
    }
  }
}
```

### Weekly Feature Highlight

```json
{
  "frequency": {
    "window": {
      "limit": 1,
      "unit": "day",
      "value": 7
    }
  }
}
```

### Session-Limited Onboarding

```json
{
  "frequency": {
    "session": {"limit": 1},
    "lifespan": {"limit": 1}
  }
}
```

## Best Practices

1. **Set Appropriate Limits**: Don't annoy users with too many CTAs
2. **Use Session for Onboarding**: Session limits work well for onboarding
3. **Use Window for Reminders**: Window limits for recurring reminders
4. **Use Lifespan for Important**: Lifespan for critical one-time messages
5. **Test Frequency**: Test frequency limits to ensure they work as expected

## Next Steps

- [Engagement System](/core-concepts/cta-system) - Learn about Engagement
- [State Machine DSL](/state-machine-dsl/overview) - Understand state machines

