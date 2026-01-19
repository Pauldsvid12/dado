import React, { useEffect, useRef } from 'react';
import { Asset } from 'expo-asset';
import * as THREE from 'three';
import '../../lib/utils/three-setup';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type DiceModel3DProps = {
  isRolling: boolean;
  targetValue: number;
  onAnimationComplete?: () => void;
  scene: THREE.Scene;
};

export const DiceModel3D: React.FC<DiceModel3DProps> = ({
  isRolling,
  targetValue,
  onAnimationComplete,
  scene,
}) => {
  const modelRef = useRef<THREE.Group | null>(null);
  const rotationSpeed = useRef({ x: 0, y: 0, z: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadModel = async () => {
      try {
        const asset = Asset.fromModule(require('@/assets/models/dice.glb'));
        if (!asset.downloaded) await asset.downloadAsync();
        if (!mounted) return;

        const uri = asset.localUri || asset.uri;
        const res = await fetch(uri);
        const arrayBuffer = await res.arrayBuffer();
        const basePath = uri.split('/').slice(0, -1).join('/') + '/';

        const loader = new GLTFLoader();
        // @ts-ignore
        const gltf = await loader.parseAsync(arrayBuffer, basePath);

        if (!mounted) return;

        const model: THREE.Group = gltf.scene;
        model.scale.set(2.5, 2.5, 2.5);
        model.position.set(0, 0, 0);

        model.traverse((child: any) => {
          if (child?.isMesh && child.material) {
            child.material.needsUpdate = true;
          }
        });

        scene.add(model);
        modelRef.current = model;
      } catch (e: any) {
        console.error('Error cargando modelo:', e?.message ?? e);
      }
    };

    loadModel();

    return () => {
      mounted = false;
      if (modelRef.current) {
        scene.remove(modelRef.current);
        modelRef.current = null;
      }
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [scene]);

  useEffect(() => {
    if (isRolling) {
      rotationSpeed.current = {
        x: (Math.random() - 0.5) * 0.3,
        y: (Math.random() - 0.5) * 0.3,
        z: (Math.random() - 0.5) * 0.3,
      };
    } else {
      rotationSpeed.current = { x: 0, y: 0, z: 0 };
      if (modelRef.current) {
        // Usamos la nueva función de rotación corregida
        const r = getDiceRotation(targetValue);
        modelRef.current.rotation.set(
          r.x * (Math.PI / 180),
          r.y * (Math.PI / 180),
          r.z * (Math.PI / 180)
        );
      }
      onAnimationComplete?.();
    }
  }, [isRolling, targetValue, onAnimationComplete]);

  useEffect(() => {
    if (!isRolling) return;

    const tick = () => {
      if (modelRef.current) {
        modelRef.current.rotation.x += rotationSpeed.current.x;
        modelRef.current.rotation.y += rotationSpeed.current.y;
        modelRef.current.rotation.z += rotationSpeed.current.z;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isRolling]);

  return null;
};

// MAPEO EXACTO BASADO EN TUS FOTOS
const getDiceRotation = (value: number) => {
  const R = {
    front: { x: 0, y: 0, z: 0 },
    back: { x: 0, y: 180, z: 0 },
    right: { x: 0, y: 90, z: 0 },
    left: { x: 0, y: -90, z: 0 },
    bottom: { x: 90, y: 0, z: 0 },
    top: { x: -90, y: 0, z: 0 },
  };

  const mapping: Record<number, any> = {
    1: R.bottom, // Cara 1 está Abajo
    2: R.left,   // Cara 2 está a la Izquierda (Correcto)
    3: R.top,    // Cara 9 está Arriba (Usamos esto para el 3 o el 9)
    9: R.top,    // Soporte explícito para el 9
    4: R.back,   // Cara 4 está Atrás
    5: R.right,  // Cara 5 está a la Derecha
    6: R.front,  // Cara 6 está al Frente
  };

  return mapping[value] || mapping[1];
};
