package com.ravenclient.screeninspector.scanner

import android.graphics.Rect
import android.view.View
import android.view.ViewGroup
import com.ravenclient.screeninspector.models.TargetNode
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.Future

/**
 * Scans the view hierarchy to find all views with testIds.
 * Performs traversal on a background thread for performance.
 */
class ViewHierarchyScanner(
    private val executor: ExecutorService = Executors.newSingleThreadExecutor()
) {
    companion object {
        private const val MAX_VIEWS_TO_SCAN = 1000 // Safety limit
    }

    /**
     * Scans the entire view hierarchy starting from rootView.
     * Only includes views that:
     * - Have a non-empty testId
     * - Are visible on screen
     * - Have non-zero dimensions
     *
     * @param rootView The root view to start scanning from
     * @param callback Called on main thread with results
     */
    fun scanViewHierarchy(
        rootView: View,
        callback: (List<TargetNode>) -> Unit
    ): Future<*> {
        return executor.submit {
            val results = mutableListOf<TargetNode>()
            val screenBounds = Rect()
            rootView.getGlobalVisibleRect(screenBounds)

            scanView(rootView, results, screenBounds)

            // Post results to main thread
            rootView.post {
                callback(results)
            }
        }
    }

    /**
     * Recursively scans a view and its children.
     */
    private fun scanView(
        view: View,
        results: MutableList<TargetNode>,
        screenBounds: Rect
    ) {
        // Safety limit
        if (results.size >= MAX_VIEWS_TO_SCAN) {
            return
        }

        // Skip invisible or zero-size views
        if (!shouldIncludeView(view)) {
            // Still traverse children even if parent is invisible
            if (view is ViewGroup) {
                traverseChildren(view, results, screenBounds)
            }
            return
        }

        // Extract testId
        val testId = TestIdExtractor.extractTestId(view)
        if (testId.isNotEmpty()) {
            // Calculate bounds
            val bounds = Rect()
            val hasBounds = view.getGlobalVisibleRect(bounds)

            if (hasBounds && bounds.width() > 0 && bounds.height() > 0) {
                // Get screen coordinates
                val location = IntArray(2)
                view.getLocationOnScreen(location)

                val targetNode = TargetNode(
                    elementId = testId,
                    bounds = bounds,
                    viewType = view.javaClass.simpleName,
                    screenX = location[0],
                    screenY = location[1]
                )

                results.add(targetNode)
            }
        }

        // Recursively scan children
        if (view is ViewGroup) {
            traverseChildren(view, results, screenBounds)
        }
    }

    /**
     * Traverses children of a ViewGroup
     */
    private fun traverseChildren(
        viewGroup: ViewGroup,
        results: MutableList<TargetNode>,
        screenBounds: Rect
    ) {
        for (i in 0 until viewGroup.childCount) {
            val child = viewGroup.getChildAt(i)
            scanView(child, results, screenBounds)
        }
    }

    /**
     * Determines if a view should be included in the scan.
     * Filters out invisible, zero-size, or detached views.
     */
    private fun shouldIncludeView(view: View): Boolean {
        return try {
            // Must be attached to window
            if (!view.isAttachedToWindow) {
                return false
            }

            // Must be visible (not hidden and has positive alpha)
            if (!view.isShown || view.alpha <= 0.01f) {
                return false
            }

            // Must have non-zero dimensions
            if (view.width <= 0 || view.height <= 0) {
                return false
            }

            // Check if view is at least partially visible on screen
            val rect = Rect()
            view.getGlobalVisibleRect(rect)
            rect.width() > 0 && rect.height() > 0

        } catch (e: Exception) {
            false
        }
    }

    /**
     * Shuts down the executor (call when done)
     */
    fun shutdown() {
        executor.shutdown()
    }
}

