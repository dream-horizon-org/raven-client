// Step 1: App.tsx with navigation only (NO SDK imports yet)
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import {useEffect, useRef} from 'react'
import {Platform} from 'react-native'
import type {RouteProp} from '@react-navigation/native'
import HomeScreen, {type RootStackParamList} from './Screens/HomeScreen'
import VariantsPreviewScreen from './Screens/VariantsPreviewScreen'
import ExampleDescriptionScreen from './Screens/ExampleDescriptionScreen'
import AddToCartFlowDemo from './Screens/AddToCartFlowDemo'
import {
  Nudge,
  setNavigationRef,
  nudgeClient,
  useNavigationTracker,
  fetchCTA,
  type NudgeClientOptions,
  type NudgeParams,
} from '@dreamhorizonorg/raven-client'

const Stack = createNativeStackNavigator<RootStackParamList>()

function NudgeScreen({route}: {route: RouteProp<RootStackParamList, 'Nudge'>}) {
  const params = route.params as NudgeParams | undefined
  if (!params) return null
  return <Nudge route={{params} as any} />
}

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null)

  // Connect navigation tracker for tooltip system
  useNavigationTracker(navigationRef)

  useEffect(() => {
    nudgeClient.init({
      listeners: {
        appEvent: (eventName, props) =>
          console.log('📊 Analytics:', eventName, props),
        fetchCtaApi: async (url, method, variables) => {
          console.log('🔄 FetchCtaApi callback called:', {
            url,
            method,
            variables,
          })
          throw new Error(
            'Use makeCtaApiCall directly - this callback is not used',
          )
        },
        getAccessToken: () => ({
          token: 'dummy',
          tokenType: 'Bearer',
        }),
      },
      config: {
        baseUrl:
          Platform.OS === 'ios'
            ? 'http://localhost:4000'
            : 'http://10.0.2.2:4000',
        userId: 'mock_user_id',
        appVersion: '1.0.0-mock',
        platform: Platform.OS,
        nudgeRouteName: 'Nudge',
        packageName: 'raven-client-example',
        tenantId: 'mock_tenant_id',
      },
    } as NudgeClientOptions)
    fetchCTA().catch((error) => {
      console.log('Error auto-fetching CTAs after init:', error)
    })
  }, [])

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <NavigationContainer
          ref={(innerRef: NavigationContainerRef<RootStackParamList>) => {
            navigationRef.current = innerRef
            setNavigationRef(innerRef)
          }}>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerShown: false, // Hide header since HomeScreen has bottom tabs with their own headers
              }}
            />
            <Stack.Screen
              name="VariantsPreview"
              component={VariantsPreviewScreen}
              options={{
                title: 'Component Variants',
              }}
            />
            <Stack.Screen
              name="ExampleDescription"
              component={ExampleDescriptionScreen}
              options={{title: 'Example Description'}}
            />
            <Stack.Screen
              name="AddToCartFlowDemo"
              component={AddToCartFlowDemo}
              options={{title: 'Add to Cart Journey'}}
            />
            <Stack.Screen
              name="Nudge"
              component={NudgeScreen}
              options={{
                headerShown: false,
                presentation: 'transparentModal',
                animation: 'fade',
                contentStyle: {
                  backgroundColor: '#00000080',
                },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
