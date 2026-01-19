import { useState, useEffect } from 'react';
import { accelerometerService } from './accelerometer.service';
import type { AccelerometerData, UseAccelerometerReturn } from './types';

const INITIAL_DATA: AccelerometerData = {
  x: 0,
  y: 0,
  z: 0,
  timestamp: 0,
};

export const useAccelerometer = (): UseAccelerometerReturn => {
  const [data, setData] = useState<AccelerometerData>(INITIAL_DATA);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Verificar disponibilidad
    accelerometerService.isAvailable().then((available) => {
      if (mounted) {
        setIsAvailable(available);
        if (!available) {
          console.warn('⚠️ Acelerómetro no disponible');
        }
      }
    });

    // Suscribirse a los datos
    const unsubscribe = accelerometerService.subscribe((newData) => {
      if (mounted) {
        setData(newData);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { data, isAvailable };
};
