import { useMemo } from 'react';
import { colors as lightColors } from './colors';
import { darkColors } from './darkColors';
import { theme as staticTheme } from './index';
import { useThemeStore } from './themeStore';

/**
 * For screens built from here on: returns a `theme`-shaped object whose
 * `colors` reactively tracks the CURRENT preference, live, no restart
 * needed — safe for a screen like Preferences itself that wants an instant
 * preview. Every screen built *before* this hook existed still reads the
 * static `theme` singleton from `./index` and only re-themes after the
 * restart triggered by `commitThemeMode()` below — this hook doesn't change
 * that, it only makes newly-written screens live-reactive to the choice
 * before the restart happens.
 */
export function useTheme() {
  const resolvedScheme = useThemeStore((s) => s.resolvedScheme);
  return useMemo(
    () => ({ ...staticTheme, colors: resolvedScheme === 'dark' ? darkColors : lightColors }),
    [resolvedScheme],
  );
}
