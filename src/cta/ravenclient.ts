import {Platform} from 'react-native'
import {NudgeStorage} from '../storage/Storage'
import {
  fetchCTA,
  getCtaFromStorageToMemory,
  resetCtaHandlerGlobalState,
} from './ctaHandler'
import {
  GlobalPropsKeys,
  type RavenConfig,
  type GlobalProps,
} from './ravenclient.interface'
import type {OutAppConfig} from '../outapp/OutAppConfig'
import {initializeOutApp, logoutOutApp} from '../outapp/outapp'

class RavenClient {
  private static instance: RavenClient | null = null
  private ravenConfig: RavenConfig | undefined
  public platform: string = 'ios'

  private constructor() {}

  public static getInstance(): RavenClient {
    if (RavenClient.instance === null) {
      RavenClient.instance = new RavenClient()
    }
    return RavenClient.instance
  }

  init(config: RavenConfig) {
    this.validateConfig(config)
    this.applyDefaults(config)
    this.ravenConfig = config
    this.platform = config.globalProps[GlobalPropsKeys.PLATFORM] ?? Platform.OS
    getCtaFromStorageToMemory()
    fetchCTA().catch(() => {})
    this.initOutApp(config)
  }

  private validateConfig(config: RavenConfig) {
    if (!config.baseUrl) {
      throw new Error('baseUrl is required')
    }
    if (!config.apiKey) {
      throw new Error('apiKey is required')
    }
    const gp = config.globalProps
    if (!gp) {
      throw new Error('globalProps is required')
    }
    if (!gp[GlobalPropsKeys.USER_ID]) {
      throw new Error('globalProps.userId is required')
    }
    if (!gp[GlobalPropsKeys.APP_VERSION]) {
      throw new Error('globalProps.appVersion is required')
    }
    if (!gp[GlobalPropsKeys.APP_PACKAGE_NAME]) {
      throw new Error('globalProps.appPackageName is required')
    }
    if (!gp[GlobalPropsKeys.DEVICE_ID]) {
      throw new Error('globalProps.deviceId is required')
    }
  }

  private applyDefaults(config: RavenConfig) {
    if (!config.globalProps[GlobalPropsKeys.PLATFORM]) {
      config.globalProps[GlobalPropsKeys.PLATFORM] = Platform.OS
    }
  }

  private initOutApp(config: RavenConfig) {
    const outAppConfig: OutAppConfig = {
      fcmBaseUrl: config.baseUrl,
      apiKey: config.apiKey,
      globalProps: config.globalProps,
      eventBaseUrl: config.eventBaseUrl,
      notificationBaseUrl: config.notificationBaseUrl,
      userAttributesBaseUrl: config.userAttributesBaseUrl,
      enableLogging: config.enableLogging,
      enableEventService: config.enableEventService,
      enableNotificationTracking: config.enableNotificationTracking,
      enableUserAttributesService: config.enableUserAttributesService,
      fcmRetryConfig: config.fcmRetryConfig,
      eventRetryConfig: config.eventRetryConfig,
      notificationRetryConfig: config.notificationRetryConfig,
      userAttributesRetryConfig: config.userAttributesRetryConfig,
      eventBatchConfig: config.eventBatchConfig,
    }
    initializeOutApp(outAppConfig).catch(() => {})
  }

  getConfig(): RavenConfig {
    if (!this.ravenConfig) {
      throw new Error(
        'RavenClient not initialized. Call ravenClient.init() first.',
      )
    }
    return this.ravenConfig
  }

  getGlobalProps(): GlobalProps {
    return this.getConfig().globalProps
  }

  onAppEvent(eventName: string, props?: unknown): void {
    this.getConfig().listeners?.appEvent?.(eventName, props)
  }

  getBaseUrl(): string {
    return this.getConfig().baseUrl
  }

  getApiKey(): string {
    return this.getConfig().apiKey
  }

  getUserId(): string {
    return this.getGlobalProps()[GlobalPropsKeys.USER_ID]
  }

  getAppVersion(): string {
    return this.getGlobalProps()[GlobalPropsKeys.APP_VERSION]
  }

  getCodepushVersion(): string | undefined {
    return this.getGlobalProps()[GlobalPropsKeys.CODEPUSH_VERSION] as
      | string
      | undefined
  }

  getPackageNameValue(): string {
    return this.getGlobalProps()[GlobalPropsKeys.APP_PACKAGE_NAME]
  }

  getTenantId(): string | undefined {
    return this.getGlobalProps()[GlobalPropsKeys.TENANT_ID] as
      | string
      | undefined
  }

  public static resetInstance(): void {
    RavenClient.instance = null
  }

  logout() {
    NudgeStorage.removeAll()
    resetCtaHandlerGlobalState()
    this.ravenConfig = undefined
    logoutOutApp().catch(() => {})
  }
}

export const ravenClient = RavenClient.getInstance()
