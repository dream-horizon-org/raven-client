export interface AccessToken {
  token: string
  tokenType: string
}

export interface NudgeClientListeners {
  appEvent: (eventName: string, props?: unknown) => void
  fetchCtaApi: <TVariables, TData>(
    url: string,
    method: string,
    variables?: TVariables,
  ) => Promise<TData>
  getAccessToken: () => AccessToken
}

export interface NudgeClientConfig {
  baseUrl: string
  userId: string | number
  appVersion: string
  codepushVersion?: string
  platform: string
  nudgeRouteName: string
  packageName: string
  tenantId?: string
}

export interface NudgeClientOptions {
  listeners: NudgeClientListeners
  config: NudgeClientConfig
}
