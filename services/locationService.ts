import * as Location from 'expo-location';
import { Linking } from 'react-native';
export interface Coordinates { latitude: number; longitude: number }
export async function getCurrentCoordinates(): Promise<Coordinates> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') throw new Error('Izinkan akses lokasi untuk mengirim koordinat GPS.');
  const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { latitude: location.coords.latitude, longitude: location.coords.longitude };
}
export async function openCoordinates(coordinates: Coordinates) {
  await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`);
}
