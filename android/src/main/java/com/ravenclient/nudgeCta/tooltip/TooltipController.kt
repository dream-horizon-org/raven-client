package com.ravenclient.nudgeCta.tooltip

import android.app.Activity
import android.graphics.Rect
import android.os.Handler
import android.os.Looper
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.facebook.react.bridge.*

class TooltipController {
    private val tooltips = mutableMapOf<String, TooltipView>()
    private val overlays = mutableMapOf<String, FrameLayout>()
    private val handler = Handler(Looper.getMainLooper())
    private val pollInterval = 300L
    private val pollTimeout = 2500L

    private val pendingTooltips = mutableMapOf<String, MutableList<TooltipModule.QueuedTooltip>>()
    private val delayedRunnables = mutableListOf<Runnable>()

    fun show(activity: Activity, options: ReadableMap, promise: Promise) {
        val screen = options.getString("targetScreen") ?: ""
        val targetId = options.getString("targetId") ?: run {
            promise.reject("ERROR", "targetId is required")
            return
        }

        if (screen.isNotEmpty() && screen != TooltipModule.TooltipScreenManager.currentScreen) {
            pendingTooltips.getOrPut(screen) { mutableListOf() }
                .add(TooltipModule.QueuedTooltip(options, screen))
            promise.resolve("QUEUED_FOR_SCREEN_$screen")
            return
        }

        try {
            val root = activity.window.decorView as ViewGroup
            waitForView(
                root,
                targetId,
                pollInterval,
                pollTimeout,
                onFound = { targetView ->
                    if (isViewVisibleOnScreen(targetView)) {
                        showTooltipOnView(activity, targetId, targetView, options, promise)
                    } else {
                        promise.resolve("SKIPPED_NOT_VISIBLE")
                    }
                },
                onTimeout = { promise.reject("ERROR", "View not found: $targetId after timeout") }
            ) { runnable, delay -> handler.postDelayed(runnable, delay) }
        } catch (e: Exception) {
            promise.reject("ERROR", "Error showing tooltip: ${e.message}")
        }
    }

    fun setCurrentScreen(activity: Activity, screenName: String) {
        activity.runOnUiThread {
            if (TooltipModule.TooltipScreenManager.currentScreen != screenName) {
                delayedRunnables.forEach { handler.removeCallbacks(it) }
                delayedRunnables.clear()

                overlays.values.forEach { overlay ->
                    try {
                        (activity.window.decorView as ViewGroup).removeView(overlay)
                    } catch (_: Exception) {}
                }
                overlays.clear()
                tooltips.clear()

                TooltipModule.TooltipScreenManager.currentScreen = screenName

                pendingTooltips[screenName]?.let { queued ->
                    queued.forEach { tooltip ->
                        handler.postDelayed({
                            show(
                                activity,
                                tooltip.options,
                                PromiseImpl({}, {})
                            )
                        }, 250)
                    }
                    pendingTooltips.remove(screenName)
                }

                pendingTooltips.keys.filter { it != screenName }.forEach { pendingTooltips.remove(it) }
            }
        }
    }

    fun hide(activity: Activity, targetId: String, callback: Callback?) {
        activity.runOnUiThread {
            try {
                overlays[targetId]?.let { overlay ->
                    (activity.window.decorView as ViewGroup).removeView(overlay)
                }
            } catch (_: Exception) {}
            overlays.remove(targetId)
            tooltips.remove(targetId)
            callback?.invoke()
        }
    }

    fun hideAll(activity: Activity, promise: Promise) {
        activity.runOnUiThread {
            try {
                overlays.values.forEach { overlay ->
                    try {
                        (activity.window.decorView as ViewGroup).removeView(overlay)
                    } catch (_: Exception) {}
                }
            } catch (_: Exception) {}
            overlays.clear()
            tooltips.clear()
            delayedRunnables.forEach { handler.removeCallbacks(it) }
            delayedRunnables.clear()
            promise.resolve(null)
        }
    }

