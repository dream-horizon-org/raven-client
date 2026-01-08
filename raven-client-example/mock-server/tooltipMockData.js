// JS copy of example/src/mocks/tooltipMockData.ts

exports.TOOLTIP_MOCK_DATA = {
  data: {
    ctas: [
      {
        ctaId: '5',
        rule: {
          stateToAction: {
            1: '0_1762371214168',
          },
          resetStates: ['1'],
          resetCTAonFirstLaunch: true,
          contextParams: [],
          stateTransition: {
            addtocartbuttonclick: {
              0: [
                {
                  transitionTo: '1',
                  filters: {
                    operator: 'AND',
                    filter: [
                      {
                        propertyName: 'selection',
                        propertyType: 'string',
                        comparisonType: '=',
                        comparisonValue: 'Manager Mode',
                      },
                    ],
                  },
                },
              ],
            },
          },
          groupByConfig: {
            maxActiveStateMachineCount: 20,
            groupByKeys: [],
          },
          priority: 1,
          stateMachineTTL: 10800000,
          ctaValidTill: 1857042745000,
          actions: [
            {
              type: 'TOOLTIP',
              actionId: '0_1762371214168',
              config: {
                triggerDelay: 300,
              },
              template: {
                type: 'TOOLTIP',
                props: {
                  title: 'Hey! Your cart is updated',
                  subTitle: 'Powered by raven-client',
                  position: 'top',
                  titleFontSize: 16,
                  subTitleFontSize: 13,
                  autoDismissMs: 0,
                  targetScreen: 'AddToCartFlowDemo',
                  targetId: 'cart-icon',
                  titleColor: '#FFFFFF',
                  subTitleColor: '#FFFFFF',
                  dismissOnOutsideTouch: true,
                  triggerDelay: 300,
                  titleAlignment: 'center',
                  subTitleAlignment: 'center',
                  arrowSize: 8,
                  titleFontFamily: 'Trim',
                  subTitleFontFamily: 'Inter24pt',
                  titleFontWeight: 'Regular',
                  subTitleFontWeight: 'Regular',
                  testID: 'testID-49',
                },
                actions: [],
                styles: {
                  backgroundColor: '#4B5563',
                  borderRadius: 8,
                  paddingLeft: 8,
                  paddingRight: 8,
                  paddingTop: 8,
                  paddingBottom: 8,
                  marginTop: 0,
                  marginBottom: 0,
                  marginLeft: 0,
                  marginRight: 0,
                },
              },
            },
          ],
          frequency: {
            session: {
              limit: 1,
            },
            lifespan: {
              limit: 10000000,
            },
            window: {
              limit: 10000,
              unit: 'days',
              value: 1,
            },
          },
        },
        activeStateMachines: {},
        resetAt: [],
        actionDoneAt: [],
        behaviourTagName: '',
      },
    ],
    behaviourTags: [],
  },
}
