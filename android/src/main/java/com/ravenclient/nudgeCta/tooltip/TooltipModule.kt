package com.ravenclient.nudgeCta.tooltip

import com.facebook.react.bridge.*

class TooltipModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val controller = TooltipController()

    override fun getName() = NAME

    data class QueuedTooltip(
        val options: ReadableMap,
        val screen: String
    )

    object TooltipScreenManager {
        var currentScreen: String = ""
    }

    @ReactMethod
    fun show(
        options: ReadableMap,
        promise: Promise
    ) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            return promise.reject("ERROR", "Activity is null")
        }
        controller.show(activity, options, promise)
    }

    @ReactMethod
    fun setCurrentScreen(screenName: String) {
        val activity = reactApplicationContext.currentActivity ?: return
        controller.setCurrentScreen(activity, screenName)
    }

    @ReactMethod
    fun hide(targetId: String, callback: Callback?) {
        val activity = reactApplicationContext.currentActivity ?: return
        controller.hide(activity, targetId, callback)
    }

    @ReactMethod
    fun hideAll(promise: Promise) {
        val activity = reactApplicationContext.currentActivity ?: return
        controller.hideAll(activity, promise)
    }
    companion object {
        const val NAME = "TooltipModule"
    }
}