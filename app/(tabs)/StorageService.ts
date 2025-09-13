// StorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageService = {
  async save(key: string, value: any) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async load(key: string) {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  },
};
