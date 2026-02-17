package com.ravenclient.screeninspector.route

import android.app.Activity
import androidx.fragment.app.FragmentActivity
import androidx.fragment.app.FragmentManager

/**
 * React Native implementation of RouteProvider.
 * Uses the CurrentScreenTracker singleton that's updated from JS.
 * 
 * This should only be used when running in a React Native context.
 */
class ReactNativeRouteProvider : RouteProvider {
    override fun getCurrentRouteName(): String {
        return com.ravenclient.screeninspector.CurrentScreenTracker.currentRouteName
    }
}

/**
 * Native Android implementation using Activity/Fragment names.
 * This is the default provider for pure native Android apps.
 * 
 * Strategy:
 * 1. If FragmentActivity, try to get current fragment name
 * 2. Fallback to Activity class simple name
 * 3. Remove "Activity" suffix for cleaner names
 */
class NativeAndroidRouteProvider(
    private val activity: Activity?
) : RouteProvider {
    override fun getCurrentRouteName(): String {
        if (activity == null) {
            return "Unknown"
        }

        // Try to get current fragment name (if using FragmentActivity)
        if (activity is FragmentActivity) {
            val fragmentName = getCurrentFragmentName(activity.supportFragmentManager)
            if (fragmentName.isNotEmpty()) {
                return fragmentName
            }
        }

        // Fallback to Activity name
        val activityName = activity::class.java.simpleName
        
        // Remove "Activity" suffix for cleaner route names
        return if (activityName.endsWith("Activity")) {
            activityName.substring(0, activityName.length - "Activity".length)
        } else {
            activityName
        }
    }

    /**
     * Attempts to get the current fragment name from the backstack.
     * Returns the top fragment's class simple name.
     */
    private fun getCurrentFragmentName(fragmentManager: FragmentManager): String {
        return try {
            val fragments = fragmentManager.fragments
            if (fragments.isNotEmpty()) {
                val topFragment = fragments.lastOrNull { it.isVisible && it.isAdded }
                topFragment?.javaClass?.simpleName ?: ""
            } else {
                // Check backstack
                val backStackEntryCount = fragmentManager.backStackEntryCount
                if (backStackEntryCount > 0) {
                    val entry = fragmentManager.getBackStackEntryAt(backStackEntryCount - 1)
                    entry.name ?: ""
                } else {
                    ""
                }
            }
        } catch (e: Exception) {
            ""
        }
    }
}

/**
 * Factory for creating appropriate RouteProvider based on context.
 */
object RouteProviderFactory {
    /**
     * Creates a RouteProvider for native Android.
     * This is the default for standalone Android apps.
     */
    fun createNativeProvider(activity: Activity?): RouteProvider {
        return NativeAndroidRouteProvider(activity)
    }

    /**
     * Creates a RouteProvider for React Native.
     * Use this when running in React Native context.
     */
    fun createReactNativeProvider(): RouteProvider {
        return ReactNativeRouteProvider()
    }
}

