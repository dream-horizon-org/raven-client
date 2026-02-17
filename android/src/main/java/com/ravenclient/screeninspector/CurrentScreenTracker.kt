package com.ravenclient.screeninspector

import android.os.Handler
import android.os.Looper

/**
 * Singleton tracker for current screen/route name.
 * Updated from React Native JS side when navigation changes.
 * Supports real-time listeners for route changes.
 */
object CurrentScreenTracker {
    @Volatile
    var currentRouteName: String = ""
        private set

    private val listeners = mutableSetOf<RouteChangeListener>()
    private val handler = Handler(Looper.getMainLooper())

    /**
     * Listener interface for route name changes
     */
    interface RouteChangeListener {
        fun onRouteChanged(routeName: String)
    }

    /**
     * Updates the current route name (called from JS)
     * Notifies all registered listeners in real-time
     */
    fun updateRouteName(routeName: String) {
        if (currentRouteName != routeName) {
            currentRouteName = routeName
            // Notify listeners on main thread
            handler.post {
                listeners.forEach { listener ->
                    try {
                        listener.onRouteChanged(routeName)
                    } catch (e: Exception) {
                        // Ignore errors from individual listeners
                    }
                }
            }
        }
    }

    /**
     * Registers a listener for route changes
     * @param listener The listener to register
     */
    fun addListener(listener: RouteChangeListener) {
        listeners.add(listener)
        // Immediately notify with current route
        handler.post {
            try {
                listener.onRouteChanged(currentRouteName)
            } catch (e: Exception) {
                // Ignore
            }
        }
    }

    /**
     * Unregisters a listener
     * @param listener The listener to remove
     */
    fun removeListener(listener: RouteChangeListener) {
        listeners.remove(listener)
    }
}

