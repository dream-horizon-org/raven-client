export interface AccessToken {
  token: string
  tokenType: string
}

export interface RavenClientListeners {
  appEvent: (eventName: string, props?: unknown) => void
  getAccessToken: () => AccessToken
}

export interface RavenClientConfig {
  baseUrl: string
  userId: string | number
  appVersion: string
  codepushVersion?: string
  platform: string
  packageName: string
  tenantId?: string
}

export interface RavenClientOptions {
  listeners: RavenClientListeners
  config: RavenClientConfig
}
