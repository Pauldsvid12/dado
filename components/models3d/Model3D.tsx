import React, { useEffect, useRef } from 'react';
import { Asset } from 'expo-asset';
import * as THREE from 'three';
import '@/lib/utils/three-setup';
// @ts-ignore
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
          if (!asset.downloaded) await asset.downloadAsync();
          uri = asset.localUri || asset.uri;
        } else {
          uri = source.uri;
        }

        if (!uri) throw new Error('No se pudo resolver la URI del modelo');

        const res = await fetch(uri);
        const arrayBuffer = await res.arrayBuffer();

        const basePath = uri.includes('/')
          ? uri.slice(0, uri.lastIndexOf('/') + 1)
          : '';

        const loader = new GLTFLoader();
        // @ts-ignore
        const gltf = await loader.parseAsync(arrayBuffer, basePath);

        if (!mounted) return;

        const model: THREE.Group = gltf.scene;

        model.scale.set(scale, scale, scale);
        model.position.set(position[0], position[1], position[2]);
        model.rotation.set(
          THREE.MathUtils.degToRad(rotationDeg[0]),
          THREE.MathUtils.degToRad(rotationDeg[1]),
          THREE.MathUtils.degToRad(rotationDeg[2])
        );

        model.traverse((child: any) => {
          if (child?.isMesh && child.material) {
            child.material.needsUpdate = true;
          }
        });

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