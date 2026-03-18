import {type ConfigPlugin, createRunOncePlugin} from '@expo/config-plugins';
import withAndroidPlugin from './withAndroidPlugin';
import withIosPlugin from './withIosPlugins';
import type {RavenPluginProps} from './types';

const withRavenPlugin: ConfigPlugin<RavenPluginProps | void> = (
  config,
  _props,
) => {
  const props: RavenPluginProps = (_props as RavenPluginProps) ?? {};
  config = withAndroidPlugin(config, props.android ?? {});
  config = withIosPlugin(config, props.ios ?? {});
  return config;
};

export default createRunOncePlugin(
  withRavenPlugin,
  '@dreamhorizonorg/raven-client',
);
