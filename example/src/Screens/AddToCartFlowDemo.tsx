import React, {useCallback, useMemo, useState} from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import {sendCtaEvent} from '../utils/Events'
export default function AddToCartFlowDemo() {
  // flowStep: 1 => ProductHome (entry), 2 => Products, 3 => Checkout
  const [flowStep, setFlowStep] = useState<1 | 2 | 3>(1)
  const [cartCounts, setCartCounts] = useState<Record<string, number>>({})
  const totalCartCount = useMemo(
    () => Object.values(cartCounts).reduce((sum, val) => sum + val, 0),
    [cartCounts],
  )
  const products = useMemo(
    () => [
      {id: '1', name: 'Product A', price: '$19.99'},
      {id: '2', name: 'Product B', price: '$29.99'},
      {id: '3', name: 'Product C', price: '$39.99'},
    ],
    [],
  )

  const handleAddToCart = useCallback(
    (productId: string) => {
      setCartCounts((prev) => {
        const next = {...prev}
        next[productId] = (next[productId] || 0) + 1
        return next
      })
      sendCtaEvent({
        eventName: 'addtocartbuttonclick',
        actionDone: false,
        routeName: 'AddToCartFlowDemo',
        is_from_rn: true,
        selection: 'Manager Mode',
      })
    },

    [],
  )

  const handleRemoveFromCart = useCallback((productId: string) => {
    setCartCounts((prev) => {
      const next = {...prev}
      if (!next[productId]) {
        return prev
      }
      const updated = next[productId] - 1
      if (updated > 0) {
        next[productId] = updated
      } else {
        delete next[productId]
      }
      return next
    })
  }, [])

  const handleGoToProducts = useCallback(() => {
    setFlowStep(2)
  }, [])

  const handleGoToCheckout = useCallback(() => {
    setFlowStep(3)
  }, [])

  const handleBackToProductHome = useCallback(() => {
    sendCtaEvent({
      eventName: 'backToProductHome',
      actionDone: false,
      routeName: 'AddToCartFlowDemo',
      is_from_rn: true,
      selection: 'Manager Mode',
      totalCartCount: totalCartCount,
    })

    setFlowStep(1)
  }, [totalCartCount])
  // usecallback and memoize the function
  const handleBuy = useCallback(() => {
    // Trigger popup CTA on buy
    sendCtaEvent({
      eventName: 'BuyProducts',
      actionDone: false,
      routeName: 'AddToCartFlowDemo',
      is_from_rn: true,
      totalCartCount: totalCartCount,
    })
    // Reset flow after showing popup via CTA system
    setFlowStep(1)
    setCartCounts({})
  }, [totalCartCount])

  const renderProductHome = () => (
    <View style={styles.centeredScreen}>
      <Text style={styles.title}>Add to Cart Journey Demo</Text>
      <Text style={styles.subtitle}>
        Guided journey across tooltip, popup, and bottom sheet.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleGoToProducts}>
        <Text style={styles.primaryButtonText}>Go to Products List</Text>
      </TouchableOpacity>
    </View>
  )

  const renderProducts = () => (
    <View style={styles.content}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>🛍️ Products List</Text>
        <View style={styles.cartIconWrapper}>
          <View
            nativeID="cart-icon"
            testID="cart-icon"
            style={[
              styles.cartIcon,
              totalCartCount > 0 && styles.cartIconActive,
            ]}>
            <Text style={styles.cartIconText}>🛒</Text>
            {totalCartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCartCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {products.map((product) => (
        <View key={product.id} style={styles.productCard}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
            <Text style={styles.productCount}>
              In cart: {cartCounts[product.id] || 0}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(product.id)}
            activeOpacity={0.7}>
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.removeButton,
              !(cartCounts[product.id] > 0) && styles.removeButtonDisabled,
            ]}
            disabled={!(cartCounts[product.id] > 0)}
            onPress={() => handleRemoveFromCart(product.id)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.removeButtonText,
                !(cartCounts[product.id] > 0) &&
                  styles.removeButtonTextDisabled,
              ]}>
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBackToProductHome}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            {flex: 1, opacity: totalCartCount === 0 ? 0.4 : 1},
          ]}
          disabled={totalCartCount === 0}
          onPress={handleGoToCheckout}>
          <Text style={styles.primaryButtonText}>Proceed to Buy</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderCheckout = () => (
    <View style={styles.centeredScreen}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.subtitle}>
        Items in cart: {totalCartCount}. On buy, a popup CTA will appear.
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={handleBuy}>
        <Text style={styles.primaryButtonText}>Buy Now</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setFlowStep(2)}>
        <Text style={styles.secondaryButtonText}>Back to Products</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <ScrollView style={styles.container}>
      {flowStep === 1 && renderProductHome()}
      {flowStep === 2 && renderProducts()}
      {flowStep === 3 && renderCheckout()}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredScreen: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cartIconWrapper: {
    padding: 4,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  productCount: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#e6e6e6',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
  },
  removeButtonDisabled: {
    opacity: 0.5,
  },
  removeButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButtonTextDisabled: {
    color: '#888',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#e6e6e6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  cartSection: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  cartIconActive: {
    backgroundColor: '#007AFF',
  },
  cartIconText: {
    fontSize: 32,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cartLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  instructionsSection: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  testSection: {
    marginBottom: 24,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
