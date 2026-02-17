package com.ravenclient.screeninspector.scanner

import android.view.View
import java.lang.reflect.Method

/**
 * Strategy for extracting testID/accessibility identifiers from views.
 * Handles React Native testID mapping and fallbacks for native views.
 */
object TestIdExtractor {
    private var reactTestIdResourceId: Int? = null
    private var nativeIdMethod: Method? = null

    init {
        initializeReactNativeResources()
    }

    /**
     * Attempts to find React Native's testID resource ID.
     * React Native stores testID using a specific resource ID.
     */
    private fun initializeReactNativeResources() {
        try {
            // React Native uses com.facebook.react.R.id.react_test_id
            val reactRClass = Class.forName("com.facebook.react.R\$id")
            val field = reactRClass.getField("react_test_id")
            reactTestIdResourceId = field.get(null) as? Int
        } catch (e: Exception) {
            // React Native resources not available - this is OK for pure native
            reactTestIdResourceId = null
        }

        // Try to get nativeID method via reflection (React Native property)
        try {
            nativeIdMethod = View::class.java.getMethod("getNativeId")
        } catch (e: Exception) {
            nativeIdMethod = null
        }
    }

    /**
     * Extracts testID from a view using multiple strategies:
     * 1. React Native testID (via resource ID tag)
     * 2. React Native nativeID (via reflection)
     * 3. contentDescription (accessibility)
     * 4. tag property (fallback)
     *
     * @param view The view to extract testID from
     * @return The testID if found, empty string otherwise
     */
    fun extractTestId(view: View): String {
        // Strategy 1: React Native testID via resource ID
        reactTestIdResourceId?.let { resourceId ->
            try {
                val tag = view.getTag(resourceId)
                if (tag is String && tag.isNotEmpty()) {
                    return tag
                }
            } catch (e: Exception) {
                // Ignore
            }
        }

//        // Strategy 2: React Native nativeID via reflection
//        nativeIdMethod?.let { method ->
//            try {
//                val nativeId = method.invoke(view) as? String
//                if (!nativeId.isNullOrEmpty()) {
//                    return nativeId
//                }
//            } catch (e: Exception) {
//                // Ignore
//            }
//        }
//
//        // Strategy 3: contentDescription (commonly used by RN when accessible=true)
//        view.contentDescription?.toString()?.let { description ->
//            if (description.isNotEmpty()) {
//                return description
//            }
//        }
//
//        // Strategy 4: tag property (fallback for custom native views)
//        view.tag?.toString()?.let { tag ->
//            if (tag.isNotEmpty()) {
//                return tag
//            }
//        }

        return ""
    }

    /**
     * Checks if a view has a valid testID
     */
    fun hasTestId(view: View): Boolean {
        return extractTestId(view).isNotEmpty()
    }
}

