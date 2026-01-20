import {NudgeStorage} from '../storage/Storage'
import {
  getCtaFromStorageToMemory,
  resetCtaHandlerGlobalState,
} from './ctaHandler'
import {
  AccessToken,
  RavenClientOptions,
  RavenClientConfig,
} from './ravenclient.interface'

class RavenClient {
  private static instance: RavenClient | null = null
  private options: RavenClientOptions | undefined
  public platform: string = 'ios'
  public config?: RavenClientConfig

  // Private constructor to prevent direct instantiation
  private constructor() {
    // Initialize any properties here
  }
  // Static method to get the singleton instance
  public static getInstance(): RavenClient {
    if (RavenClient.instance === null) {
      RavenClient.instance = new RavenClient()
    }
    return RavenClient.instance
  }

  /**
   * Initialize the RavenClient with options object
   * @param options - RavenClientOptions containing all configuration
   */
  init(options: RavenClientOptions) {
    this.options = options

    // Set platform
    this.platform = options.config.platform
    this.config = options.config
    getCtaFromStorageToMemory()
  }

  getOptions(): RavenClientOptions {
    if (!this.options) {
      throw new Error(
        'RavenClient not initialized. Call ravenClient.init() first.',
      )
    }
    return this.options
  }
  // Call app event with event name and props
  onAppEvent(eventName: string, props?: unknown): void {
    this.getOptions().listeners.appEvent(eventName, props)
  }

  // Getter methods for API configuration
  getBaseUrl(): string {
    return this.getOptions().config.baseUrl
  }

  getUserId(): string | number {
    return this.getOptions().config.userId
  }

  getAccessToken(): AccessToken {
    return this.getOptions().listeners.getAccessToken()
  }

  getAppVersion(): string {
    return this.getOptions().config.appVersion
  }

  getCodepushVersion(): string | undefined {
    return this.getOptions().config.codepushVersion
  }

  getPackageNameValue(): string {
    return this.getOptions().config.packageName
  }

  getTenantId(): string | undefined {
    return this.getOptions().config.tenantId
  }

  public static resetInstance(): void {
    RavenClient.instance = null
  }
  logout() {
    NudgeStorage.removeAll()
    resetCtaHandlerGlobalState()
  }
}

export const ravenClient = RavenClient.getInstance()
