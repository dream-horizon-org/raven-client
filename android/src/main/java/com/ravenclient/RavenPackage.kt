package com.ravenclient

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import java.util.HashMap

import com.ravenstorage.StorageModule
import com.ravenclient.nudgeCta.tooltip.TooltipModule
import com.ravenclient.screeninspector.ScreenInspectorModule

class RavenPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return when (name) {
      RavenModule.NAME -> RavenModule(reactContext)
      TooltipModule.NAME -> TooltipModule(reactContext)
      ScreenInspectorModule.NAME -> ScreenInspectorModule(reactContext)
      StorageModule.NAME -> StorageModule(reactContext)
      RavenTurboModuleImpl.NAME -> RavenTurboModule(reactContext)
      else -> null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
      listOf(
        RavenModule.NAME,
        TooltipModule.NAME,
        ScreenInspectorModule.NAME,
        StorageModule.NAME,
      ).forEach { moduleName ->
        moduleInfos[moduleName] = ReactModuleInfo(
          moduleName,
          moduleName,
          false,
          false,
          false,
          false
        )
      }
      moduleInfos[RavenTurboModuleImpl.NAME] = ReactModuleInfo(
        RavenTurboModuleImpl.NAME,
        RavenTurboModuleImpl.NAME,
        false,
        false,
        false,
        BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      )
      moduleInfos
    }
  }
}
