package com.ravenclient

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = RavenTurboModuleImpl.NAME)
class RavenTurboModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = RavenTurboModuleImpl.NAME

  @ReactMethod
  fun initializeOutApp(config: ReadableMap, promise: Promise) {
    OutAppInitializer.initializeOutApp(config, reactApplicationContext, promise)
  }

  @ReactMethod
  fun updateUserProfile(params: ReadableMap, promise: Promise) {
    OutAppInitializer.updateUserProfile(params, reactApplicationContext, promise)
  }
}
