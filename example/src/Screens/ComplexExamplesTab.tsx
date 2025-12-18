import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import type {NativeStackNavigationProp} from '@react-navigation/native-stack'
import type {RootStackParamList} from './HomeScreen'

type ComplexExamplesTabNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>

interface ComplexExamplesTabProps {
  navigation: ComplexExamplesTabNavigationProp
}

const examples = [
  {
    id: 'add-to-cart',
    name: 'Add to Cart Journey',
    description:
      'A complete e-commerce journey demonstrating tooltips, popups, and bottom sheets working together to guide users through adding items to cart.',
  },
]

export default function ComplexExamplesTab({
  navigation,
}: ComplexExamplesTabProps) {
  const handleDescription = (name: string, description: string) => {
    navigation.navigate('ExampleDescription', {
      exampleId: 'add-to-cart',
      exampleName: name,
      exampleDescription: description,
    })
  }

  const handleTest = (exampleId: string) => {
    if (exampleId === 'add-to-cart') {
      navigation.navigate('AddToCartFlowDemo')
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Journeys</Text>
      <Text style={styles.subtitle}>
        Real-world journeys built with Raven SDK components
      </Text>

      {examples.map((example) => (
        <View key={example.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{example.name}</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardDescription}>{example.description}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.descriptionButton]}
              onPress={() =>
                handleDescription(example.name, example.description)
              }
              activeOpacity={0.7}>
              <Text style={styles.buttonText}>📖 Description</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={() => handleTest(example.id)}
              activeOpacity={0.7}>
              <Text style={styles.buttonText}>🧪 Test</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  card: {
    marginHorizontal: 16,
    marginBottom: 24,
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
  },
  cardDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  descriptionButton: {
    backgroundColor: '#007AFF',
  },
  testButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
