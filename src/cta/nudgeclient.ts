import {NudgeStorage} from '../storage/Storage'
import {
  getCtaFromStorageToMemory,
  resetCtaHandlerGlobalState,
} from './ctaHandler'
import {
  AccessToken,
  NudgeClientOptions,
  NudgeClientConfig,
} from './nudgeclient.interface'

class NudgeClient {
  private static instance: NudgeClient | null = null
  private options: NudgeClientOptions | undefined
  private nudgeRouteName: string = 'Nudge'
  public batchSize: number = 10
  public batchTimeInterval: number = 1000
  public platform: string = 'ios'
  public config?: NudgeClientConfig

  // Private constructor to prevent direct instantiation
  private constructor() {
    // Initialize any properties here
  }
  // Static method to get the singleton instance
  public static getInstance(): NudgeClient {
    if (NudgeClient.instance === null) {
      NudgeClient.instance = new NudgeClient()
    }
    return NudgeClient.instance
  }

  /**
   * Initialize the NudgeClient with options object
   * @param options - NudgeClientOptions containing all configuration
   */
  init(options: NudgeClientOptions) {
    this.options = options

    // Set platform and route name (optional values)
    this.platform = options.config.platform
    this.config = options.config
    this.nudgeRouteName = options.config.nudgeRouteName || 'Nudge'
    getCtaFromStorageToMemory()
  }

  getOptions(): NudgeClientOptions {
    if (!this.options) {
      throw new Error(
        'NudgeClient not initialized. Call nudgeClient.init() first.',
      )
    }
    return this.options
  }
  // Call app event with event name and props
  onAppEvent(eventName: string, props?: unknown): void {
    this.getOptions().listeners.appEvent(eventName, props)
  }

  // Fetch CTA data from API using the registered callback
  fetchCtaApiData<TVariables, TData>(
    url: string,
    method: string,
    variables?: TVariables,
  ): Promise<TData> {
    return this.getOptions().listeners.fetchCtaApi(url, method, variables)
  }
  getNudgeRouteName(): string {
    return this.nudgeRouteName
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
    NudgeClient.instance = null
  }
  logout() {
    NudgeStorage.removeAll()
    resetCtaHandlerGlobalState()
  }
}

export const nudgeClient = NudgeClient.getInstance()
