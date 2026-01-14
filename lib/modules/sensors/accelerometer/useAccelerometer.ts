import { useState, useEffect } from 'react';
import { SensorService, AccelerometerData } from './accelerometer.service';

export const useAccelerometer = () => {
  const [data, setData] = useState<AccelerometerData>({ x: 0, y: 0, z: 0 });
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let subscription: any;

    const initSensor = async () => {
      const available = await SensorService.isAvailable();
      setIsAvailable(available);

      if (available) {
        subscription = SensorService.subscribe(setData);
      }
    };

    initSensor();

    return () => {
      if (subscription) {
        SensorService.unsubscribe(subscription);
      }
    };
  }, []);

  return { data, isAvailable };
};