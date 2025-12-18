import './global.d'
import {NativeModules} from 'react-native'
import {RavenStorage} from './RavenStorage'

const NativeStorageModule = NativeModules.StorageModule

function isLoaded() {
  return (
    global.__RavenStorageProxy !== null &&
    global.__RavenStorageProxy !== undefined
  )
}

if (!isLoaded()) {
  const isSuccessful = NativeStorageModule?.installJSIModule()

  if (!isSuccessful || !isLoaded()) {
    console.warn('JSI bindings installation failed for RavenStorage module')
  }
}

export {RavenStorage}
