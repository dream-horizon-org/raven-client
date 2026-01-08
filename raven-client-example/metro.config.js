const {getDefaultConfig} = require('expo/metro-config');
const {wrapWithReanimatedMetroConfig} = require('react-native-reanimated/metro-config');

/**
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Wrap with reanimated config (must be last)
module.exports = wrapWithReanimatedMetroConfig(config);


