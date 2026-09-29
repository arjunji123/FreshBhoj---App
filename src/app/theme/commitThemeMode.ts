import RNRestart from 'react-native-restart';
import { mmkv } from '@utils/mmkvStorage';
import { navigationRef } from '../navigation/navigationRef';
import { applyThemeMode } from './index';
import { useThemeStore, type ThemeMode } from './themeStore';

/** One-shot: written right before a theme-triggered restart, consumed and cleared on the very next boot by `AppNavigator`. */
export const PENDING_NAV_RESTORE_KEY = 'theme.pendingNavRestore';
/** Lets `MainApp` skip the full brand splash and play a much shorter one — this is a restart the user just asked for, not a fresh cold open. */
export const THEME_RESTART_FLAG_KEY = 'theme.isThemeTriggeredRestart';

/**
 * The one place that actually *commits* a theme-mode change: snapshots where
 * the user currently is (so they land back on the same screen, not booted to
 * Home), persists the preference, mutates the static `theme` singleton every
 * already-built screen reads, then restarts the whole JS bundle so those
 * screens' module-level `StyleSheet.create` calls re-evaluate against the new
 * palette. See the long comment in `theme/index.ts` for why a restart is
 * necessary here rather than a live re-render.
 */
export function commitThemeMode(mode: ThemeMode) {
  if (navigationRef.isReady()) {
    try {
      const state = navigationRef.getRootState();
      if (state) mmkv.set(PENDING_NAV_RESTORE_KEY, JSON.stringify(state));
    } catch {
      // Restoring the exact screen is a nicety, not a correctness requirement —
      // if serialization fails for any reason, just fall through to a normal
      // restart rather than blocking the theme change on it.
    }
  }
  mmkv.set(THEME_RESTART_FLAG_KEY, true);

  useThemeStore.getState().setMode(mode);
  const { resolvedScheme } = useThemeStore.getState();
  applyThemeMode(resolvedScheme);
  RNRestart.restart();
}
