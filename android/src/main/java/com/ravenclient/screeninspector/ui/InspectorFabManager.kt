package com.ravenclient.screeninspector.ui

import android.app.Activity
import android.app.Application
import android.os.Bundle
import androidx.annotation.MainThread

/**
 * Singleton manager that controls the Inspector FAB overlay visibility.
 * 
 * The FAB overlay is only created when `enableInspector` is true from the
 * state-machine API. This ensures no resources are used when the feature is disabled.
 * 
 * Features:
 * - Automatic activity lifecycle tracking
 * - Lazy initialization (overlay only created when enabled)
 * - Thread-safe operations (all UI operations on main thread)
 * - No MainActivity changes required
 */
object InspectorFabManager {
    private var isEnabled = false
    private var currentOverlay: InspectorFabOverlay? = null
    private var currentActivity: Activity? = null
    
    /**
     * Sets whether the inspector FAB should be enabled.
     * Called from React Native when enableInspector flag is received from API.
     * 
     * @param enabled true to show FAB (creates overlay), false to hide it (destroys overlay)
     * Must be called on main thread.
     */
    @MainThread
    fun setEnabled(enabled: Boolean) {
        // Ensure we're on the main thread
        if (android.os.Looper.myLooper() != android.os.Looper.getMainLooper()) {
            android.os.Handler(android.os.Looper.getMainLooper()).post {
                setEnabled(enabled)
            }
            return
        }
        
        if (isEnabled == enabled) {
            return // No change
        }
        
        val wasEnabled = isEnabled
        isEnabled = enabled
        
        if (enabled && !wasEnabled) {
            // Enable: Create and show FAB if we have an activity
            currentActivity?.let { activity ->
                showFab(activity)
            }
        } else if (!enabled && wasEnabled) {
            // Disable: Destroy overlay and clean up resources
            hideFab()
        }
    }
    
    /**
     * Registers an activity with the manager.
     * Should be called when an activity is created.
     * This allows the manager to automatically show/hide the FAB
     * when activities change.
     * Only creates overlay if enabled is true.
     * Must be called on main thread.
     */
    @MainThread
    fun registerActivity(activity: Activity) {
        // Ensure we're on the main thread
        if (android.os.Looper.myLooper() != android.os.Looper.getMainLooper()) {
            android.os.Handler(android.os.Looper.getMainLooper()).post {
                registerActivity(activity)
            }
            return
        }
        
        // Only update if this is a different activity or we don't have one
        if (currentActivity != activity) {
            // Hide and destroy FAB on previous activity if any
            if (currentActivity != null && currentActivity != activity) {
                hideFab()
            }
            
            currentActivity = activity
            
            // Only create and show FAB if enabled
            // This ensures overlay is only initialized when needed
            if (isEnabled) {
                showFab(activity)
            }
        }
    }
    
    /**
     * Unregisters an activity from the manager.
     * Should be called when an activity is destroyed.
     * Properly cleans up the overlay if it exists.
     */
    @MainThread
    fun unregisterActivity(activity: Activity) {
        if (currentActivity == activity) {
            // Destroy overlay and clean up resources
            hideFab()
            currentActivity = null
        }
    }
    
    /**
     * Gets the current registered activity.
     * @return The current activity or null if none is registered
     */
    fun getCurrentActivity(): Activity? = currentActivity
    
    /**
     * Checks if the inspector FAB is currently enabled.
     * @return true if enabled, false otherwise
     */
    fun isEnabled(): Boolean = isEnabled
    
    /**
     * Shows the FAB overlay on the given activity.
     * Only creates the overlay if enabled is true.
     */
    private fun showFab(activity: Activity) {
        // Only create overlay if enabled
        if (!isEnabled) {
            return
        }
        
        // Hide existing overlay if any
        hideFab()
        
        // Create and show new overlay only when enabled
        try {
            val overlay = InspectorFabOverlay(activity)
            overlay.show()
            currentOverlay = overlay
        } catch (e: Exception) {
            android.util.Log.e("InspectorFabManager", "Failed to create FAB overlay", e)
        }
    }
    
    /**
     * Hides and destroys the FAB overlay.
     * Properly cleans up resources.
     */
    private fun hideFab() {
        currentOverlay?.let { overlay ->
            try {
                overlay.destroy()
            } catch (e: Exception) {
                android.util.Log.e("InspectorFabManager", "Error destroying FAB overlay", e)
            } finally {
                currentOverlay = null
            }
        }
    }
    
    /**
     * Activity lifecycle callbacks to automatically track activities
     */
    class LifecycleCallbacks : Application.ActivityLifecycleCallbacks {
        override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
            InspectorFabManager.registerActivity(activity)
        }
        
        override fun onActivityDestroyed(activity: Activity) {
            InspectorFabManager.unregisterActivity(activity)
        }
        
        override fun onActivityStarted(activity: Activity) {}
        override fun onActivityResumed(activity: Activity) {}
        override fun onActivityPaused(activity: Activity) {}
        override fun onActivityStopped(activity: Activity) {}
        override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
    }
}

