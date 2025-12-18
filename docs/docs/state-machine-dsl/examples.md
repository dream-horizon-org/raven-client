# State Machine DSL Examples

Real-world examples of state machine configurations.

## Example 1: Simple Welcome Nudge

Show a welcome nudge on first app launch:

```json
{
  "ctaId": "welcome-nudge",
  "rule": {
    "priority": 1,
    "frequency": {
      "session": {"limit": 1},
      "window": {"limit": 1, "unit": "day", "value": 1},
      "lifespan": {"limit": 1}
    },
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
        "template": {
          "type": "BOTTOMSHEET",
          "props": {
            "title": "Welcome!",
            "message": "Thanks for downloading our app",
            "primaryButton": {
              "text": "Get Started",
              "action": {
                "type": "DEEPLINK",
                "url": "app://home"
              }
            }
          }
        }
      }
    ],
    "resetStates": ["1"],
    "resetCTAonFirstLaunch": true
  }
}
```

## Example 2: Multi-Step Onboarding

Guide users through multiple onboarding steps:

```json
{
  "ctaId": "onboarding-flow",
  "rule": {
    "priority": 2,
    "frequency": {
      "session": {"limit": 1},
      "lifespan": {"limit": 1}
    },
    "stateTransition": {
      "APP_LAUNCH": {
        "0": [{"transitionTo": "1"}]
      },
      "BUTTON_CLICKED": {
        "1": [
          {
            "transitionTo": "2",
            "filters": {
              "operator": "AND",
              "filter": [
                {
                  "propertyName": "buttonId",
                  "propertyType": "string",
                  "comparisonType": "=",
                  "comparisonValue": "next-step-1"
                }
              ]
            }
          }
        ],
        "2": [
          {
            "transitionTo": "3",
            "filters": {
              "operator": "AND",
              "filter": [
                {
                  "propertyName": "buttonId",
                  "propertyType": "string",
                  "comparisonType": "=",
                  "comparisonValue": "next-step-2"
                }
              ]
            }
          }
        ]
      },
      "NUDGE_DISMISSED": {
        "3": [{"transitionTo": "0"}]
      }
    },
    "stateToAction": {
      "1": "step-1",
      "2": "step-2",
      "3": "step-3"
    },
    "actions": [
      {
        "actionId": "step-1",
        "type": "NUDGE_UI",
        "template": {
          "type": "BOTTOMSHEET",
          "props": {
            "title": "Welcome!",
            "message": "Let's get you started",
            "primaryButton": {
              "text": "Next",
              "action": {
                "type": "EVENT",
                "eventName": "BUTTON_CLICKED",
                "eventParams": [{"key": "buttonId", "value": "next-step-1"}]
              }
            }
          }
        }
      },
      {
        "actionId": "step-2",
        "type": "NUDGE_UI",
        "template": {
          "type": "BOTTOMSHEET",
          "props": {
            "title": "Discover Features",
            "message": "Explore what our app offers",
            "primaryButton": {
              "text": "Next",
              "action": {
                "type": "EVENT",
                "eventName": "BUTTON_CLICKED",
                "eventParams": [{"key": "buttonId", "value": "next-step-2"}]
              }
            }
          }
        }
      },
      {
        "actionId": "step-3",
        "type": "NUDGE_UI",
        "template": {
          "type": "BOTTOMSHEET",
          "props": {
            "title": "You're All Set!",
            "message": "Start using the app now",
            "primaryButton": {
              "text": "Get Started",
              "action": {
                "type": "DEEPLINK",
                "url": "app://home"
              }
            }
          }
        }
      }
    ],
    "resetStates": ["3"]
  }
}
```

## Example 3: Conditional Premium Upsell

Show premium upsell only to free users after certain conditions:

```json
{
  "ctaId": "premium-upsell",
  "rule": {
    "priority": 3,
    "frequency": {
      "session": {"limit": 2},
      "window": {"limit": 3, "unit": "day", "value": 7}
    },
    "stateTransition": {
      "FEATURE_USED": {
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
                  "comparisonValue": "free"
                },
                {
                  "propertyName": "featureUsageCount",
                  "propertyType": "number",
                  "comparisonType": ">",
                  "comparisonValue": 5
                }
              ]
            }
          }
        ]
      }
    },
    "stateToAction": {
      "1": "show-upsell"
    },
    "actions": [
      {
        "actionId": "show-upsell",
        "type": "NUDGE_UI",
        "template": {
          "type": "BOTTOMSHEET",
          "props": {
            "title": "Unlock Premium",
            "message": "Get unlimited access to all features",
            "primaryButton": {
              "text": "Upgrade Now",
              "action": {
                "type": "DEEPLINK",
                "url": "app://premium"
              }
            },
            "secondaryButton": {
              "text": "Maybe Later",
              "action": {
                "type": "DISMISS"
              }
            }
          }
        }
      }
    ],
    "resetStates": ["1"]
  }
}
```

