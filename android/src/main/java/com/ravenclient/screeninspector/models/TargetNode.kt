package com.ravenclient.screeninspector.models

import android.graphics.Rect

/**
 * Represents a detected UI element with a testId/elementId.
 * This is the core data model for elements that can be targeted by tooltips/coachmarks.
 *
 * @param elementId The testID or accessibility identifier of the view
 * @param bounds The screen coordinates and dimensions of the view
 * @param viewType The class name of the view (e.g., "TextView", "Button")
 * @param screenX Absolute X coordinate on screen
 * @param screenY Absolute Y coordinate on screen
 */
data class TargetNode(
    val elementId: String,
    val bounds: Rect,
    val viewType: String,
    val screenX: Int,
    val screenY: Int
) {
    /**
     * Converts to Element model for JSON output
     */
    fun toElement(): Element {
        return Element(
            elementId = elementId,
            bounds = Bounds(
                x = bounds.left,
                y = bounds.top,
                width = bounds.width(),
                height = bounds.height()
            )
        )
    }
}

