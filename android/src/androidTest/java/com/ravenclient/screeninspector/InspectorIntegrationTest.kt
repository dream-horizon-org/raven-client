package com.ravenclient.screeninspector

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.ravenclient.screeninspector.models.ScreenInspectionResult
import com.ravenclient.screeninspector.route.NativeAndroidRouteProvider
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/**
 * Android Instrumentation tests for UI Inspector
 * These tests run on a real or emulated Android device
 */
@RunWith(AndroidJUnit4::class)
class InspectorIntegrationTest {

    @Test
    fun testInspectorWorksOnRealDevice() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val activity = InstrumentationRegistry.getInstrumentation().activity

        if (activity == null) {
            // Skip if no activity available
            return
        }

        val manager = UiInspectorManager(
            routeProvider = NativeAndroidRouteProvider(activity)
        )

        val latch = CountDownLatch(1)
        var result: ScreenInspectionResult? = null

        manager.inspectScreen(activity) { inspectionResult ->
            result = inspectionResult
            latch.countDown()
        }

        assertTrue("Inspection should complete within 15 seconds", 
            latch.await(15, TimeUnit.SECONDS))
        
        assertNotNull("Inspection result should not be null", result)
        
        val inspectionResult = result!!
        assertNotNull("Route name should not be null", inspectionResult.routeName)
        assertTrue("Route name should not be empty", 
            inspectionResult.routeName.isNotEmpty())
        
        // Screenshot might be empty in some cases, but structure should be valid
        assertNotNull("Screenshot field should exist", inspectionResult.screenshot)
    }

    @Test
    fun testRouteDetectionWorks() {
        val activity = InstrumentationRegistry.getInstrumentation().activity
        if (activity == null) return

        val provider = NativeAndroidRouteProvider(activity)
        val routeName = provider.getCurrentRouteName()

        assertNotNull("Route name should not be null", routeName)
        assertTrue("Route name should not be empty", routeName.isNotEmpty())
        assertNotEquals("Route name should not be 'Unknown' if activity is available", 
            "Unknown", routeName)
    }
}

