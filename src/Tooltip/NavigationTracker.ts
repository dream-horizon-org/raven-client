import {useEffect} from 'react'

import {NativeModules} from 'react-native'

import type {
  NavigationContainerRef,
  NavigationState,
  PartialState,
  ParamListBase,
  Route,
} from '@react-navigation/native'

import {ScreenInspectorModule} from './ScreenInspector'
import {ScreenTracker} from './ScreenTracker'

const {TooltipModule} = NativeModules

export const useNavigationTracker = (
  navigationRef: React.RefObject<NavigationContainerRef<ParamListBase> | null>,
) => {
  useEffect(() => {
    let retryCount = 0
    let timeoutId: NodeJS.Timeout | null = null
    const maxRetries = 25 // 5 seconds max with exponential backoff

    const setupListener = () => {
      if (!navigationRef.current) {
        retryCount++
        const delay = Math.min(100 * Math.pow(1.2, retryCount), 500) // Exponential backoff, max 500ms

        if (retryCount < maxRetries) {
          timeoutId = setTimeout(setupListener, delay)
        }
        return
      }

      const onStateChange = () => {
        try {
          const route = getActiveRouteName(
            navigationRef.current?.getRootState(),
          )
          if (route) {
            ScreenTracker.setScreen(route)

            // Delay to ensure screen is mounted and layout done
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                // Safe to notify TooltipModule
                try {
                  if (TooltipModule?.setCurrentScreen) {
                    TooltipModule.setCurrentScreen(route)
                  }
                  ScreenInspectorModule?.setCurrentScreen?.(route)
                } catch {
                  // Error notifying TooltipModule
                }
              })
            })
          }
        } catch {
          // Error in navigation state change
        }
      }

      // Call once immediately to get current screen
      onStateChange()

      // Set up listener for future changes
      const unsubscribe = navigationRef.current.addListener(
        'state',
        onStateChange,
      )

      return unsubscribe
    }

    const unsubscribe = setupListener()

    return () => {
      // Clean up timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      // Clean up navigation listener
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [navigationRef])
}

function getActiveRouteName(
  state?: NavigationState | PartialState<NavigationState>,
): string | undefined {
  if (!state) return undefined
  const index = (state as NavigationState).index ?? 0
  const routes = (state as NavigationState).routes as Route<string>[]
  const route = routes[index]
  type MaybeNestedRoute = Route<string> & {
    state?: NavigationState | PartialState<NavigationState>
  }
  const nested = (route as MaybeNestedRoute).state
  if (nested) return getActiveRouteName(nested)
  return route.name
}
