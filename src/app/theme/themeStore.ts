import { create } from 'zustand';
import { Appearance } from 'react-native';
import { mmkv } from '@utils/mmkvStorage';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedScheme = 'light' | 'dark';

const MODE_KEY = 'theme.mode';

/**
 * Raw MMKV (synchronous), not a Zustand `persist` store — `theme/index.ts`
 * needs to resolve the correct palette at *module-evaluation* time, before
 * anything else in the app has rendered, so it can't wait on Zustand's async
 * rehydration. This is the same "raw MMKV for a value that must be ready
 * before React exists" pattern already used by `onboardingStore.ts`.
 */
export function getPersistedMode(): ThemeMode {
  const raw = mmkv.getString(MODE_KEY);
  return raw === 'light' || raw === 'dark' ? raw : 'system';
}

function resolveScheme(mode: ThemeMode): ResolvedScheme {
  if (mode === 'system') return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  return mode;
}

interface ThemeState {
  mode: ThemeMode;
  resolvedScheme: ResolvedScheme;
  setMode: (mode: ThemeMode) => void;
}

/**
 * In-memory + reactive mirror of the persisted mode, for the Settings screen
 * to read/update immediately. The actual re-theming of already-mounted
 * screens happens via a full JS-bundle restart (see `applyThemeMode` in
 * `index.ts` and its caller in `Preferences.tsx`) — this store's job is only
 * to hold the *next* mode so the restart resolves to the right palette.
 */
export const useThemeStore = create<ThemeState>((set) => ({
  mode: getPersistedMode(),
  resolvedScheme: resolveScheme(getPersistedMode()),
  setMode: (mode) => {
    mmkv.set(MODE_KEY, mode);
    set({ mode, resolvedScheme: resolveScheme(mode) });
  },
}));

// Keep `resolvedScheme` correct if the OS scheme changes while `mode ===
// 'system'` and the user hasn't restarted — doesn't itself force a restart
// (that only happens on an explicit user choice in Preferences), just keeps
// the store truthful for the next time one happens.
Appearance.addChangeListener(() => {
  const { mode } = useThemeStore.getState();
  if (mode === 'system') {
    useThemeStore.setState({ resolvedScheme: resolveScheme(mode) });
  }
});
