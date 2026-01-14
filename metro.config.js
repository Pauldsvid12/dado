const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Agregar extensiones de archivos 3D
config.resolver.assetExts.push(
  // Modelos 3D
  'glb',
  'gltf',
  'obj',
  'mtl',
  'fbx',
  // Texturas
  'bin',
  'hdr'
);

module.exports = config;