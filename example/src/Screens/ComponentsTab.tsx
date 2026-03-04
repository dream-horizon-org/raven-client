import {useState} from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import type {NativeStackNavigationProp} from '@react-navigation/native-stack'
import type {RootStackParamList} from './HomeScreen'
import {updateUserProfile} from '@dreamhorizonorg/raven-client'
import type {UpdateUserProfileParams} from '@dreamhorizonorg/raven-client'

const userProfileSample: UpdateUserProfileParams = {
  userId: 'mock_user_id',
  firstName: 'First',
  lastName: 'Last',
}

// Tab screens nested in Home can navigate to parent stack screens
// Using 'Home' as the screen name since tabs are nested inside Home screen
type ComponentsTabNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>

interface ComponentsTabProps {
  navigation: ComponentsTabNavigationProp
}

export default function ComponentsTab({navigation}: ComponentsTabProps) {
  const [turboResult, setTurboResult] = useState<string | null>(null)

  const components = [
    {
      id: 'BOTTOMSHEET',
      name: 'Bottom Sheet',
      description: 'Slide-up bottom sheet components',
    },
    {
      id: 'TOOLTIP',
      name: 'Tooltip',
      description: 'Contextual tooltips for UI elements',
    },
    {
      id: 'POPUP',
      name: 'Popup',
      description: 'Modal popup dialogs',
    },
  ]

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>SDK Components</Text>
      <Text style={styles.subtitle}>
        Explore different component variants and features
      </Text>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>RavenTurbo Native Module</Text>
        <Text style={styles.sectionSubtitle}>
          Update user profile via native bridge
        </Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => {
            setTurboResult(null)
            updateUserProfile(userProfileSample)
              .then(() => setTurboResult('User profile updated'))
              .catch((e) => setTurboResult(`Error: ${(e as Error).message}`))
          }}
          activeOpacity={0.7}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Update user profile</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardDescription}>
              Send user profile (userId, firstName, lastName) to backend
            </Text>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
        {turboResult !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Result</Text>
            <Text style={styles.resultValue}>{turboResult}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Components</Text>
      {components.map((component) => (
        <TouchableOpacity
          key={component.id}
          style={styles.card}
          onPress={() =>
            navigation.navigate('VariantsPreview', {
              componentType: component.id as
                | 'BOTTOMSHEET'
                | 'TOOLTIP'
                | 'POPUP',
            })
          }
          activeOpacity={0.7}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{component.name}</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardDescription}>{component.description}</Text>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  resultBox: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    backgroundColor: '#007AFF',
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    flex: 1,
    marginRight: 12,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
  },
})
