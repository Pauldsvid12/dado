import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import '@/lib/utils/three-setup';
import { Ingredient } from '@/types/burger';
import { buildBurgerGroup } from '@/lib/three/burger/buildBurgerGroup';
import { fitCameraToObject } from '@/lib/three/burger/fitCamera';

type Props = {
  ingredients: Ingredient[];
  style?: ViewStyle;
  backgroundColorHex?: number;
  autoRotate?: boolean;
  targetHeight?: number;
  layerGap?: number;
  hideSeeds?: boolean;
};
export const BurgerCanvas: React.FC<Props> = ({
  ingredients,
  style,
  backgroundColorHex = 0x0f172a,
  autoRotate = true,
  targetHeight = 4.5,
  layerGap = 0,
  hideSeeds = true,
}) => {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scene = useRef<THREE.Scene | null>(null);
  const camera = useRef<THREE.PerspectiveCamera | null>(null);
  const renderer = useRef<THREE.WebGLRenderer | null>(null);
  const group = useRef<THREE.Group | null>(null);
  const raf = useRef<number | null>(null);
  const key = useMemo(() => ingredients.map((i) => i.id).join('|'), [ingredients]);
  const onContextCreate = (gl: any) => {
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    const r = new THREE.WebGLRenderer({
      canvas: {
        width: w,
        height: h,
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
      } as any,
      context: gl,
      alpha: true,
      antialias: true,
    });
    r.setSize(w, h);
    r.setPixelRatio(1);
    r.setClearColor(backgroundColorHex, 1);
    renderer.current = r;

    const s = new THREE.Scene();
    s.add(new THREE.AmbientLight(0xffffff, 0.8));
    const d = new THREE.DirectionalLight(0xffffff, 1);
    d.position.set(5, 10, 7);
    s.add(d);
    scene.current = s;

    const c = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    c.position.set(0, 1, 6);
    camera.current = c;
    setReady(true);

    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      if (autoRotate && group.current) group.current.rotation.y += 0.005;
      r.render(s, c);
      gl.endFrameEXP();
    };
    loop();
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!ready || !scene.current || !camera.current) return;
      try {
        setErr(null);
        if (group.current) {
          scene.current.remove(group.current);
          group.current = null;
        }
        const g = await buildBurgerGroup({
          ingredients,
          hideSeeds,
          layerGap,
        });

        if (!alive) return;
        const b = new THREE.Box3().setFromObject(g);
        const h = b.getSize(new THREE.Vector3()).y || 1;
        g.scale.setScalar(targetHeight / h);

        scene.current.add(g);
        group.current = g;
        fitCameraToObject(camera.current, g);
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, [ready, key, hideSeeds, layerGap, targetHeight]);

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      if (scene.current && group.current) scene.current.remove(group.current);
      group.current = null;
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
      {!!err && (
        <View style={styles.overlay}>
          <Text style={styles.err}>{err}</Text>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  err: {
    color: '#EF4444',
    fontWeight: '700',
    textAlign: 'center',
  },
});