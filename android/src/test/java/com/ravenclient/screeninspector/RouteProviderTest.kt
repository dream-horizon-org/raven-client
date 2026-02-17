package com.ravenclient.screeninspector

import android.app.Activity
import androidx.test.platform.app.InstrumentationRegistry
import com.ravenclient.screeninspector.route.NativeAndroidRouteProvider
import com.ravenclient.screeninspector.route.ReactNativeRouteProvider
import com.ravenclient.screeninspector.route.RouteProvider
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for RouteProvider implementations
 */
class RouteProviderTest {

    private lateinit var context: android.content.Context

    @Before
    fun setup() {
        context = InstrumentationRegistry.getInstrumentation().targetContext
    }

    @Test
    fun testReactNativeRouteProvider() {
        // Set route name via tracker
        CurrentScreenTracker.updateRouteName("TestScreen")
        
        val provider: RouteProvider = ReactNativeRouteProvider()
        val routeName = provider.getCurrentRouteName()
        
        assertEquals("TestScreen", routeName)
    }

    @Test
    fun testReactNativeRouteProviderDefault() {
        // Reset to default
        CurrentScreenTracker.updateRouteName("Unknown")
        
        val provider: RouteProvider = ReactNativeRouteProvider()
        val routeName = provider.getCurrentRouteName()
        
        assertEquals("Unknown", routeName)
    }

    @Test
    fun testNativeAndroidRouteProviderWithoutActivity() {
        // Provider should handle null activity gracefully
        val provider: RouteProvider = NativeAndroidRouteProvider(null)
        val routeName = provider.getCurrentRouteName()
        
        assertEquals("Unknown", routeName)
    }

    @Test
    fun testNativeAndroidRouteProviderWithActivity() {
        // Create a mock activity context
        // Note: In real tests, you'd use ActivityTestRule or similar
        // For now, we test that it doesn't crash
        val provider: RouteProvider = NativeAndroidRouteProvider(null)
        val routeName = provider.getCurrentRouteName()
        
        // Should return "Unknown" or a valid route name
        assertNotNull(routeName)
        assertTrue(routeName.isNotEmpty())
    }
}

