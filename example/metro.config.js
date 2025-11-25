const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const root = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});

// Prevent loading React from parent node_modules to avoid duplicate React instances
module.exports = mergeConfig(config, {
  resolver: {
    blockList: [
      // Only block react and react-native core packages from parent, not @react-native/* scoped packages
      new RegExp(`${path.resolve(root, 'node_modules/react/').replace(/[/\\]/g, '[/\\\\]')}.*`),
      new RegExp(`${path.resolve(root, 'node_modules/react-native/').replace(/[/\\]/g, '[/\\\\]')}.*`),
    ],
  },
  watchFolders: [
    path.resolve(__dirname, '..'),
  ],
});
