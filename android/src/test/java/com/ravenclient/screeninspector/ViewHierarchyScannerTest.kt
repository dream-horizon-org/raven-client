package com.ravenclient.screeninspector

import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.test.platform.app.InstrumentationRegistry
import com.ravenclient.screeninspector.models.TargetNode
import com.ravenclient.screeninspector.scanner.ViewHierarchyScanner
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/**
 * Unit tests for ViewHierarchyScanner
 * Tests view hierarchy traversal and target detection
 */
class ViewHierarchyScannerTest {

    private lateinit var context: android.content.Context
    private lateinit var scanner: ViewHierarchyScanner

    @Before
    fun setup() {
        context = InstrumentationRegistry.getInstrumentation().targetContext
        scanner = ViewHierarchyScanner()
    }

    @Test
    fun testScanSimpleHierarchy() {
        // Create a simple view hierarchy with testIDs
        val root = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
        }

        val button = Button(context).apply {
            contentDescription = "btnTest"
            layoutParams = ViewGroup.LayoutParams(100, 50)
        }
        root.addView(button)

        val textView = TextView(context).apply {
            contentDescription = "txtTest"
            layoutParams = ViewGroup.LayoutParams(200, 30)
        }
        root.addView(textView)

        // Measure and layout views
        root.measure(
            View.MeasureSpec.makeMeasureSpec(300, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(200, View.MeasureSpec.EXACTLY)
        )
        root.layout(0, 0, 300, 200)

        val latch = CountDownLatch(1)
        var results: List<TargetNode>? = null

        scanner.scanViewHierarchy(root) { targets ->
            results = targets
            latch.countDown()
        }

        // Wait for scan to complete
        assertTrue(latch.await(5, TimeUnit.SECONDS))
        assertNotNull(results)

        val targets = results!!
        assertEquals(2, targets.size)
        
        val buttonTarget = targets.find { it.elementId == "btnTest" }
        assertNotNull(buttonTarget)
        assertTrue(buttonTarget!!.bounds.width() > 0)
        assertTrue(buttonTarget.bounds.height() > 0)

        val textTarget = targets.find { it.elementId == "txtTest" }
        assertNotNull(textTarget)
    }

    @Test
    fun testScanNestedHierarchy() {
        // Create nested view hierarchy
        val root = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            contentDescription = "rootContainer"
        }

        val container = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            contentDescription = "innerContainer"
        }

        val button = Button(context).apply {
            contentDescription = "btnNested"
            layoutParams = ViewGroup.LayoutParams(100, 50)
        }
        container.addView(button)
        root.addView(container)

        root.measure(
            View.MeasureSpec.makeMeasureSpec(300, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(200, View.MeasureSpec.EXACTLY)
        )
        root.layout(0, 0, 300, 200)

        val latch = CountDownLatch(1)
        var results: List<TargetNode>? = null

        scanner.scanViewHierarchy(root) { targets ->
            results = targets
            latch.countDown()
        }

        assertTrue(latch.await(5, TimeUnit.SECONDS))
        assertNotNull(results)

        val targets = results!!
        assertTrue(targets.size >= 2) // At least root and button
        
        assertNotNull(targets.find { it.elementId == "rootContainer" })
        assertNotNull(targets.find { it.elementId == "btnNested" })
    }

    @Test
    fun testScanIgnoresInvisibleViews() {
        val root = LinearLayout(context)
        
        val visibleButton = Button(context).apply {
            contentDescription = "btnVisible"
            visibility = View.VISIBLE
            layoutParams = ViewGroup.LayoutParams(100, 50)
        }
        root.addView(visibleButton)

        val invisibleButton = Button(context).apply {
            contentDescription = "btnInvisible"
            visibility = View.GONE
            layoutParams = ViewGroup.LayoutParams(100, 50)
        }
        root.addView(invisibleButton)

        root.measure(
            View.MeasureSpec.makeMeasureSpec(300, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(200, View.MeasureSpec.EXACTLY)
        )
        root.layout(0, 0, 300, 200)

        val latch = CountDownLatch(1)
        var results: List<TargetNode>? = null

        scanner.scanViewHierarchy(root) { targets ->
            results = targets
            latch.countDown()
        }

        assertTrue(latch.await(5, TimeUnit.SECONDS))
        assertNotNull(results)

        val targets = results!!
        // Should only find visible button
        assertNotNull(targets.find { it.elementId == "btnVisible" })
        assertNull(targets.find { it.elementId == "btnInvisible" })
    }

    @Test
    fun testScanEmptyHierarchy() {
        val root = LinearLayout(context)
        root.measure(
            View.MeasureSpec.makeMeasureSpec(300, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(200, View.MeasureSpec.EXACTLY)
        )
        root.layout(0, 0, 300, 200)

        val latch = CountDownLatch(1)
        var results: List<TargetNode>? = null

        scanner.scanViewHierarchy(root) { targets ->
            results = targets
            latch.countDown()
        }

        assertTrue(latch.await(5, TimeUnit.SECONDS))
        assertNotNull(results)
        assertEquals(0, results!!.size)
    }
}

