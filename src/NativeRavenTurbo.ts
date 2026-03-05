import type {TurboModule} from 'react-native'
import {TurboModuleRegistry} from 'react-native'

export interface Spec extends TurboModule {
  initializeOutApp(config: Object): Promise<void>
  updateUserProfile(params: Object): Promise<void>
  logout(): Promise<void>
}

export default TurboModuleRegistry.getEnforcing<Spec>('RavenTurbo')
