const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const root = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = withMetroConfig(defaultConfig, {
  root,
  dirname: __dirname,
});

// Ensure package resolves to source files for proper singleton behavior
const extraNodeModules = {
  '@dreamhorizonorg/raven-client': path.resolve(root, 'src'),
};

config.resolver = {
  ...config.resolver,
  extraNodeModules,
  // Add node_modules paths for proper dependency resolution
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(root, 'node_modules'),
  ],
  // This ensures imports resolve to the same instance
  resolveRequest: (context, moduleName, platform) => {
    // Force @dreamhorizonorg/raven-client to resolve to source files
    if (moduleName === '@dreamhorizonorg/raven-client') {
      const filePath = path.resolve(root, 'src/index.tsx');
      console.log('🔄 [Metro] Resolving @dreamhorizonorg/raven-client to:', filePath);
      return {
        filePath,
        type: 'sourceFile',
      };
    }

    // Use default resolver for everything else
    return context.resolveRequest(context, moduleName, platform);
  },
};

// Watch the source folder for changes
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(root, 'src'),
  path.resolve(root, 'node_modules'),
];

// Wrap with reanimated config (must be last)
module.exports = wrapWithReanimatedMetroConfig(config);
