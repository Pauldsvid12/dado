// @ts-nocheck
import * as THREE from 'three';
import { Platform } from 'react-native';

(() => {
  //Solo aplicar polyfills en Android/iOS
  if (Platform.OS === 'web') return;

  const g: any = globalThis as any;

  //No sobreescribir si ya existe
  if (typeof g.window === 'undefined') g.window = {};
  if (typeof g.document === 'undefined') {
    g.document = {
      createElement: () => ({
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        getContext: () => null,
        width: 0,
        height: 0,
        setAttribute: () => {},
        getAttribute: () => null,
      }),
      createElementNS: () => ({
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    };
  }

  if (typeof g.Image === 'undefined') {
    g.Image = class {
      addEventListener() {}
      removeEventListener() {}
      set src(_v: string) {}
    };
  }

  g.THREE = g.THREE || THREE;
})();