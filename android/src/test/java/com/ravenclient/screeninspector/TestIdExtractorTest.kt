package com.ravenclient.screeninspector

import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.test.platform.app.InstrumentationRegistry
import com.ravenclient.screeninspector.scanner.TestIdExtractor
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

/**
 * Unit tests for TestIdExtractor
 * Tests that testID extraction works for both native Android and React Native scenarios
 */
class TestIdExtractorTest {

    private lateinit var context: android.content.Context

    @Before
    fun setup() {
        context = InstrumentationRegistry.getInstrumentation().targetContext
    }

    @Test
    fun testExtractFromContentDescription() {
        // Native Android: contentDescription is primary method
        val button = Button(context)
        button.contentDescription = "btnTest"
        
        val testId = TestIdExtractor.extractTestId(button)
        assertEquals("btnTest", testId)
        assertTrue(TestIdExtractor.hasTestId(button))
    }

    @Test
    fun testExtractFromTag() {
        // Native Android: tag property as fallback
        val textView = TextView(context)
        textView.tag = "txtTest"
        
        val testId = TestIdExtractor.extractTestId(textView)
        assertEquals("txtTest", testId)
        assertTrue(TestIdExtractor.hasTestId(textView))
    }

    @Test
    fun testNoTestId() {
        // View without testID
        val view = View(context)
        
        val testId = TestIdExtractor.extractTestId(view)
        assertEquals("", testId)
        assertFalse(TestIdExtractor.hasTestId(view))
    }

    @Test
    fun testContentDescriptionPriority() {
        // contentDescription should take priority over tag
        val view = View(context)
        view.contentDescription = "contentDesc"
        view.tag = "tagValue"
        
        val testId = TestIdExtractor.extractTestId(view)
        assertEquals("contentDesc", testId)
    }

    @Test
    fun testEmptyContentDescription() {
        // Empty contentDescription should fallback to tag
        val view = View(context)
        view.contentDescription = ""
        view.tag = "tagValue"
        
        val testId = TestIdExtractor.extractTestId(view)
        assertEquals("tagValue", testId)
    }

    @Test
    fun testNullValues() {
        // Should handle null values gracefully
        val view = View(context)
        view.contentDescription = null
        view.tag = null
        
        val testId = TestIdExtractor.extractTestId(view)
        assertEquals("", testId)
        assertFalse(TestIdExtractor.hasTestId(view))
    }
}

