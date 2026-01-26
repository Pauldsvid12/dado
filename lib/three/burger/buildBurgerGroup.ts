import { Asset } from 'expo-asset';
import * as ExpoTHREE from 'expo-three';
import * as THREE from 'three';
import { Ingredient } from '@/types/burger';

const ASSETS_MAP: Record<string, number> = {
  panarriba: require('@/assets/models/burger/panarriba.glb'),
  lechuga: require('@/assets/models/burger/lechuga.glb'),
  queso: require('@/assets/models/burger/queso.glb'),
  carne: require('@/assets/models/burger/carne.glb'),
  tomates: require('@/assets/models/burger/tomates.glb'),
  panabajo: require('@/assets/models/burger/panabajo.glb'),
};

const ADVANCE_BY_TYPE: Record<string, number> = {
  panabajo: 0.75,
  panarriba: 0.75,
  carne: 0.55,
  queso: 0.35,
  lechuga: 0.28,
  tomates: 0.3,
};

type Options = {
  ingredients: Ingredient[];
  hideSeeds?: boolean;
  layerGap?: number;
  minGap?: number;
};

async function loadGlbFromModule(source: number): Promise<THREE.Object3D> {
  
  await Asset.loadAsync(source);
  const loaded: any = await ExpoTHREE.loadAsync(source, undefined, undefined);
  const obj = loaded?.scene ?? loaded?.object ?? loaded;
  if (!obj) throw new Error('No se pudo cargar el GLB con ExpoTHREE.loadAsync');

  return obj as THREE.Object3D;
}

export async function buildBurgerGroup({
  ingredients,
  hideSeeds = true,
  layerGap = 0,
  minGap = 0.002,
}: Options) {
  //Precarga para reducir fallos
  await Asset.loadAsync(Object.values(ASSETS_MAP));

  const group = new THREE.Group();
  let currentY = 0;

  for (const ing of ingredients) {
    const source = ASSETS_MAP[ing.type];
    if (!source) continue;

    const obj = await loadGlbFromModule(source);

    //Clonar para apilar múltiples instancias
    const model = obj.clone(true) as THREE.Group;

    if (hideSeeds) {
      model.traverse((child: any) => {
        const name = (child?.name || '').toLowerCase();
        if (name.includes('seed') || name.includes('semilla')) child.visible = false;
      });
    }

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    model.position.x -= center.x;
    model.position.z -= center.z;

    model.position.y -= box.min.y;
    model.position.y += currentY;

    const advanceFactor = ADVANCE_BY_TYPE[ing.type] ?? 0.4;
    const gap = Math.max(layerGap, minGap);
    currentY += Math.max(size.y * advanceFactor, 0.001) + gap;

    group.add(model);
  }

  return group;
}
