import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { Model3D } from './Model3D';

type ModelSource = number | { uri: string };
type ModelCanvasProps = {
  source: ModelSource;
  style?: ViewStyle;
  scale?: number;
  position?: [number, number, number];
  rotationDeg?: [number, number, number];
  backgroundColorHex?: number; // ej 0x0f172a
  autoRotate?: boolean;
};
export const ModelCanvas: React.FC<ModelCanvasProps> = ({
  source,
  style,
  scale = 2.5,
  position = [0, 0, 0],
  rotationDeg = [0, 0, 0],
  backgroundColorHex = 0x0f172a,
  autoRotate = true,
}) => {
  const [ready, setReady] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const onContextCreate = (gl: any) => {
    try {
      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;
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
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.set(0, 0.5, 5);
      cameraRef.current = camera;

      scene.add(new THREE.AmbientLight(0xffffff, 0.7));

      const dir = new THREE.DirectionalLight(0xffffff, 0.9);
      dir.position.set(5, 8, 5);
      scene.add(dir);
      const point = new THREE.PointLight(0x8b5cf6, 0.6);
      point.position.set(-5, -5, 3);
      scene.add(point);

      setReady(true);

      const animate = () => {
        requestAnimationFrame(animate);
        if (autoRotate && sceneRef.current) { //Rotacion suave
          sceneRef.current.rotation.y += 0.01;
        }
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
          gl.endFrameEXP();
        }
      };
      animate();
    } catch (e) {
      console.error('Error creando contexto 3D:', e);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
      {!ready && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      )}
      {ready && sceneRef.current && (
        <Model3D
          source={source}
          scene={sceneRef.current}
          scale={scale}
          position={position}
          rotationDeg={rotationDeg}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
});