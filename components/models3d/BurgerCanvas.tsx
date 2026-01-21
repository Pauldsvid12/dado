import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ViewStyle } from 'react-native';
import { GLView } from 'expo-gl';
import { Asset } from 'expo-asset';
import * as THREE from 'three';
import '@/lib/utils/three-setup';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Ingredient } from '@/types/burger';

// Mapa de assets: Asocia el "tipo" de ingrediente con su archivo .glb
const ASSETS_MAP: Record<string, number> = {
  panarriba: require('@/assets/models/burger/panarriba.glb'),
  lechuga: require('@/assets/models/burger/lechuga.glb'),
  queso: require('@/assets/models/burger/queso.glb'),
  carne: require('@/assets/models/burger/carne.glb'),
  tomates: require('@/assets/models/burger/tomates.glb'),
  panabajo: require('@/assets/models/burger/panabajo.glb'),
};

type BurgerCanvasProps = {
  ingredients: Ingredient[];
  style?: ViewStyle;
  backgroundColorHex?: number;
  autoRotate?: boolean;
  targetHeight?: number;
  layerGap?: number;
  hideSeeds?: boolean;
};

export const BurgerCanvas: React.FC<BurgerCanvasProps> = ({
  ingredients,
  style,
  backgroundColorHex = 0x0f172a,
  autoRotate = true,
  targetHeight = 4.5,
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

  // Clave única para detectar cambios en la lista de ingredientes
  const ingredientsKey = useMemo(
    () => ingredients.map((i) => i.id).join('|'),
    [ingredients]
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
    cameraZ *= 1.8;

    camera.position.set(0, 0.5, cameraZ);
    camera.lookAt(0, 0, 0);
  };

  const onContextCreate = (gl: any) => {
    try {
      setLoadError(null);
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;

      const renderer = new THREE.WebGLRenderer({
        canvas: {
          width, height, style: {},
          addEventListener: () => {}, removeEventListener: () => {},
          clientHeight: height, clientWidth: width,
        } as any,
        context: gl,
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
      camera.position.set(0, 1, 6);
      cameraRef.current = camera;

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const dirLight = new THREE.DirectionalLight(0xffffff, 1);
      dirLight.position.set(5, 10, 7);
      scene.add(dirLight);

      setReady(true);

      const animate = () => {
        rafRef.current = requestAnimationFrame(animate);
        if (autoRotate && groupRef.current) {
          groupRef.current.rotation.y += 0.005;
        }
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      animate();
    } catch (e: any) {
      setLoadError(e?.message ?? String(e));
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadIngredients = async () => {
      if (!ready || !sceneRef.current || !cameraRef.current) return;
      
      try {
        cleanupGroup();

        const group = new THREE.Group();
        sceneRef.current.add(group);
        groupRef.current = group;

        const loader = new GLTFLoader();
        let currentY = 0;

        for (const ing of ingredients) {
          const source = ASSETS_MAP[ing.type];
          if (!source) continue;

          // 1. Resolver asset
          const asset = Asset.fromModule(source);
          if (!asset.downloaded) await asset.downloadAsync();
          
          const uri = asset.localUri || asset.uri;
          
          if (!uri) {
            console.warn(`[Burger] No URI for ${ing.type}`);
            continue;
          }

          // 2. Cargar usando loader.load() en lugar de parseAsync manual
          // Esto evita errores de 'match of undefined' al manejar paths en Android
          // @ts-ignore
          const gltf = await new Promise((resolve, reject) => {
            loader.load(
              uri,
              (data: any) => resolve(data),
              undefined,
              (err: any) => reject(err)
            );
          });
          
          if (!mounted) return;

          // @ts-ignore
          const model = gltf.scene.clone(true);

          if (hideSeeds) {
            model.traverse((child: any) => {
              const name = (child.name || '').toLowerCase();
              if (name.includes('seed') || name.includes('semilla')) child.visible = false;
            });
          }

          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          model.position.x -= center.x;
          model.position.z -= center.z;

          const bottomY = box.min.y;
          model.position.y -= bottomY;
          model.position.y += currentY;

          currentY += size.y + layerGap;

          group.add(model);
        }

        const totalBox = new THREE.Box3().setFromObject(group);
        const totalSize = totalBox.getSize(new THREE.Vector3());
        
        if (totalSize.y > 0) {
          const scale = targetHeight / totalSize.y;
          group.scale.setScalar(scale);
        }

        fitCameraToObject(cameraRef.current, group);
        setLoadError(null);

      } catch (e: any) {
        console.error("Error building burger:", e);
        setLoadError("Error cargando modelo: " + (e.message || "Unknown error"));
      }
    };

    loadIngredients();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, ingredientsKey]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      cleanupGroup();
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
      
      {!ready && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      )}
      
      {loadError && (
        <View style={styles.center}>
          <Text style={{ color: '#EF4444', fontWeight: 'bold', textAlign: 'center', padding: 20 }}>
            {loadError}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
