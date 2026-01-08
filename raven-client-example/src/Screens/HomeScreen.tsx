import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import ComponentsTab from './ComponentsTab'
import ComplexExamplesTab from './ComplexExamplesTab'

// Type definitions for Stack Navigator screens
// Tab screens (ComponentsTab, ComplexExamplesTab) are not included here
// as they're part of the Tab Navigator, not the Stack Navigator
export type RootStackParamList = {
  Home: undefined
  VariantsPreview: {
    componentType: 'BOTTOMSHEET' | 'TOOLTIP' | 'POPUP'
  }
  ExampleDescription: {
    exampleId: string
    exampleName: string
    exampleDescription: string
  }
  AddToCartFlowDemo: undefined
  Nudge: any // NudgeParams from raven-client
}

const Tab = createBottomTabNavigator()

export default function HomeScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Components"
        component={ComponentsTab}
        options={{
          title: 'Components',
          tabBarLabel: 'Components',
          headerTitle: 'Raven SDK - Components',
        }}
      />
      <Tab.Screen
        name="ComplexExamples"
        component={ComplexExamplesTab}
        options={{
          title: 'Journeys',
          tabBarLabel: 'Journeys',
          headerTitle: 'Raven SDK - Journeys',
        }}
      />
    </Tab.Navigator>
  )
}
