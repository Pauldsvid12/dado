import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

type StorageLike = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
};

export const storageAdapter: StorageLike = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return AsyncStorage.getItem(key);
  },

  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  },

  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};