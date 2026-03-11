import type {OutAppConfig} from './OutAppConfig'
import type {UpdateUserProfileParams} from '../cta/ravenclient.interface'
import NativeRavenTurbo from '../NativeRavenTurbo'

export function initializeOutApp(config: OutAppConfig): Promise<void> {
  return Promise.resolve(NativeRavenTurbo.initializeOutApp(config))
}

export function updateUserProfile(
  params: UpdateUserProfileParams,
): Promise<void> {
  return NativeRavenTurbo.updateUserProfile(params)
}

export function logoutOutApp(): Promise<void> {
  return NativeRavenTurbo.logout()
}
