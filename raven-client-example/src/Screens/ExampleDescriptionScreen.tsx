import {ScrollView, StyleSheet, Text, View} from 'react-native'
import type {NativeStackScreenProps} from '@react-navigation/native-stack'
import type {RootStackParamList} from './HomeScreen'

type ExampleDescriptionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ExampleDescription'
>

export default function ExampleDescriptionScreen({
  route,
}: ExampleDescriptionScreenProps) {
  const {exampleName, exampleId} = route.params

  const renderStateDiagram = () => {
    if (exampleId !== 'add-to-cart') return null

    return (
      <View style={styles.diagramContainer}>
        <Text style={styles.diagramTitle}>State Journey Diagram</Text>

        {/* State 0 */}
        <View style={styles.stateColumn}>
          <View style={styles.stateCircle}>
            <Text style={styles.stateNumber}>0</Text>
          </View>
          <Text style={styles.stateLabelText}>Product Home</Text>
        </View>

        {/* Arrow with label */}
        <View style={styles.arrowWithLabel}>
          <View style={styles.arrowLine} />
          <Text style={styles.arrowLabel}>Go to Products</Text>
        </View>

        {/* State 1 */}
        <View style={styles.stateColumn}>
          <View style={styles.stateCircle}>
            <Text style={styles.stateNumber}>1</Text>
          </View>
          <Text style={styles.stateLabelText}>Products</Text>
          <Text style={styles.stateSubLabel}>Products List</Text>
        </View>

        {/* Arrow with label */}
        <View style={styles.arrowWithLabel}>
          <View style={styles.arrowLine} />
          <Text style={styles.arrowLabel}>Add items to cart</Text>
        </View>

        {/* State 2 - Main State */}
        <View style={styles.stateColumn}>
          <View style={[styles.stateCircle, styles.stateCircleActive]}>
            <Text style={styles.stateNumber}>2</Text>
          </View>
          <Text style={styles.stateLabelText}>Item Added</Text>
          <Text style={styles.stateSubLabel}>Cart Updated</Text>
        </View>

        {/* Tooltip Action */}
        <View style={styles.actionBox}>
          <Text style={styles.actionText}>Show tooltip</Text>
        </View>

        {/* Branching paths from State 2 */}
        <View style={styles.branchesContainer}>
          {/* Path to State 4 (Back to Start with non-empty cart) */}
          <View style={styles.branchColumn}>
            <View style={styles.arrowWithLabel}>
              <View style={styles.arrowLine} />
              <Text style={styles.arrowLabel}>Back to product home</Text>
            </View>
            <View style={styles.stateColumn}>
              <View style={styles.stateCircle}>
                <Text style={styles.stateNumber}>4</Text>
              </View>
              <Text style={styles.stateLabelText}>Product Home</Text>
              <Text style={styles.stateSubLabel}>Cart not empty</Text>
            </View>
            <View style={styles.actionBox}>
              <Text style={styles.actionText}>Show Bottom Sheet</Text>
              <Text style={styles.actionSubText}>Cart is non-empty</Text>
            </View>
          </View>

          {/* Path to State 3 (Screen 3 - Buy) */}
          <View style={styles.branchColumn}>
            <View style={styles.arrowWithLabel}>
              <View style={styles.arrowLine} />
              <Text style={styles.arrowLabel}>Go to Checkout</Text>
            </View>
            <View style={styles.stateColumn}>
              <View style={styles.stateCircle}>
                <Text style={styles.stateNumber}>3</Text>
              </View>
              <Text style={styles.stateLabelText}>Checkout</Text>
              <Text style={styles.stateSubLabel}>Buy Screen</Text>
            </View>
            <View style={styles.arrowWithLabel}>
              <View style={styles.arrowLine} />
              <Text style={styles.arrowLabel}>Buy products</Text>
            </View>
            <View style={styles.actionBox}>
              <Text style={styles.actionText}>Show Popup</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}>
      <View style={styles.card}>
        <Text style={styles.title}>{exampleName}</Text>
        {renderStateDiagram()}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    marginBottom: 20,
  },
  diagramContainer: {
    marginTop: 8,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  diagramTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  stateColumn: {
    alignItems: 'center',
    marginVertical: 12,
  },
  stateCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stateCircleActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  stateNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  stateLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  stateSubLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  arrowWithLabel: {
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
    position: 'relative',
  },
  arrowLine: {
    width: 3,
    height: 40,
    backgroundColor: '#9CA3AF',
    marginBottom: 8,
  },
  arrowLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontWeight: '500',
  },
  actionBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 14,
    marginVertical: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: '100%',
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  branchesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 8,
    gap: 16,
  },
  branchColumn: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
    paddingHorizontal: 8,
  },
})
