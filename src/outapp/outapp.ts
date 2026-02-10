import type { OutAppConfig, UpdateUserProfileParams } from './OutAppConfig';
import NativeRavenTurbo from '../NativeRavenTurbo';

export function initializeOutApp(config: OutAppConfig): Promise<void> {
  return Promise.resolve(NativeRavenTurbo.initializeOutApp(config));
}

export function updateUserProfile(params: UpdateUserProfileParams): Promise<void> {
  return NativeRavenTurbo.updateUserProfile(params);
}
