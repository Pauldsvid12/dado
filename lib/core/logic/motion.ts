import { SHAKE_THRESHOLD } from '../constants';

export type Vector3 = { x: number; y: number; z: number };

export const calculateMagnitude = (data: Vector3): number => {
  return Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
};

export const isShaking = (data: Vector3): boolean => {
  const magnitude = calculateMagnitude(data);
  return magnitude > SHAKE_THRESHOLD;
};

export const getShakeIntensity = (data: Vector3): number => {
  const magnitude = calculateMagnitude(data);
  return Math.min((magnitude - 1) / 2, 1);
};