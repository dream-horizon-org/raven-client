package com.ravenclient.screeninspector.output

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.ravenclient.screeninspector.models.ScreenInspectionResult
import org.json.JSONArray
import org.json.JSONObject

/**
 * Builds JSON output from ScreenInspectionResult.
 * Uses org.json for compatibility (no external dependencies needed).
 */
object JsonOutputBuilder {
    /**
     * Converts ScreenInspectionResult to JSON string
     */
    fun toJsonString(result: ScreenInspectionResult): String {
        val json = JSONObject()
        json.put("screenName", result.screenName)
        json.put("capturedAt", result.capturedAt)

        // Viewport
        val viewportObj = JSONObject()
        viewportObj.put("width", result.viewport.width)
        viewportObj.put("height", result.viewport.height)
        json.put("viewport", viewportObj)

        // Elements
        val elementsArray = JSONArray()
        result.elements.forEach { element ->
            val elementObj = JSONObject()
            elementObj.put("elementId", element.elementId)

            val boundsObj = JSONObject()
            boundsObj.put("x", element.bounds.x)
            boundsObj.put("y", element.bounds.y)
            boundsObj.put("width", element.bounds.width)
            boundsObj.put("height", element.bounds.height)

            elementObj.put("bounds", boundsObj)
            elementsArray.put(elementObj)
        }
        json.put("elements", elementsArray)

        // Meta
        val metaObj = JSONObject()
        metaObj.put("platform", result.meta.platform)
        metaObj.put("buildType", result.meta.buildType)
        json.put("meta", metaObj)

        return json.toString(2) // Pretty print with 2-space indent
    }

    /**
     * Converts ScreenInspectionResult to WritableMap for React Native bridge
     * Uses Arguments static methods (createMap, createArray)
     */
    fun toWritableMap(result: ScreenInspectionResult): WritableMap {
        val map = Arguments.createMap()
        map.putString("screenName", result.screenName)
        map.putString("capturedAt", result.capturedAt)

        // Viewport
        val viewportMap = Arguments.createMap()
        viewportMap.putInt("width", result.viewport.width)
        viewportMap.putInt("height", result.viewport.height)
        map.putMap("viewport", viewportMap)

        // Elements
        val elementsArray = Arguments.createArray()
        result.elements.forEach { element ->
            val elementMap = Arguments.createMap()
            elementMap.putString("elementId", element.elementId)

            val boundsMap = Arguments.createMap()
            boundsMap.putInt("x", element.bounds.x)
            boundsMap.putInt("y", element.bounds.y)
            boundsMap.putInt("width", element.bounds.width)
            boundsMap.putInt("height", element.bounds.height)

            elementMap.putMap("bounds", boundsMap)
            elementsArray.pushMap(elementMap)
        }
        map.putArray("elements", elementsArray)

        // Meta
        val metaMap = Arguments.createMap()
        metaMap.putString("platform", result.meta.platform)
        metaMap.putString("buildType", result.meta.buildType)
        map.putMap("meta", metaMap)

        return map
    }
}

