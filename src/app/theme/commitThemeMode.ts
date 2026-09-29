import { useThemeStore, type ThemeMode } from './themeStore';

/**
 * Changes the theme preference — that's it. Every screen in this app now
 * reads colors via `useTheme()` (a Zustand subscription), so updating this
 * store is enough to make every currently-mounted screen re-render with the
 * new palette immediately, no restart needed. See `app_dark_mode_architecture`
 * project memory for how this replaced an earlier restart-based approach.
 */
export function commitThemeMode(mode: ThemeMode) {
  useThemeStore.getState().setMode(mode);
}
