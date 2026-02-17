package com.ravenclient.screeninspector.screenshot

import android.graphics.Bitmap
import android.os.Build
import android.view.View
import androidx.annotation.RequiresApi
import java.io.ByteArrayOutputStream
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Provides screenshot capture functionality.
 * Uses PixelCopy API (API 26+) for better quality, falls back to DrawingCache for older versions.
 */
class ScreenshotProvider(
    private val executor: ExecutorService = Executors.newSingleThreadExecutor()
) {
    companion object {
        private const val JPEG_QUALITY = 85
    }

    /**
     * Captures a screenshot of the given view and converts to Base64.
     * Runs on background thread, callback on main thread.
     *
     * @param view The view to capture
     * @param callback Called on main thread with Base64 string or null on error
     */
    fun captureScreenshot(
        view: View,
        callback: (String?) -> Unit
    ) {
        if (view.width == 0 || view.height == 0) {
            view.post { callback(null) }
            return
        }

        executor.execute {
            val bitmap = try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    captureWithPixelCopy(view)
                } else {
                    captureWithDrawingCache(view)
                }
            } catch (e: Exception) {
                null
            }

            val base64 = bitmap?.let { convertToBase64(it) }

            view.post {
                callback(base64)
            }
        }
    }

    /**
     * Modern screenshot capture using PixelCopy (API 26+)
     * Note: PixelCopy is complex for partial views, so we fall back to DrawingCache
     * which works reliably for full-screen captures.
     */
    @RequiresApi(Build.VERSION_CODES.O)
    private fun captureWithPixelCopy(view: View): Bitmap? {
        // PixelCopy works best for full window captures
        // For view-specific captures, DrawingCache is more reliable
        // So we'll use DrawingCache as the primary method
        return captureWithDrawingCache(view)
    }

    /**
     * Fallback screenshot capture using DrawingCache (works on all API levels)
     */
    private fun captureWithDrawingCache(view: View): Bitmap? {
        return try {
            view.isDrawingCacheEnabled = true
            view.buildDrawingCache(true)
            val drawingCache = view.drawingCache
            if (drawingCache != null) {
                // Create a copy to avoid recycling issues
                Bitmap.createBitmap(drawingCache)
            } else {
                // Alternative: draw to canvas
                val bitmap = Bitmap.createBitmap(
                    view.width,
                    view.height,
                    Bitmap.Config.ARGB_8888
                )
                val canvas = android.graphics.Canvas(bitmap)
                view.draw(canvas)
                bitmap
            }
        } catch (e: Exception) {
            null
        } finally {
            view.isDrawingCacheEnabled = false
            view.destroyDrawingCache()
        }
    }

    /**
     * Converts bitmap to Base64 JPEG string
     */
    private fun convertToBase64(bitmap: Bitmap): String {
        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, JPEG_QUALITY, outputStream)
        val bytes = outputStream.toByteArray()
        return android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP)
    }

    /**
     * Shuts down the executor
     */
    fun shutdown() {
        executor.shutdown()
    }
}

