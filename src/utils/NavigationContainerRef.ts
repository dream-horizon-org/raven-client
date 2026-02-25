import type {NavigationContainerRef} from '@react-navigation/native'

class NavigationRefContainer {
  private static instance: NavigationRefContainer
  private ref: NavigationContainerRef<any> | null = null

  private constructor() {}

  public static getInstance(): NavigationRefContainer {
    if (!NavigationRefContainer.instance) {
      NavigationRefContainer.instance = new NavigationRefContainer()
    }
    return NavigationRefContainer.instance
  }

  public setRef(ref: NavigationContainerRef<any> | null): void {
    this.ref = ref
  }

  public getRef(): NavigationContainerRef<any> | null {
    return this.ref
  }
}

/**
 * Set the navigation ref globally
 * This should be called when NavigationContainer mounts
 * @param ref - The navigation ref from NavigationContainer
 */
export function setNavigationRef(ref: NavigationContainerRef<any> | null) {
  NavigationRefContainer.getInstance().setRef(ref)
}

/**
 * Get the global navigation ref
 */
export function getNavigationRef(): NavigationContainerRef<any> | null {
  return NavigationRefContainer.getInstance().getRef()
}

/**
 * Navigate to a screen
 */
export function navigate(name: string, params?: Record<string, unknown>): void {
  const navigationRef = NavigationRefContainer.getInstance().getRef()

  if (!navigationRef) {
    return
  }

  try {
    navigationRef.navigate(name, params)
  } catch {
    // Navigation error - silently fail
  }
}

/**
 * Push a screen onto the stack
 */
export function push(name: string, params?: Record<string, unknown>): void {
  const navigationRef = NavigationRefContainer.getInstance().getRef()
  if (navigationRef?.isReady()) {
    navigationRef.navigate(name, params)
  }
}

/**
 * Go back to the previous screen
 */
export function goBack(): void {
  const navigationRef = NavigationRefContainer.getInstance().getRef()
  if (navigationRef?.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack()
  }
}
