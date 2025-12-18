let plugin

try {
  plugin = require('./plugins/dist/withPlugin')
} catch (error) {
  throw new Error(
    'Unable to load Raven config plugin. Make sure the plugins have been compiled by running "npx tsc -p plugins/tsconfig.json" before publishing.',
    {cause: error},
  )
}

module.exports = plugin.default ?? plugin
