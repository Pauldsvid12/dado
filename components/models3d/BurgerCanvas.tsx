import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ViewStyle } from 'react-native';
import { GLView } from 'expo-gl';
import { Asset } from 'expo-asset';
import * as THREE from 'three';
import '@/lib/utils/three-setup';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type BurgerPart = {
  id: string;
  label: string;
  source: number; // require('...glb')
};

type BurgerCanvasProps = {
  parts: BurgerPart[];
  style?: ViewStyle;
  backgroundColorHex?: number;
  autoRotate?: boolean;
  targetHeight?: number;        // <- para agrandar/achicar
  layerGap?: number;            // <- separación entre capas
  hideSeeds?: boolean;          // <- ocultar semillas por nombre
};

export const BurgerCanvas: React.FC<BurgerCanvasProps> = ({
  parts,
  style,
  backgroundColorHex = 0x0f172a,
  autoRotate = true,
  targetHeight = 4.2, // <- más grande (antes 2.6)
  layerGap = 0.05,
  hideSeeds = true,
}) => {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const rafRef = useRef<number | null>(null);

  const partsKey = useMemo(
    () => `${parts.map((p) => p.id).join('|')}|h=${targetHeight}|g=${layerGap}|hs=${hideSeeds ? 1 : 0}`,
    [parts, targetHeight, layerGap, hideSeeds]
  );

  const cleanupGroup = () => {
    if (!sceneRef.current || !groupRef.current) return;

    const group = groupRef.current;
    sceneRef.current.remove(group);

    group.traverse((child: any) => {
      if (child?.isMesh) {
        child.geometry?.dispose?.();
        const mat = child.material;
        if (Array.isArray(mat)) mat.forEach((m) => m?.dispose?.());
        else mat?.dispose?.();
      }
    });

    groupRef.current = null;
  };

  const fitCameraToObject = (camera: THREE.PerspectiveCamera, object: THREE.Object3D) => {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    object.position.x -= center.x;
    object.position.y -= center.y;
    object.position.z -= center.z;

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2));
    cameraZ *= 2.1;

    camera.position.set(0, 0.8, cameraZ);
    camera.near = cameraZ / 100;
    camera.far = cameraZ * 100;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
  };

  const onContextCreate = (gl: any) => {
    try {
      setLoadError(null);

      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;

      // Mock canvas para THREE en RN
      const canvas = {
        width,
        height,
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        clientHeight: height,
        clientWidth: width,
      };

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas as any,
        context: gl as any,
        alpha: true,
        antialias: true,
      });

      renderer.setSize(width, height);
      renderer.setPixelRatio(1);
      renderer.setClearColor(backgroundColorHex, 1);
      rendererRef.current = renderer;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 0.8, 6);
      cameraRef.current = camera;

      // Luces
      scene.add(new THREE.AmbientLight(0xffffff, 0.75));

      const dir = new THREE.DirectionalLight(0xffffff, 0.9);
      dir.position.set(6, 10, 6);
      scene.add(dir);

      const point = new THREE.PointLight(0x8b5cf6, 0.6);
      point.position.set(-6, -4, 4);
      scene.add(point);

      setReady(true);

      const animate = () => {
        rafRef.current = requestAnimationFrame(animate);

        if (autoRotate && groupRef.current) {
          groupRef.current.rotation.y += 0.01;
        }

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
          gl.endFrameEXP();
        }
      };

      animate();
    } catch (e: any) {
      setLoadError(e?.message ?? String(e));
    }
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        if (!ready || !sceneRef.current || !cameraRef.current) return;

        cleanupGroup();

        const scene = sceneRef.current;
        const camera = cameraRef.current;

        const group = new THREE.Group();
        scene.add(group);
        groupRef.current = group;

        const loader = new GLTFLoader();
        let currentY = 0;

        for (const part of parts) {
          const asset = Asset.fromModule(part.source);
          if (!asset.downloaded) await asset.downloadAsync();
          const uri = asset.localUri || asset.uri;

          if (!uri) throw new Error(`No se pudo resolver uri para ${part.id}`);

          const res = await fetch(uri);
          const buffer = await res.arrayBuffer();

          const basePath = uri.includes('/') ? uri.slice(0, uri.lastIndexOf('/') + 1) : '';

          // parseAsync para ArrayBuffer (pipeline estable)
          // @ts-ignore
          const gltf = await loader.parseAsync(buffer, basePath);

          if (!mounted) return;

          const model: THREE.Group = gltf.scene;

          // Opción: ocultar semillas por nombre (arreglo rápido)
          if (hideSeeds) {
            model.traverse((child: any) => {
              const name = String(child?.name ?? '').toLowerCase();
              if (name.includes('seed') || name.includes('semilla') || name.includes('sesame')) {
                child.visible = false;
              }
            });
          }

          // Centrar en X/Z y apilar en Y
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          model.position.x -= center.x;
          model.position.z -= center.z;

          const bottomY = box.min.y;
          model.position.y -= bottomY;
          model.position.y += currentY;

          currentY += size.y + layerGap;

          model.traverse((child: any) => {
            if (child?.isMesh && child.material) {
              child.material.needsUpdate = true;
            }
          });

          group.add(model);
        }

        // Escalar toda la hamburguesa
        const burgerBox = new THREE.Box3().setFromObject(group);
        const burgerSize = burgerBox.getSize(new THREE.Vector3());
        const scaleFactor = burgerSize.y > 0 ? targetHeight / burgerSize.y : 1;
        group.scale.setScalar(scaleFactor);

        fitCameraToObject(camera, group);

        setLoadError(null);
      } catch (e: any) {
        setLoadError(e?.message ?? String(e));
      }
    };

    run();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, partsKey]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      cleanupGroup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.container, style]}>
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />

      {!ready && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      )}

      {loadError && (
        <View style={styles.overlay}>
          <Text style={styles.errorTitle}>No se pudo cargar</Text>
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 360,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  errorTitle: { color: '#FFF', fontWeight: '800', marginBottom: 8 },
  errorText: { color: '#FCA5A5', textAlign: 'center' },
});