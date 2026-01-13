import {RAVEN_API_VERSION} from '../utils/AppUtils.constant'
import {ravenClient} from './ravenclient'

export function getCtaApiHeaders(): Record<string, string | number> {
  const accessToken = ravenClient.getAccessToken()
  const appVersion = ravenClient.getAppVersion()
  const codepushVersion = ravenClient.getCodepushVersion()
  const userId = ravenClient.getUserId()
  const packageName = ravenClient.getPackageNameValue()
  const tenantId = ravenClient.getTenantId()

  const headers: Record<string, string | number> = {
    'content-type': 'application/json',
    app_version: appVersion,
    package_name: packageName,
    api_version: RAVEN_API_VERSION,
    Authorization: `${accessToken.tokenType} ${accessToken.token}`,
    'auth-userid': userId.toString(),
  }
  if (codepushVersion) {
    headers.codepush_version = codepushVersion
  }
  if (tenantId) {
    headers['x-tenant-id'] = tenantId
  }
  return headers
}
