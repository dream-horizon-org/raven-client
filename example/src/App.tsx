import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import {useEffect, useRef} from 'react'
import type {RouteProp} from '@react-navigation/native'
import HomeScreen, {type RootStackParamList} from './Screens/HomeScreen'
import VariantsPreviewScreen from './Screens/VariantsPreviewScreen'
import ExampleDescriptionScreen from './Screens/ExampleDescriptionScreen'
import AddToCartFlowDemo from './Screens/AddToCartFlowDemo'
import {
  Nudge,
  setNavigationRef,
  ravenClient,
  useNavigationTracker,
  RAVEN_ROUTE_NAME,
  type RavenParams,
} from '@dreamhorizonorg/raven-client'
import {ravenConfig} from './config/raven.config'

const Stack = createNativeStackNavigator<RootStackParamList>()

function NudgeScreen({route}: {route: RouteProp<RootStackParamList, 'Nudge'>}) {
  const params = route.params as RavenParams | undefined
  if (!params) return null
  return <Nudge route={{params} as any} />
}

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null)

  useNavigationTracker(navigationRef)

  useEffect(() => {
    ravenClient.init(ravenConfig)
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
                headerShown: false,
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
              name={RAVEN_ROUTE_NAME}
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
