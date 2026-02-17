package com.ravenclient.screeninspector

import android.app.Activity
import android.content.pm.ApplicationInfo
import com.ravenclient.screeninspector.models.*
import com.ravenclient.screeninspector.route.RouteProvider
import com.ravenclient.screeninspector.scanner.ViewHierarchyScanner
import com.ravenclient.screeninspector.screenshot.ScreenshotProvider
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Main orchestrator for UI inspection operations.
 * Coordinates route detection, view scanning, and screenshot capture.
 *
 * This is the primary entry point for the UI Inspector system.
 * 
 * **For Native Android**: Use default constructor or pass NativeAndroidRouteProvider
 * **For React Native**: Pass ReactNativeRouteProvider explicitly
 * 
 * Example (Native Android):
 * ```kotlin
 * val manager = UiInspectorManager() // Uses native provider by default
 * ```
 * 
 * Example (React Native):
 * ```kotlin
 * val manager = UiInspectorManager(
 *     routeProvider = ReactNativeRouteProvider()
 * )
 * ```
 */
class UiInspectorManager(
    private val routeProvider: RouteProvider? = null,
    private val viewScanner: ViewHierarchyScanner = ViewHierarchyScanner(),
    private val screenshotProvider: ScreenshotProvider = ScreenshotProvider()
) {
    // Lazy initialization of route provider based on activity
    private var currentActivity: Activity? = null
    private val effectiveRouteProvider: RouteProvider
        get() = routeProvider ?: run {
            // Default to native provider if none specified
            com.ravenclient.screeninspector.route.RouteProviderFactory
                .createNativeProvider(currentActivity)
        }
    private val isScanning = AtomicBoolean(false)

    /**
     * Performs a complete screen inspection:
     * 1. Gets current route name
     * 2. Scans view hierarchy for testIds
     * 3. Captures screenshot
     * 4. Returns combined result
     *
     * @param activity The current activity
     * @param callback Called with ScreenInspectionResult or null on error
     */
    fun inspectScreen(
        activity: Activity?,
        callback: (ScreenInspectionResult?) -> Unit
    ) {
        if (activity == null) {
            callback(null)
            return
        }

        if (!isScanning.compareAndSet(false, true)) {
            // Already scanning
            callback(null)
            return
        }

        // Update current activity for route provider
        currentActivity = activity

        val rootView = activity.window.decorView.rootView
        val screenName = effectiveRouteProvider.getCurrentRouteName()

        // Get viewport dimensions
        val displayMetrics = activity.resources.displayMetrics
        val viewport = Viewport(
            width = displayMetrics.widthPixels,
            height = displayMetrics.heightPixels
        )

        // Get build type
        val buildType = if ((activity.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            "debug"
        } else {
            "release"
        }

        // Generate ISO 8601 timestamp (UTC)
        val capturedAt = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }.format(Date())

        // Step 1: Scan view hierarchy
        viewScanner.scanViewHierarchy(rootView) { targetNodes ->
            // Step 2: Convert TargetNode to Element
            val elements = targetNodes.map { it.toElement() }

            // Step 3: Create result with new structure
            isScanning.set(false)

            val result = ScreenInspectionResult(
                screenName = screenName,
                capturedAt = capturedAt,
                viewport = viewport,
                elements = elements,
                meta = Meta(
                    platform = "android",
                    buildType = buildType
                )
            )

            callback(result)
        }
    }

    /**
     * Gets only the target nodes (without screenshot) - faster operation
     */
    fun getTargetNodes(
        activity: Activity?,
        callback: (List<TargetNode>) -> Unit
    ) {
        if (activity == null) {
            callback(emptyList())
            return
        }

        val rootView = activity.window.decorView.rootView
        viewScanner.scanViewHierarchy(rootView) { targetNodes ->
            callback(targetNodes)
        }
    }

    /**
     * Gets only the current route name.
     * Requires activity to be set (via inspectScreen or setActivity)
     */
    fun getCurrentRouteName(activity: Activity? = null): String {
        if (activity != null) {
            currentActivity = activity
        }
        return effectiveRouteProvider.getCurrentRouteName()
    }

    /**
     * Sets the current activity (useful for route detection in native Android)
     */
    fun setActivity(activity: Activity?) {
        currentActivity = activity
    }

    /**
     * Cleanup resources
     */
    fun shutdown() {
        viewScanner.shutdown()
        screenshotProvider.shutdown()
    }
}

