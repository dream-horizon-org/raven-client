import {type ConfigPlugin} from '@expo/config-plugins'
import withAndroidPlugin from './withAndroidPlugin'
import withIosPlugin from './withIosPlugins'

const withRavenPlugin: ConfigPlugin = (config) => {
  config = withAndroidPlugin(config)
  config = withIosPlugin(config)
  return config
}

export default withRavenPlugin
