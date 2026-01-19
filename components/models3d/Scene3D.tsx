import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { DiceModel3D } from './DiceModel3D';

type Scene3DProps = {
  isRolling: boolean;
  diceValue: number;
  onAnimationComplete?: () => void;
};

export const Scene3D: React.FC<Scene3DProps> = ({
  isRolling,
  diceValue,
  onAnimationComplete,
}) => {
  const [isReady, setIsReady] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const onContextCreate = (gl: any) => {
    try {
      console.log('🎨 Inicializando 3D...');

      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;

      // Mock canvas para THREE.js
      const canvas = {
        width,
        height,
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        clientHeight: height,
        clientWidth: width,
      };

      // Crear renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas as any,
        context: gl as any,
        alpha: true,
        antialias: true,
      });

      renderer.setSize(width, height);
      renderer.setPixelRatio(1);
      renderer.setClearColor(0x0f172a, 1);
      rendererRef.current = renderer;

      // Crear escena
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Crear cámara
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      camera.position.z = 5;
      cameraRef.current = camera;

      // Agregar luces
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0x8B5CF6, 0.5);
      pointLight.position.set(-5, -5, 3);
      scene.add(pointLight);

      console.log('✅ 3D inicializado');
      setIsReady(true);

      // Loop de render
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      animate();
    } catch (error) {
      console.error('❌ Error 3D:', error);
    }
  };

  return (
    <View style={styles.container}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />

      {!isReady && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      )}

      {isReady && sceneRef.current && (
        <DiceModel3D
          scene={sceneRef.current}
          isRolling={isRolling}
          targetValue={diceValue}
          onAnimationComplete={onAnimationComplete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glView: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
});