import { useMemo } from 'react';
import { colors as lightColors } from './colors';
import { darkColors } from './darkColors';
import { theme as staticTheme } from './index';
import { useThemeStore } from './themeStore';

/**
 * Returns a `theme`-shaped object whose `colors` reactively tracks the
 * current Appearance preference — call this instead of importing the static
 * `theme` singleton from `./index` in any screen/component whose styling
 * depends on color (put `StyleSheet.create` calls that use `theme.colors`
 * inside the component, in a `useMemo(() => createStyles(theme), [theme])`,
 * not at module scope, or they'll never see updates). The static `theme`
 * import is still fine — and preferred — for genuinely mode-independent
 * values (`spacing`, `radius`, `typography`) that never change either way.
 */
export function useTheme() {
  const resolvedScheme = useThemeStore((s) => s.resolvedScheme);
  return useMemo(
    () => ({ ...staticTheme, colors: resolvedScheme === 'dark' ? darkColors : lightColors }),
    [resolvedScheme],
  );
}
