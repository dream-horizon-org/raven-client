import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native'
import type {NativeStackScreenProps} from '@react-navigation/native-stack'
import type {RootStackParamList} from './HomeScreen'

// Import screenshots (ensure filenames match assets folder)
const screenshots = {
  tooltip: require('../assets/screenshots/ToolTip.png'),
  bottomsheetWithClose: require('../assets/screenshots/BottomSheetWithClose.png'),
  bottomsheetWithoutClose: require('../assets/screenshots/BottomSheetWithoutClose.png'),
  popupWithClose: require('../assets/screenshots/PopUpWithClose.png'),
  popupWithoutClose: require('../assets/screenshots/PopUpwithoutClose.png'),
}

type VariantsPreviewScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'VariantsPreview'
>

const {width} = Dimensions.get('window')

// Variant configurations for each component type
const componentVariants = {
  BOTTOMSHEET: [
    {
      id: 'with-close',
      name: 'Bottom Sheet With Close Button',
      description: 'Bottom sheet with a close button in the header',
      screenshot: screenshots.bottomsheetWithClose,
    },
    {
      id: 'without-close',
      name: 'Bottom Sheet Without Close Button',
      description: 'Bottom sheet without a close button (swipe to dismiss)',
      screenshot: screenshots.bottomsheetWithoutClose,
    },
  ],
  POPUP: [
    {
      id: 'with-close',
      name: 'Popup With Close',
      description: 'Popup modal with close button',
      screenshot: screenshots.popupWithClose,
    },
    {
      id: 'without-close',
      name: 'Popup Without Close',
      description: 'Popup modal without close button (backdrop tap to dismiss)',
      screenshot: screenshots.popupWithoutClose,
    },
  ],
  TOOLTIP: {
    id: 'tooltip',
    name: 'Tooltip',
    description:
      'Contextual tooltip that appears on UI elements with title and subtitle support',
    screenshot: screenshots.tooltip,
  },
}

export default function VariantsPreviewScreen({
  route,
}: VariantsPreviewScreenProps) {
  const {componentType} = route.params
  const variantData = componentVariants[componentType]

  const componentNames = {
    BOTTOMSHEET: 'Bottom Sheet',
    TOOLTIP: 'Tooltip',
    POPUP: 'Popup',
  }

  // Handle tooltip which has a single variant (not an array)
  const variants = Array.isArray(variantData) ? variantData : [variantData]

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        {componentType === 'TOOLTIP'
          ? componentNames[componentType]
          : `${componentNames[componentType]} Variants`}
      </Text>
      <Text style={styles.subtitle}>
        {componentType === 'TOOLTIP'
          ? 'Preview the tooltip component'
          : 'Preview different variants and configurations'}
      </Text>

      {variants.map((variant) => (
        <View key={variant.id} style={styles.variantCard}>
          <View style={styles.variantHeader}>
            <Text style={styles.variantTitle}>{variant.name}</Text>
          </View>
          <View style={styles.variantContent}>
            {variant.screenshot ? (
              <Image
                source={variant.screenshot}
                style={styles.screenshotImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.screenshotPlaceholder}>
                <Text style={styles.placeholderText}>📸</Text>
                <Text style={styles.placeholderSubtext}>Screenshot</Text>
                <Text style={styles.placeholderSubtext}>{variant.name}</Text>
              </View>
            )}
            <Text style={styles.variantDescription}>{variant.description}</Text>
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
    fontSize: 28,
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
  variantCard: {
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
  variantHeader: {
    backgroundColor: '#007AFF',
    padding: 16,
  },
  variantTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  variantContent: {
    padding: 16,
  },
  screenshotPlaceholder: {
    width: width - 64,
    height: (width - 64) * 1.5, // Aspect ratio for phone screenshots
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  variantDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  screenshotImage: {
    width: width - 64,
    height: (width - 64) * 1.5,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
})
