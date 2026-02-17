package com.ravenclient.screeninspector

import android.graphics.Rect
import com.ravenclient.screeninspector.models.*
import com.ravenclient.screeninspector.output.JsonOutputBuilder
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test

/**
 * Unit tests for JsonOutputBuilder
 */
class JsonOutputBuilderTest {

    @Test
    fun testToJsonString() {
        val target1 = TargetNode(
            elementId = "btnTest",
            bounds = Rect(10, 20, 110, 70), // x=10, y=20, width=100, height=50
            viewType = "Button",
            screenX = 10,
            screenY = 20
        )

        val target2 = TargetNode(
            elementId = "txtTest",
            bounds = Rect(0, 0, 200, 30),
            viewType = "TextView",
            screenX = 0,
            screenY = 0
        )

        val result = ScreenInspectionResult(
            screenName = "TestScreen",
            capturedAt = "2025-01-01T00:00:00Z",
            viewport = Viewport(1080, 1920),
            elements = listOf(target1.toElement(), target2.toElement()),
            meta = Meta("android", "debug")
        )

        val jsonString = JsonOutputBuilder.toJsonString(result)
        assertNotNull(jsonString)
        assertTrue(jsonString.isNotEmpty())

        // Parse and verify JSON structure
        val json = JSONObject(jsonString)
        assertEquals("TestScreen", json.getString("screenName"))
        assertEquals("2025-01-01T00:00:00Z", json.getString("capturedAt"))

        val viewport = json.getJSONObject("viewport")
        assertEquals(1080, viewport.getInt("width"))
        assertEquals(1920, viewport.getInt("height"))

        val elementsArray = json.getJSONArray("elements")
        assertEquals(2, elementsArray.length())

        val element1Json = elementsArray.getJSONObject(0)
        assertEquals("btnTest", element1Json.getString("elementId"))
        val bounds1 = element1Json.getJSONObject("bounds")
        assertEquals(10, bounds1.getInt("x"))
        assertEquals(20, bounds1.getInt("y"))
        assertEquals(100, bounds1.getInt("width"))
        assertEquals(50, bounds1.getInt("height"))

        val element2Json = elementsArray.getJSONObject(1)
        assertEquals("txtTest", element2Json.getString("elementId"))

        val meta = json.getJSONObject("meta")
        assertEquals("android", meta.getString("platform"))
        assertEquals("debug", meta.getString("buildType"))
    }

    @Test
    fun testToJsonStringEmptyElements() {
        val result = ScreenInspectionResult(
            screenName = "EmptyScreen",
            capturedAt = "2025-01-01T00:00:00Z",
            viewport = Viewport(1080, 1920),
            elements = emptyList(),
            meta = Meta("android", "debug")
        )

        val jsonString = JsonOutputBuilder.toJsonString(result)
        val json = JSONObject(jsonString)
        
        assertEquals("EmptyScreen", json.getString("screenName"))
        assertEquals(0, json.getJSONArray("elements").length())
        assertTrue(json.has("viewport"))
        assertTrue(json.has("meta"))
    }

    @Test
    fun testJsonStructureMatchesExpectedFormat() {
        // Verify JSON matches the expected format from requirements
        val target = TargetNode(
            elementId = "cta_pay",
            bounds = Rect(400, 1600, 680, 1696), // x=400, y=1600, width=280, height=96
            viewType = "Button",
            screenX = 400,
            screenY = 1600
        )

        val result = ScreenInspectionResult(
            screenName = "PaymentSummary",
            capturedAt = "2025-10-29T07:33:14Z",
            viewport = Viewport(1080, 1920),
            elements = listOf(target.toElement()),
            meta = Meta("android", "debug")
        )

        val jsonString = JsonOutputBuilder.toJsonString(result)
        val json = JSONObject(jsonString)

        // Verify structure matches expected format
        assertTrue(json.has("screenName"))
        assertTrue(json.has("capturedAt"))
        assertTrue(json.has("viewport"))
        assertTrue(json.has("elements"))
        assertTrue(json.has("meta"))

        assertEquals("PaymentSummary", json.getString("screenName"))
        
        val viewport = json.getJSONObject("viewport")
        assertEquals(1080, viewport.getInt("width"))
        assertEquals(1920, viewport.getInt("height"))

        val elements = json.getJSONArray("elements")
        assertEquals(1, elements.length())

        val elementJson = elements.getJSONObject(0)
        assertTrue(elementJson.has("elementId"))
        assertEquals("cta_pay", elementJson.getString("elementId"))
        assertTrue(elementJson.has("bounds"))

        val bounds = elementJson.getJSONObject("bounds")
        assertTrue(bounds.has("x"))
        assertTrue(bounds.has("y"))
        assertTrue(bounds.has("width"))
        assertTrue(bounds.has("height"))
        assertEquals(400, bounds.getInt("x"))
        assertEquals(1600, bounds.getInt("y"))
        assertEquals(280, bounds.getInt("width"))
        assertEquals(96, bounds.getInt("height"))

        val meta = json.getJSONObject("meta")
        assertEquals("android", meta.getString("platform"))
        assertEquals("debug", meta.getString("buildType"))
    }
}

