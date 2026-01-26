import * as THREE from 'three';

export function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  zoom = 1.8
) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  object.position.x -= center.x;
  object.position.y -= center.y;
  object.position.z -= center.z;

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = (camera.fov * Math.PI) / 180;
  let cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2));
  cameraZ *= zoom;

  camera.position.set(0, 0.5, cameraZ);
  camera.lookAt(0, 0, 0);
}
