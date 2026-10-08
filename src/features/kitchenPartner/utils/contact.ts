import { Alert, Linking } from 'react-native';

/** Opens the phone dialer. Never throws — falls back to a plain alert when the device can't place calls. */
export function callPhone(phone: string): void {
  Linking.openURL(`tel:${phone}`).catch(() => {
    Alert.alert('Could not start the call', `Calling is not available on this device. The number is ${phone}.`);
  });
}
