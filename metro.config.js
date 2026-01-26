const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Extensiones 3D como assets
config.resolver.assetExts.push('glb', 'gltf', 'bin', 'obj', 'fbx');

module.exports = config;