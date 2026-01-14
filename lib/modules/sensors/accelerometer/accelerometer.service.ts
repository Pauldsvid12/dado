import { Accelerometer } from 'expo-sensors';
import { UPDATE_INTERVAL } from '@/lib/core/constants';

export type AccelerometerData = {
  x: number;
  y: number;
  z: number;
};

export const SensorService = {
  subscribe: (callback: (data: AccelerometerData) => void) => {
    Accelerometer.setUpdateInterval(UPDATE_INTERVAL);
    const subscription = Accelerometer.addListener(callback);
    return subscription;
  },

  unsubscribe: (subscription: any) => {
    subscription?.remove();
  },

  isAvailable: async () => {
    return await Accelerometer.isAvailableAsync();
  },
};