## Example 4: Tooltip on Button

Show a tooltip on a specific button:

```json
{
  "ctaId": "signup-tooltip",
  "rule": {
    "priority": 1,
    "frequency": {
      "session": {"limit": 1},
      "lifespan": {"limit": 3}
    },
    "stateTransition": {
      "SCREEN_VIEW": {
        "0": [
          {
            "transitionTo": "1",
            "filters": {
              "operator": "AND",
              "filter": [
                {
                  "propertyName": "screenName",
                  "propertyType": "string",
                  "comparisonType": "=",
                  "comparisonValue": "Home"
                }
              ]
            }
          }
        ]
      }
    },
    "stateToAction": {
      "1": "show-tooltip"
    },
    "actions": [
      {
        "actionId": "show-tooltip",
        "type": "TOOLTIP",
        "template": {
          "type": "TOOLTIP",
          "props": {
            "title": "Sign up now",
            "subTitle": "Create your account",
            "targetId": "signup-button",
            "targetScreen": "Home",
            "position": "bottom",
            "autoDismissMs": 5000
          },
          "styles": {
            "backgroundColor": "#000000",
            "borderRadius": 8
          }
        }
      }
    ],
    "resetStates": ["1"]
  }
}
```

## Example 5: Grouped CTAs by User

Create separate state machines for different users:

```json
{
  "ctaId": "personalized-welcome",
  "rule": {
    "priority": 1,
    "groupByConfig": {
      "groupByKeys": ["userId"],
      "maxActiveStateMachineCount": 100
    },
    "contextParams": ["userId", "userName"],
    "stateTransition": {
      "USER_LOGIN": {
        "0": [{"transitionTo": "1"}]
      }
    },
    "stateToAction": {
      "1": "personalized-welcome"
    },
    "actions": [
      {
        "actionId": "personalized-welcome",
        "type": "NUDGE_UI",
        "template": {
          "type": "BOTTOMSHEET",
          "props": {
            "title": "Welcome back, {{userName}}!",
            "message": "We've missed you"
          }
        }
      }
    ],
    "resetStates": ["1"]
  }
}
```

## Example 6: Time-Based Reminder

Show reminder after a time period:

```json
{
  "ctaId": "reminder-cta",
  "rule": {
    "priority": 2,
    "stateMachineTTL": 86400000,
    "stateTransition": {
      "APP_LAUNCH": {
        "0": [
          {
            "transitionTo": "1",
            "filters": {
              "operator": "AND",
              "filter": [
                {
                  "propertyName": "lastActiveTime",
                  "propertyType": "number",
                  "comparisonType": "<",
                  "comparisonValue": 0,
                  "functions": {
                    "operator": "-",
                    "operand1": "$.currentTime",
                    "operand2": "$.lastActiveTime"
                  }
                }
              ]
            }
          }
        ]
      }
    },
    "stateToAction": {
      "1": "show-reminder"
    },
    "actions": [
      {
        "actionId": "show-reminder",
        "type": "NUDGE_UI",
        "template": {
          "type": "BOTTOMSHEET",
          "props": {
            "title": "We Miss You!",
            "message": "Come back and continue where you left off"
          }
        }
      }
    ],
    "resetStates": ["1"]
  }
}
```

## Example 7: Complex Filter Logic

Multiple conditions with nested logic:

```json
{
  "ctaId": "complex-cta",
  "rule": {
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
          }
        ]
      }
    },
    "stateToAction": {
      "1": "show-nudge"
    },
    "actions": [
      {
        "actionId": "show-nudge",
        "type": "NUDGE_UI",
        "template": { /* ... */ }
      }
    ],
    "resetStates": ["1"]
  }
}
```

## Best Practices from Examples

1. **Use Reset States**: Always define reset states for completed flows
2. **Set Frequency Limits**: Prevent CTAs from showing too often
3. **Use Filters**: Make CTAs contextual and relevant
4. **Group When Needed**: Use groupByConfig for personalized experiences
5. **Set TTL**: Use stateMachineTTL for time-sensitive CTAs

## Next Steps

- [State Machine Overview](/state-machine-dsl/overview) - Understand the basics
- [State Transitions](/state-machine-dsl/state-transitions) - Learn about transitions
- [Filters](/state-machine-dsl/filters) - Master filter logic

