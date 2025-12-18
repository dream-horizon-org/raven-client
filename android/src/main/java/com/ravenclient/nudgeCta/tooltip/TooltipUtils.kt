package com.ravenclient.nudgeCta.tooltip

import android.graphics.Color
import android.graphics.Rect
import android.view.View
import android.view.ViewGroup
import com.facebook.react.bridge.ReadableMap

internal fun waitForView(root: ViewGroup, targetId: String, pollInterval: Long, pollTimeout: Long, onFound: (View) -> Unit, onTimeout: () -> Unit, postDelay: (Runnable, Long) -> Unit) {
    val startTime = System.currentTimeMillis()
    fun check() {
        val view = findViewByTag(root, targetId)
        if (view != null && isViewVisibleOnScreen(view)) {
            onFound(view)
        } else if (System.currentTimeMillis() - startTime >= pollTimeout) onTimeout()
        else postDelay(Runnable { check() }, pollInterval)
    }
    check()
}

internal fun findViewByTag(root: ViewGroup, tag: String): View? {
    if (tag == root.tag || tag == root.contentDescription) return root
    for (i in 0 until root.childCount) {
        val child = root.getChildAt(i)
        if (tag == child.tag || tag == child.contentDescription) return child
        if (child is ViewGroup) {
            val result = findViewByTag(child, tag)
            if (result != null) return result
        }
    }
    return null
}

internal fun isViewVisibleOnScreen(view: View): Boolean {
    try {
        if (!view.isAttachedToWindow || !view.isShown || view.alpha == 0f) return false

        val rect = Rect()
        val isVisible = view.getGlobalVisibleRect(rect)
        if (!isVisible) return false

        val visibleArea = rect.width() * rect.height()
        val totalArea = view.width * view.height
        return totalArea > 0 && visibleArea >= totalArea * 0.4
    } catch (e: Exception) {
        return false
    }
}

internal fun parseColor(colorString: String?): Int {
    return try {
        Color.parseColor(colorString ?: "#000000")
    } catch (_: Exception) {
        Color.BLACK
    }
}

internal fun ReadableMap.getIntOrNull(key: String): Int? = if (hasKey(key)) getInt(key) else null
internal fun ReadableMap.getDoubleOrNull(key: String): Double? = if (hasKey(key)) getDouble(key) else null
internal fun ReadableMap.getBooleanOrNull(key: String): Boolean? = if (hasKey(key)) getBoolean(key) else null