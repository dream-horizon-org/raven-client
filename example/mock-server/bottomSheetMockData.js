// JS copy of example/src/mocks/bottomSheetMockData.ts

exports.BOTTOM_SHEET_MOCK_DATA = {
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
            backToProductHome: {
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
                      {
                        propertyName: 'totalCartCount',
                        propertyType: 'number',
                        comparisonType: '>',
                        comparisonValue: 0,
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
              type: 'NUDGE_UI',
              actionId: '0_1762371214168',
              config: {
                triggerDelay: 1000,
              },
              template: {
                type: 'BottomSheet',
                props: {
                  testID: 'testID-0',
                  contentStyle: {
                    backgroundColor: '#00000080',
                  },
                },
                actions: [
                  {
                    name: 'dismiss',
                    type: 'dismiss',
                    params: {},
                  },
                ],
                styles: {},
                children: [
                  {
                    type: 'View',
                    props: {
                      testID: 'testID-1',
                    },
                    actions: [],
                    styles: {
                      backgroundColor: '#FFFFFF',
                      borderRadius: 24,
                      width: '100%',
                      paddingLeft: 8,
                      paddingRight: 8,
                      paddingTop: 8,
                      paddingBottom: 8,
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    },
                    children: [
                      {
                        type: 'View',
                        props: {
                          testID: 'testID-2',
                        },
                        actions: [],
                        styles: {
                          width: '100%',
                          paddingLeft: 12,
                          paddingRight: 12,
                          paddingTop: 8,
                          paddingBottom: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                        children: [
                          {
                            type: 'Text',
                            props: {
                              title: [
                                {
                                  value: '😔 Oops! You have items in your cart',
                                  isTemplateString: false,
                                },
                              ],
                              fontWeight: 'bold',
                              testID: 'testID-24',
                            },
                            actions: [],
                            styles: {
                              textAlign: 'center',
                              color: '#111827',
                              fontSize: 18,
                            },
                          },
                        ],
                      },
                      {
                        type: 'Image',
                        props: {
                          uri: 'https://img.icons8.com/emoji/144/shopping-cart-emoji.png',
                          resizeMode: 'contain',
                          testID: 'testID-hero-image',
                        },
                        actions: [],
                        styles: {
                          width: '100%',
                          height: 140,
                          marginTop: 4,
                          marginBottom: 12,
                        },
                      },
                      {
                        type: 'View',
                        props: {
                          testID: 'testID-3',
                        },
                        actions: [],
                        styles: {
                          backgroundColor: '#E5E7EB',
                          height: 1,
                          width: '100%',
                          marginTop: 8,
                          marginBottom: 8,
                        },
                      },
                      {
                        type: 'Text',
                        props: {
                          title: [
                            {
                              value: 'Powered by raven-client',
                              isTemplateString: false,
                            },
                          ],
                          testID: 'testID-powered-by-bottom',
                        },
                        actions: [],
                        styles: {
                          textAlign: 'center',
                          color: '#6B7280',
                          fontSize: 13,
                          paddingTop: 4,
                          paddingBottom: 12,
                        },
                      },
                      {
                        type: 'Button',
                        props: {
                          title: [
                            {
                              value: 'Dismiss',
                              isTemplateString: false,
                            },
                          ],
                          fontWeight: 'bold',
                          testID: 'testID-dismiss',
                        },
                        actions: [
                          {
                            name: 'dismiss',
                            type: 'dismiss',
                            params: {},
                          },
                        ],
                        styles: {
                          backgroundColor: '#007AFF',
                          borderRadius: 10,
                          width: '90%',
                          marginBottom: 12,
                          paddingTop: 12,
                          paddingBottom: 12,
                          alignItems: 'center',
                          textAlign: 'center',
                          color: '#FFFFFF',
                          fontSize: 15,
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
          frequency: {
            session: {
              limit: 100000,
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
