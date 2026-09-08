import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Allow location access',
      message: 'FreshBhoj uses your location to set your delivery address accurately.',
      buttonPositive: 'Allow',
      buttonNegative: 'Not now',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export interface DeviceCoordinates {
  latitude: number;
  longitude: number;
}

/** Rejects with a plain Error carrying a user-facing message on failure. */
export function getCurrentPosition(): Promise<DeviceCoordinates> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      },
      () => reject(new Error('Could not fetch your current location. Please try again.')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
}
