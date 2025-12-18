# Behaviour Tags

Behaviour tags allow you to organize and manage multiple Engagement together with shared exposure rules and relationships.

## What are Behaviour Tags?

Behaviour tags group Engagement that should be managed together:
- **Shared Exposure Rules**: Control how often the group is shown
- **Engagement Relationships**: Define which Engagement can be active together
- **Coordinated Management**: Manage multiple Engagement as a unit

## Structure

```typescript
interface BehaviourTagInfo {
  behaviourTagName: string;
  exposureRule?: ExposureRule;
  ctaRelation?: CtaRelation;
}
```

## Exposure Rules

Control how often Engagement in a behaviour tag are shown:

```json
{
  "behaviourTagName": "onboarding",
  "exposureRule": {
    "session": {"limit": 1},
    "window": {"limit": 3, "unit": "day", "value": 7},
    "lifespan": {"limit": 5},
    "ctasResetAt": [
      {"ctaId": "welcome-cta", "resetAt": 1234567890},
      {"ctaId": "feature-cta", "resetAt": 1234567891}
    ]
  }
}
```

### Session Limit

```json
{
  "session": {"limit": 1}  // Show max 1 time per session
}
```

### Window Limit

```json
{
  "window": {
    "limit": 3,      // Max 3 times
    "unit": "day",   // Within
    "value": 7       // 7 days
  }
}
```

### Lifespan Limit

```json
{
  "lifespan": {"limit": 5}  // Show max 5 times ever
}
```

## Engagement Relations

Define relationships between Engagement in a behaviour tag:

```json
{
  "behaviourTagName": "onboarding",
  "ctaRelation": {
    "shownCta": {
      "rule": "ctaList",
      "ctaList": ["welcome-cta", "feature-cta"]
    },
    "hideCta": {
      "rule": "ctaList",
      "ctaList": ["old-cta"]
    },
    "activeCtas": ["welcome-cta"]
  }
}
```

### Shown Engagement Rule

Engagement that can be shown when certain conditions are met:

```json
{
  "shownCta": {
    "rule": "ctaList",  // or "any"
    "ctaList": ["welcome-cta", "feature-cta"]
  }
}
```

### Hide Engagement Rule

Engagement that should be hidden when certain conditions are met:

```json
{
  "hideCta": {
    "rule": "ctaList",
    "ctaList": ["old-cta"]
  }
}
```

### Active Engagement

Currently active CTAs in the behaviour tag:

```json
{
  "activeCtas": ["welcome-cta", "feature-cta"]
}
```

## Using Behaviour Tags

### Assigning to CTAs

Assign a behaviour tag to a CTA:

```json
{
  "ctaId": "welcome-cta",
  "behaviourTagName": "onboarding",
  "rule": {
    // ... CTA rules
  }
}
```

### Multiple CTAs in One Tag

```json
[
  {
    "ctaId": "welcome-cta",
    "behaviourTagName": "onboarding",
    "rule": { /* ... */ }
  },
  {
    "ctaId": "feature-cta",
    "behaviourTagName": "onboarding",
    "rule": { /* ... */ }
  }
]
```

## Example: Onboarding Flow

```json
{
  "behaviourTags": [
    {
      "behaviourTagName": "onboarding",
      "exposureRule": {
        "session": {"limit": 1},
        "lifespan": {"limit": 1}
      },
      "ctaRelation": {
        "shownCta": {
          "rule": "ctaList",
          "ctaList": ["welcome-cta", "feature-cta", "complete-cta"]
        },
        "activeCtas": []
      }
    }
  ],
  "ctas": [
    {
      "ctaId": "welcome-cta",
      "behaviourTagName": "onboarding",
      "rule": { /* ... */ }
    },
    {
      "ctaId": "feature-cta",
      "behaviourTagName": "onboarding",
      "rule": { /* ... */ }
    },
    {
      "ctaId": "complete-cta",
      "behaviourTagName": "onboarding",
      "rule": { /* ... */ }
    }
  ]
}
```

## Validation

Behaviour tags validate:

1. **Exposure Frequency**: Check if exposure limits are reached
2. **CTA Relations**: Check if CTA can be active based on relations
3. **Active CTAs**: Track which CTAs are currently active

## Best Practices

1. **Logical Grouping**: Group related CTAs together
2. **Clear Names**: Use descriptive behaviour tag names
3. **Set Limits**: Always set exposure limits
4. **Define Relations**: Use CTA relations for coordination
5. **Track Active**: Monitor active CTAs

## Next Steps

- [Engagement System](/core-concepts/cta-system) - Learn about Engagement
- [Filters](/core-concepts/filters) - Add conditional logic

