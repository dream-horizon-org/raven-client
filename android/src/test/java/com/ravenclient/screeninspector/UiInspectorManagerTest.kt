package com.ravenclient.screeninspector

import android.app.Activity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import androidx.test.platform.app.InstrumentationRegistry
import com.ravenclient.screeninspector.models.ScreenInspectionResult
import com.ravenclient.screeninspector.route.NativeAndroidRouteProvider
import com.ravenclient.screeninspector.route.ReactNativeRouteProvider
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/**
 * Integration tests for UiInspectorManager
 */
class UiInspectorManagerTest {

    private lateinit var context: android.content.Context

    @Before
    fun setup() {
        context = InstrumentationRegistry.getInstrumentation().targetContext
    }

    @Test
    fun testInspectScreenWithNativeProvider() {
        // Create a mock activity with views
        val activity = createMockActivity()
        
        val manager = UiInspectorManager(
            routeProvider = NativeAndroidRouteProvider(activity)
        )

        val latch = CountDownLatch(1)
        var result: ScreenInspectionResult? = null

        manager.inspectScreen(activity) { inspectionResult ->
            result = inspectionResult
            latch.countDown()
        }

        assertTrue(latch.await(10, TimeUnit.SECONDS))
        assertNotNull(result)

        val inspectionResult = result!!
        assertNotNull(inspectionResult.screenName)
        assertTrue(inspectionResult.screenName.isNotEmpty())
        
        // Should find at least one element
        assertTrue(inspectionResult.elements.isNotEmpty())
        assertNotNull(inspectionResult.viewport)
        assertNotNull(inspectionResult.meta)
    }

    @Test
    fun testInspectScreenWithReactNativeProvider() {
        CurrentScreenTracker.updateRouteName("RNTestScreen")
        
        val activity = createMockActivity()
        val manager = UiInspectorManager(
            routeProvider = ReactNativeRouteProvider()
        )

        val latch = CountDownLatch(1)
        var result: ScreenInspectionResult? = null

        manager.inspectScreen(activity) { inspectionResult ->
            result = inspectionResult
            latch.countDown()
        }

        assertTrue(latch.await(10, TimeUnit.SECONDS))
        assertNotNull(result)

        val inspectionResult = result!!
        assertEquals("RNTestScreen", inspectionResult.screenName)
    }

    @Test
    fun testGetTargetNodesOnly() {
        val activity = createMockActivity()
        val manager = UiInspectorManager()

        val latch = CountDownLatch(1)
        var targets: List<com.ravenclient.screeninspector.models.TargetNode>? = null

        manager.getTargetNodes(activity) { targetNodes ->
            targets = targetNodes
            latch.countDown()
        }

        assertTrue(latch.await(10, TimeUnit.SECONDS))
        assertNotNull(targets)
        assertTrue(targets!!.isNotEmpty())
    }

    @Test
    fun testInspectScreenWithNullActivity() {
        val manager = UiInspectorManager()
        
        val latch = CountDownLatch(1)
        var result: ScreenInspectionResult? = null

        manager.inspectScreen(null) { inspectionResult ->
            result = inspectionResult
            latch.countDown()
        }

        assertTrue(latch.await(2, TimeUnit.SECONDS))
        assertNull(result) // Should return null for null activity
    }

    @Test
    fun testGetCurrentRouteName() {
        CurrentScreenTracker.updateRouteName("TestRoute")
        
        val activity = createMockActivity()
        val manager = UiInspectorManager(
            routeProvider = ReactNativeRouteProvider()
        )

        val routeName = manager.getCurrentRouteName(activity)
        assertEquals("TestRoute", routeName)
    }

    @Test
    fun testDefaultProviderIsNative() {
        // Default constructor should use native provider
        val activity = createMockActivity()
        val manager = UiInspectorManager() // Default constructor
        
        manager.setActivity(activity)
        val routeName = manager.getCurrentRouteName()
        
        // Should not be "Unknown" if activity is set (native provider should detect activity name)
        assertNotNull(routeName)
    }

    private fun createMockActivity(): Activity {
        // Create a simple activity-like structure for testing
        // In real tests, use ActivityTestRule or Robolectric
        val activity = object : Activity() {
            override fun onCreate(savedInstanceState: android.os.Bundle?) {
                super.onCreate(savedInstanceState)
                
                val root = LinearLayout(this).apply {
                    orientation = LinearLayout.VERTICAL
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                }

                val button = Button(this).apply {
                    text = "Test Button"
                    contentDescription = "btnTest"
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.WRAP_CONTENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT
                    )
                }
                root.addView(button)

                setContentView(root)
            }
        }
        
        // Initialize the activity
        activity.onCreate(null)
        return activity
    }
}

