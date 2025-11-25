const { getDefaultConfig } = require('@expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.disableHierarchicalLookup = true;
config.resolver.unstable_enableSymlinks = true;
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules')
];
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@questit/ui': path.resolve(workspaceRoot, 'packages/ui/src'),
  '@questit/ui/native': path.resolve(workspaceRoot, 'packages/ui/src/native'),
  '@questit/toolkit': path.resolve(workspaceRoot, 'packages/toolkit/src'),
  '@react-native-async-storage/async-storage': path.resolve(
    workspaceRoot,
    'node_modules/@react-native-async-storage/async-storage'
  )
};

module.exports = config;
