# Multi-Step Nudge Example

An example showing a multi-step onboarding flow using state machines.

## Overview

This example demonstrates:
- Multi-step state machine
- Conditional transitions
- Sequential nudge display

## Engagement Configuration

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
          "type": "Bottomsheet",
          "props": {
            "title": "Welcome!",
            "message": "Let's get you started",
            "primaryButton": {
              "text": "Next",
              "action": {
                "type": "EVENT",
                "eventName": "BUTTON_CLICKED",
                "eventParams": [
                  {"key": "buttonId", "value": "next-step-1"}
                ]
              }
            }
          }
        }
      },
      {
        "actionId": "step-2",
        "type": "NUDGE_UI",
        "template": {
          "type": "Bottomsheet",
          "props": {
            "title": "Discover Features",
            "message": "Explore what our app offers",
            "primaryButton": {
              "text": "Next",
              "action": {
                "type": "EVENT",
                "eventName": "BUTTON_CLICKED",
                "eventParams": [
                  {"key": "buttonId", "value": "next-step-2"}
                ]
              }
            }
          }
        }
      },
      {
        "actionId": "step-3",
        "type": "NUDGE_UI",
        "template": {
          "type": "Bottomsheet",
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

## State Flow

![Multi-Step State Flow](/img/multi-step-state-flow.svg)

## App Integration

```tsx
import { processEventForCTAs } from '@dreamhorizonorg/raven-client';

function App() {
  useEffect(() => {
    // Process app launch
    processEventForCTAs({
      eventName: 'APP_LAUNCH',
      routeName: 'Home',
      is_from_rn: true,
      actionDone: false,
    });
  }, []);

  // When nudge button is clicked, process event
  const handleNudgeButtonClick = (buttonId: string) => {
    processEventForCTAs({
      eventName: 'BUTTON_CLICKED',
      routeName: 'Home',
      is_from_rn: true,
      actionDone: false,
      buttonId: buttonId,
    });
  };
}
```

## Next Steps

- [State Machine DSL Examples](/state-machine-dsl/examples) - More configuration examples
- [Tooltips Guide](/features/tooltips) - Learn about tooltips

