import { Platform, Vibration } from 'react-native';

/**
 * Vibration needs `android.permission.VIBRATE` in the manifest, which only
 * exists in builds made after it was added. An older installed binary throws
 * a SecurityException on the native side (uncatchable from JS, crashes the
 * app), so ticks stay off until a build with the permission is installed.
 * Flip to true once every installed build has been rebuilt.
 */
const HAPTICS_ENABLED = false;

/** Tiny tactile tick. Android-only: iOS `Vibration` ignores duration (~400ms buzz). */
export const tap = (): void => {
  if (HAPTICS_ENABLED && Platform.OS === 'android') Vibration.vibrate(8);
};

export const success = (): void => {
  if (HAPTICS_ENABLED && Platform.OS === 'android') Vibration.vibrate([0, 10, 60, 14]);
};
