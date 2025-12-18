package com.ravenclient.screeninspector

import android.graphics.*
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import com.facebook.react.bridge.*
import java.io.ByteArrayOutputStream

object CurrentScreenTracker {
    var currentRouteName: String = "Unknown"
}

class ScreenInspectorModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = NAME

    /**
     * Called from JS whenever route changes
     */
    @ReactMethod
    fun setCurrentScreen(routeName: String) {
        CurrentScreenTracker.currentRouteName = routeName
    }

    /**
     * Capture full view hierarchy + screenshot
     */
    @ReactMethod
    fun captureScreen(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No active activity found")
            return
        }

        try {
            val rootView = activity.window.decorView.rootView
            val flatList = Arguments.createArray()
            val tempList = mutableListOf<WritableMap>()
            traverseFlatHierarchy(rootView, null, tempList)
            tempList.forEach { flatList.pushMap(it) }

            takeScreenshot(rootView) { screenshotBase64 ->
                val result = Arguments.createMap()
                result.putString("routeName", CurrentScreenTracker.currentRouteName)
                result.putArray("hierarchy", flatList)
                result.putString("screenshot", screenshotBase64 ?: "")
                promise.resolve(result)
            }

        } catch (e: Exception) {
            promise.reject("CAPTURE_ERROR", e)
        }
    }

    private fun traverseFlatHierarchy(view: View, parentId: String?, list: MutableList<WritableMap>) {
        val id = System.identityHashCode(view).toString()
        val rect = Rect()
        view.getGlobalVisibleRect(rect)

        val node = Arguments.createMap()
        node.putString("id", id)
        node.putString("parentId", parentId)
        node.putString("className", view.javaClass.simpleName)

        val testId = try {
            view.getTag(view.id)?.toString()
                ?: view.contentDescription?.toString()
                ?: ""
        } catch (e: Exception) {
            ""
        }
        node.putString("targetId", testId)

        node.putBoolean("visible", view.isShown)
        node.putMap("bounds", rectToMap(rect))
        node.putDouble("zIndex", view.z.toDouble())

        list.add(node)

        if (view is ViewGroup) {
            for (i in 0 until view.childCount) {
                traverseFlatHierarchy(view.getChildAt(i), id, list)
            }
        }
    }

    private fun rectToMap(rect: Rect): WritableMap {
        val map = Arguments.createMap()
        map.putInt("x", rect.left)
        map.putInt("y", rect.top)
        map.putInt("width", rect.width())
        map.putInt("height", rect.height())
        return map
    }

    private fun takeScreenshot(view: View, callback: (String?) -> Unit) {
        Handler(Looper.getMainLooper()).post {
            try {
                if (view.width == 0 || view.height == 0) {
                    callback(null)
                    return@post
                }

                val bitmap = Bitmap.createBitmap(view.width, view.height, Bitmap.Config.ARGB_8888)
                val canvas = Canvas(bitmap)
                view.draw(canvas)

                val outputStream = ByteArrayOutputStream()
                bitmap.compress(Bitmap.CompressFormat.JPEG, 70, outputStream)
                val base64 = android.util.Base64.encodeToString(outputStream.toByteArray(), android.util.Base64.DEFAULT)

                callback(base64)
            } catch (e: Exception) {
                e.printStackTrace()
                callback(null)
            }
        }
    }
    companion object {
        const val NAME = "ScreenInspector"
    }
}
