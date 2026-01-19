const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Aseguramos que estas extensiones se traten como assets
const assetExts = ['glb', 'gltf', 'bin', 'obj', 'fbx'];

// Añadimos solo las que no estén ya
assetExts.forEach((ext) => {
  if (!config.resolver.assetExts.includes(ext)) {
    config.resolver.assetExts.push(ext);
  }
});

module.exports = config;