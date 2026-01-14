export interface AccessToken {
  token: string
  tokenType: string
}

export interface RavenClientListeners {
  appEvent: (eventName: string, props?: unknown) => void
  fetchCtaApi: <TVariables, TData>(
    url: string,
    method: string,
    variables?: TVariables,
  ) => Promise<TData>
  getAccessToken: () => AccessToken
}

export interface RavenClientConfig {
  baseUrl: string
  userId: string | number
  appVersion: string
  codepushVersion?: string
  platform: string
  nudgeRouteName: string
  packageName: string
  tenantId?: string
}

export interface RavenClientOptions {
  listeners: RavenClientListeners
  config: RavenClientConfig
}
