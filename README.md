# Dado (Expo + React Native)

Proyecto móvil hecho con **React Native + Expo** usando **Expo Router** (rutas por archivos dentro de `app/`).
La app muestra un visualizador 3D de una hamburguesa armada por capas a partir de modelos **.glb** (pan, carne, queso, etc.), renderizados con `expo-gl` y `three` dentro de un `GLView`.

## ¿Qué hace la app?
- Renderiza una hamburguesa 3D apilando ingredientes (cada ingrediente es un modelo `.glb`).
## Requisitos
- Node.js + npm
- Expo Go instalado (Android/iOS)
## Requisitos
- Node.js + npm
- Expo Go instalado
## Para abrir o probar mi proyecto:
npx expo start --go --tunnel -c

## Estructura del proyecto
1. components/models3d/ → Canvas y componentes 3D (BurgerCanvas, ModelCanvas, Model3D)
2. lib/three/burger/ → helpers 3D (buildBurgerGroup, fitCamera)
3. assets/models/burger/ → modelos .glb de ingredientes
4. assets/images/ → iconos y splash
