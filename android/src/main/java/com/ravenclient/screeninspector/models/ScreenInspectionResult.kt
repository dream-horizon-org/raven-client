package com.ravenclient.screeninspector.models

/**
 * Complete result of a screen inspection operation.
 * Contains all information needed for tooltip/coachmark engine.
 *
 * @param screenName The current screen/route identifier
 * @param capturedAt ISO 8601 timestamp of when the capture occurred
 * @param viewport Screen dimensions (width and height)
 * @param elements List of all detected UI elements with elementIds
 * @param meta Metadata about the capture (platform, buildType)
 */
data class ScreenInspectionResult(
    val screenName: String,
    val capturedAt: String,
    val viewport: Viewport,
    val elements: List<Element>,
    val meta: Meta
)

/**
 * Viewport dimensions
 */
data class Viewport(
    val width: Int,
    val height: Int
)

/**
 * Detected UI element
 */
data class Element(
    val elementId: String,
    val bounds: Bounds
)

/**
 * Element bounds
 */
data class Bounds(
    val x: Int,
    val y: Int,
    val width: Int,
    val height: Int
)

/**
 * Metadata about the capture
 */
data class Meta(
    val platform: String,
    val buildType: String
)