    private fun showTooltipOnView(
        activity: Activity,
        targetId: String,
        targetView: View,
        options: ReadableMap,
        promise: Promise?
    ) {
        val currentScreenAtShow = TooltipModule.TooltipScreenManager.currentScreen
        val delayMs = options.getIntOrNull("triggerDelay")?.toLong() ?: 100L

        val runnable = Runnable {
            if (TooltipModule.TooltipScreenManager.currentScreen != currentScreenAtShow) {
                return@Runnable
            }

            if (!isViewVisibleOnScreen(targetView)) {
                promise?.resolve("SKIPPED_NOT_VISIBLE")
                return@Runnable
            }

            val title = options.getString("title") ?: ""
            val subTitle = options.getString("subTitle") ?: ""
            val position = options.getString("position") ?: "top"
            val bgColor = parseColor(options.getString("backgroundColor"))
            val titleColor = parseColor(options.getString("titleColor"))
            val subTitleColor = parseColor(options.getString("subTitleColor"))
            val duration = options.getIntOrNull("autoDismissMs")?.toLong() ?: 0
            val cornerRadius = options.getDoubleOrNull("borderRadius")?.toFloat() ?: 0f
            val paddingTop = options.getIntOrNull("paddingTop") ?: 0
            val paddingBottom = options.getIntOrNull("paddingBottom") ?: 0
            val paddingStart = options.getIntOrNull("paddingLeft") ?: 0
            val paddingEnd = options.getIntOrNull("paddingRight") ?: 0
            val marginTop = options.getIntOrNull("marginTop") ?: 0
            val marginBottom = options.getIntOrNull("marginBottom") ?: 0
            val marginStart = options.getIntOrNull("marginLeft") ?: 0
            val marginEnd = options.getIntOrNull("marginRight") ?: 0
            val titleFontSize = options.getDoubleOrNull("titleFontSize")?.toFloat() ?: 16f
            val subTitleFontSize = options.getDoubleOrNull("subTitleFontSize")?.toFloat() ?: 14f
            val titleFontFamily = options.getString("titleFontFamily")
            val subTitleFontFamily = options.getString("subTitleFontFamily")
            val titleFontWeight = options.getString("titleFontWeight")
            val subTitleFontWeight = options.getString("subTitleFontWeight")
            val dismissOnOutsideTouch = options.getBooleanOrNull("dismissOnOutsideTouch") ?: true
            val arrowSize = options.getIntOrNull("arrowSize")?.toFloat() ?: 16f
            val titleAlignment = options.getString("titleAlignment") ?: "left"
            val subTitleAlignment = options.getString("subTitleAlignment") ?: "left"

            val overlay = object : FrameLayout(activity) {
                override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
                    if (dismissOnOutsideTouch) hideAll(activity, PromiseImpl({}, {}))
                    return false
                }
            }.apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                setBackgroundColor(android.graphics.Color.TRANSPARENT)
            }

            val tooltip = TooltipView(activity).apply {
                setTitle(title)
                if(subTitle.isNotEmpty()) setSubTitle(subTitle)
                setPosition(TooltipPosition.valueOf(position.uppercase()))
                setColors(bgColor, titleColor, subTitleColor)
                setCornerRadius(cornerRadius)
                setPaddingInside(
                    paddingTop.toFloat(),
                    paddingBottom.toFloat(),
                    paddingStart.toFloat(),
                    paddingEnd.toFloat()
                )
                setMarginValue(
                    marginTop.toFloat(),
                    marginBottom.toFloat(),
                    marginStart.toFloat(),
                    marginEnd.toFloat()
                )
                setTitleFontSize(titleFontSize)
                if(subTitle.isNotEmpty()) setSubTitleFontSize(subTitleFontSize)
                setTitleFontFamily(titleFontFamily)
                setTitleFontWeight(titleFontWeight)
                if(subTitle.isNotEmpty()) {
                    setSubTitleFontFamily(subTitleFontFamily)
                    setSubTitleFontWeight(subTitleFontWeight)
                }
                setArrowSize(arrowSize)
                setTitleAlignment(titleAlignment)
                if(subTitle.isNotEmpty()) setSubTitleAlignment(subTitleAlignment)
            }

            try {
                val loc = IntArray(2)
                targetView.getLocationOnScreen(loc)
                tooltip.setTargetFrame(
                    Rect(loc[0], loc[1], loc[0] + targetView.width, loc[1] + targetView.height)
                )
            } catch (e: Exception) {
                promise?.resolve("SKIPPED_ERROR: ${e.message}")
                return@Runnable
            }

            try {
                overlay.addView(tooltip)
                (activity.window.decorView as ViewGroup).addView(overlay)
                tooltips[targetId] = tooltip
                overlays[targetId] = overlay

                if (duration > 0) tooltip.postDelayed({ hide(activity, targetId, null) }, duration)
                promise?.resolve(null)
            } catch (e: Exception) {
                promise?.resolve("SKIPPED_ERROR: ${e.message}")
            }
        }

        delayedRunnables.add(runnable)
        handler.postDelayed(runnable, delayMs)
    }
}