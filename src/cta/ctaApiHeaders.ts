import {RAVEN_API_VERSION} from '../utils/AppUtils.constant'
import {nudgeClient} from './nudgeclient'

export function getCtaApiHeaders(): Record<string, string | number> {
  const accessToken = nudgeClient.getAccessToken()
  const appVersion = nudgeClient.getAppVersion()
  const codepushVersion = nudgeClient.getCodepushVersion()
  const userId = nudgeClient.getUserId()
  const packageName = nudgeClient.getPackageNameValue()
  const tenantId = nudgeClient.getTenantId()

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
