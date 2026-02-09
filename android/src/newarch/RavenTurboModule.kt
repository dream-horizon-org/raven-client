package com.ravenclient

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = RavenTurboModuleImpl.NAME)
class RavenTurboModule(reactContext: ReactApplicationContext) :
  NativeRavenTurboSpec(reactContext) {

  override fun getName(): String = RavenTurboModuleImpl.NAME

  override fun multiply(a: Double, b: Double): Double = a * b

  override fun add(a: Double, b: Double): Double = a + b
}
