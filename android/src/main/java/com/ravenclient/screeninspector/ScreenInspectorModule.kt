package com.ravenclient.screeninspector

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.ravenclient.screeninspector.output.JsonOutputBuilder
import com.ravenclient.screeninspector.route.RouteProviderFactory

/**
 * React Native bridge module for UI Inspector functionality.
 * 
 * Provides methods to:
 * - Set current screen/route name from JS
 * - Capture screen inspection (elements, viewport, metadata)
 * - Get target nodes only (without full inspection)
 * - Enable/disable inspector FAB overlay
 *
 * This module automatically manages the FAB overlay based on the `enableInspector`
 * flag from the state-machine API. No manual setup required in MainActivity.
 */
class ScreenInspectorModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    // Explicitly use React Native route provider
    private val inspectorManager = UiInspectorManager(
        routeProvider = RouteProviderFactory.createReactNativeProvider()
    )

    private var lifecycleCallbacks: com.ravenclient.screeninspector.ui.InspectorFabManager.LifecycleCallbacks? = null

    init {
        // Ensure FAB is disabled by default until API explicitly enables it
        com.ravenclient.screeninspector.ui.InspectorFabManager.setEnabled(false)

        // Automatically register activity lifecycle callbacks
        // This allows the FAB manager to track activities without requiring MainActivity changes
        try {
            val application = reactContext.applicationContext as? android.app.Application
            application?.let { app ->
                val callbacks = com.ravenclient.screeninspector.ui.InspectorFabManager.LifecycleCallbacks()
                app.registerActivityLifecycleCallbacks(callbacks)
                lifecycleCallbacks = callbacks
            }
        } catch (e: Exception) {
            // If registration fails, we'll rely on manual activity registration
            android.util.Log.w("ScreenInspector", "Failed to register activity lifecycle callbacks", e)
        }
    }

    override fun getName() = NAME

    /**
     * Called from JS whenever route changes.
     * Updates the current route name for inspection results.
     */
    @ReactMethod
    fun setCurrentScreen(routeName: String) {
        CurrentScreenTracker.updateRouteName(routeName)
    }

    /**
     * Captures full screen inspection: screen name, elements, viewport, and metadata.
     * This is the main method for getting complete inspection data.
     *
     * Returns JSON structure:
     * {
     *   "screenName": "HomeScreen",
     *   "capturedAt": "2025-10-29T07:33:14Z",
     *   "viewport": { "width": 1080, "height": 1920 },
     *   "elements": [
     *     {
     *       "elementId": "btnPlayNow",
     *       "bounds": { "x": 120, "y": 1800, "width": 240, "height": 56 }
     *     }
     *   ],
     *   "meta": { "platform": "android", "buildType": "debug" }
     * }
     */
    @ReactMethod
    fun captureScreen(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No active activity found")
            return
        }

        inspectorManager.inspectScreen(activity) { result ->
            if (result != null) {
                try {
                    val writableMap = JsonOutputBuilder.toWritableMap(result)
                    promise.resolve(writableMap)
                } catch (e: Exception) {
                    promise.reject("SERIALIZATION_ERROR", "Failed to serialize result", e)
                }
            } else {
                promise.reject("INSPECTION_ERROR", "Failed to inspect screen")
            }
        }
    }

    /**
     * Gets only the target nodes (without screenshot) - faster operation.
     * Useful for quick checks or when screenshot is not needed.
     */
    @ReactMethod
    fun getTargetNodes(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No active activity found")
            return
        }

        inspectorManager.getTargetNodes(activity) { targetNodes ->
            try {
                val array = Arguments.createArray()
                targetNodes.forEach { target ->
                    val element = target.toElement()
                    val elementMap = Arguments.createMap()
                    elementMap.putString("elementId", element.elementId)

                    val boundsMap = Arguments.createMap()
                    boundsMap.putInt("x", element.bounds.x)
                    boundsMap.putInt("y", element.bounds.y)
                    boundsMap.putInt("width", element.bounds.width)
                    boundsMap.putInt("height", element.bounds.height)

                    elementMap.putMap("bounds", boundsMap)
                    array.pushMap(elementMap)
                }
                promise.resolve(array)
            } catch (e: Exception) {
                promise.reject("SERIALIZATION_ERROR", "Failed to serialize target nodes", e)
            }
        }
    }

    /**
     * Gets the current route name
     */
    @ReactMethod
    fun getCurrentRouteName(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        val routeName = inspectorManager.getCurrentRouteName(activity)
        promise.resolve(routeName)
    }

    /**
     * Sets whether the inspector FAB should be enabled.
     * Called from React Native when enableInspector flag is received from state-machine API.
     *
     * @param enabled true to show FAB, false to hide it
     */
    @ReactMethod
    fun setInspectorEnabled(enabled: Boolean) {
        // Ensure we're on the main thread for UI operations
        val activity = reactApplicationContext.currentActivity
        val handler = android.os.Handler(android.os.Looper.getMainLooper())
        
        handler.post {
            // Register current activity if available
            activity?.let {
                com.ravenclient.screeninspector.ui.InspectorFabManager.registerActivity(it)
            }

            // Set enabled state (will show/hide FAB based on current activity)
            com.ravenclient.screeninspector.ui.InspectorFabManager.setEnabled(enabled)
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        inspectorManager.shutdown()

        // Unregister lifecycle callbacks
        lifecycleCallbacks?.let { callbacks ->
            try {
                val application = reactApplicationContext.applicationContext as? android.app.Application
                application?.unregisterActivityLifecycleCallbacks(callbacks)
            } catch (e: Exception) {
                // Ignore
            }
        }
        lifecycleCallbacks = null
    }
    companion object {
        const val NAME = "ScreenInspector"
    }
}
