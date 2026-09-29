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
 * The single source of truth for the live theme preference. Every screen
 * that calls `useTheme()` subscribes to `resolvedScheme` here directly (a
 * plain Zustand subscription, independent of React's parent→child render
 * cascade) — so calling `setMode` below re-renders every one of them
 * immediately, no restart or remount required.
 */
export const useThemeStore = create<ThemeState>((set) => ({
  mode: getPersistedMode(),
  resolvedScheme: resolveScheme(getPersistedMode()),
  setMode: (mode) => {
    mmkv.set(MODE_KEY, mode);
    set({ mode, resolvedScheme: resolveScheme(mode) });
  },
}));

// Keep `resolvedScheme` correct if the OS-level scheme changes while `mode
// === 'system'` — every subscribed screen picks this up live too, same as
// an explicit choice in Preferences.
Appearance.addChangeListener(() => {
  const { mode } = useThemeStore.getState();
  if (mode === 'system') {
    useThemeStore.setState({ resolvedScheme: resolveScheme(mode) });
  }
});
