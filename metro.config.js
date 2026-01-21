const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Extensiones 3D como assets
const assetExts = ['glb', 'gltf', 'bin', 'obj', 'fbx'];

assetExts.forEach((ext) => {
  if (!config.resolver.assetExts.includes(ext)) {
    config.resolver.assetExts.push(ext);
  }
});

module.exports = config;