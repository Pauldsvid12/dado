import { Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export type AccelerometerData = {
  x: number;
  y: number;
  z: number;
  timestamp: number;
};

const UPDATE_INTERVAL = 100;

class AccelerometerService {
  private subscription: { remove: () => void } | null = null;

  subscribe(callback: (data: AccelerometerData) => void) {
    // En WEB: evitar addListener porque puede fallar con _nativeModule.addListener [web:50]
    if (Platform.OS === 'web') {
      return () => {};
    }

    Accelerometer.setUpdateInterval(UPDATE_INTERVAL);

    this.subscription = Accelerometer.addListener((data) => {
      callback({
        x: data.x,
        y: data.y,
        z: data.z,
        timestamp: Date.now(),
      });
    });

    return () => this.unsubscribe();
  }

  unsubscribe() {
    this.subscription?.remove();
    this.subscription = null;
  }

  async isAvailable(): Promise<boolean> {
    // En web se mostrara no disponible
    if (Platform.OS === 'web') return false;
    // En móvil se vera si esta disponible
    return Accelerometer.isAvailableAsync();
  }
}

export const accelerometerService = new AccelerometerService();
