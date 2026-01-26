import '@/lib/utils/three-setup'; // @ts-ignore
import { toByteArray } from 'base64-js';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type ModelSource = number | { uri: string }; // number = require('...glb')
type Model3DProps = {
  source: ModelSource;
  scene: THREE.Scene;
  scale?: number;
  position?: [number, number, number];
  rotationDeg?: [number, number, number];
  onLoaded?: (model: THREE.Group) => void;
};
function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(bytes.length);
  new Uint8Array(ab).set(bytes);
  return ab;
}
function getBasePath(uri: string) {
  return uri.includes('/') ? uri.slice(0, uri.lastIndexOf('/') + 1) : '';
}
async function parseGLB(loader: any, buffer: ArrayBuffer, basePath: string) {
  // GLTFLoader.parse(data, path, onLoad, onError) [web:83]
  return await new Promise<any>((resolve, reject) => {
    loader.parse(buffer, basePath, resolve, reject);
  });
}
export const Model3D: React.FC<Model3DProps> = ({
  source,
  scene,
  scale = 2.5,
  position = [0, 0, 0],
  rotationDeg = [0, 0, 0],
  onLoaded,
}) => {
  const modelRef = useRef<THREE.Group | null>(null);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        let uri: string | undefined;
        if (typeof source === 'number') {
          const asset = Asset.fromModule(source);
          await asset.downloadAsync();
          uri = asset.localUri ?? asset.uri;
        } else {
          uri = source.uri;
        }
        if (!uri) throw new Error('No se pudo resolver la URI del modelo');
        const basePath = getBasePath(uri);
        const loader = new GLTFLoader();
        if (typeof loader.setPath === 'function') loader.setPath(basePath);
        if (typeof loader.setResourcePath === 'function') loader.setResourcePath(basePath);
        let gltf: any;
        if (Platform.OS === 'web') {
          const res = await fetch(uri);
          const buffer = await res.arrayBuffer();
          gltf = await parseGLB(loader, buffer, basePath);
        } else {
          // Legacy API: readAsStringAsync (Android/iOS) [web:6]
          const b64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' as const });
          const bytes = toByteArray(b64);
          const buffer = bytesToArrayBuffer(bytes);
          gltf = await parseGLB(loader, buffer, basePath);
        }
        if (!mounted) return;
        const model: THREE.Group = gltf.scene;

        model.scale.set(scale, scale, scale);
        model.position.set(position[0], position[1], position[2]);
        model.rotation.set(
          THREE.MathUtils.degToRad(rotationDeg[0]),
          THREE.MathUtils.degToRad(rotationDeg[1]),
          THREE.MathUtils.degToRad(rotationDeg[2])
        );

        scene.add(model);
        modelRef.current = model;
        onLoaded?.(model);
      } catch (e: any) {
        console.error('Error cargando modelo:', e?.message ?? e);
      }
    };
    load();

    return () => {
      mounted = false;
      if (modelRef.current) {
        scene.remove(modelRef.current);
        modelRef.current = null;
      }
    };
  }, [source, scene, scale, position, rotationDeg, onLoaded]);
  return null;
};