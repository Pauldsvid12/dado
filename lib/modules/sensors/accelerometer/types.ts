export interface AccelerometerData {
    x: number;
    y: number;
    z: number;
    timestamp: number;
  }
  
  export interface UseAccelerometerReturn {
    data: AccelerometerData;
    isAvailable: boolean;
  }
  