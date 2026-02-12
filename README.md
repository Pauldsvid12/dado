# Burger 3D + Auth (Expo / React Native)

## Descargar APK (Android) — principal
**APK (EAS / descarga directa):** https://expo.dev/artifacts/eas/6uG4v51VSyWtBrpRFkA8VN.apk

- Abre el link desde tu Android para descargar e instalar el APK.
- Si Android bloquea la instalación, habilita “Instalar apps desconocidas” para tu navegador/Files y vuelve a abrir el `.apk`.

---

## Qué es este proyecto
App móvil hecha con React Native + Expo usando Expo Router (rutas por archivos dentro de `app/`).

La app muestra un visualizador 3D de una hamburguesa armada por capas a partir de modelos `.glb`, renderizados con `expo-gl` y `three` dentro de un `GLView`.

---

## Funcionalidades principales
- Burger 3D por capas (modelos `.glb`).
- Auth (Login/Register) con UI dark consistente.
- Notificaciones locales (welcome + pedido) y configuración con sonido custom.
- Home con copy orientado a pedidos, botón “Ver hamburguesa” y “Confirmar pedido”.
- Logout con confirmación.

---

## Requisitos para desarrollo
- Node.js + npm (o yarn/pnpm).
- Proyecto basado en Expo + React Native.

---

## Iniciar el proyecto
Este es el comando recomendado para este repo (Dev Client + Tunnel + limpiar cache):
npx expo start --dev-client --tunnel -c

- Usa `--dev-client` si estás abriendo la app en un development build (no en Expo Go).
- Usa `--tunnel` cuando LAN no te funcione o estés en otra red.
- Usa `-c` cuando tengas cache vieja de Metro.

---

## Estructura del proyecto
- `app/` → rutas (Expo Router)
- `components/models3d/` → canvas y componentes 3D
- `components/ui/` → UI reutilizable (`Input`, `Button`)
- `lib/three/burger/` → helpers 3D
- `lib/core/notifications/` → adapter de notificaciones
- `assets/models/burger/` → modelos `.glb` de ingredientes
- `assets/images/` → iconos y splash
