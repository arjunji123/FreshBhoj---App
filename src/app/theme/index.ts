import { Appearance } from 'react-native';
import { colors as lightColors, elevation, Shadows } from './colors';
import { darkColors } from './darkColors';
import { textStyles, typography } from './typography';
import { layoutTokens, spacing } from './spacing';
import { getPersistedMode } from './themeStore';

/**
 * Most screens in this app build their `StyleSheet.create({...})` at module
 * scope (evaluated once, the moment the file is first imported) rather than
 * inside the component — so `theme.colors.x` values get "baked in" the first
 * time each screen's module loads and never re-read after that. Reactively
 * live-updating every already-built screen the instant the user flips
 * Appearance would mean converting all of them to a `useTheme()` hook, which
 * is its own separate, much larger undertaking.
 *
 * The approach here instead: resolve the correct palette synchronously at
 * *app boot* (so a cold launch into dark mode is correct everywhere, since
 * every module reads the already-resolved `theme.colors` when it first
 * loads), and when the user changes the preference at runtime, mutate this
 * same `colors` reference in place via `applyThemeMode()` and then fully
 * restart the JS bundle (see `Preferences.tsx`) so every module re-evaluates
 * its `StyleSheet.create` calls fresh against the new values. This keeps the
 * static `import { theme } from '@app/theme'` pattern working unchanged for
 * every screen already built, at the cost of a brief restart when the
 * *preference itself* changes (a rare, deliberate action) rather than a
 * silent live re-theme.
 */
function resolveInitialColors() {
    const mode = getPersistedMode();
    const scheme = mode === 'system' ? Appearance.getColorScheme() : mode;
    return scheme === 'dark' ? darkColors : lightColors;
}

export const theme = {
    colors: resolveInitialColors(),
    typography,
    text: textStyles,
    spacing,
    layout: layoutTokens,
    radius: spacing.borderRadius,
    elevation,
    Shadows,
};

/** Mutates `theme.colors` in place — call right before `RNRestart.restart()`, never expect a live re-render from this alone. */
export function applyThemeMode(scheme: 'light' | 'dark') {
    theme.colors = scheme === 'dark' ? darkColors : lightColors;
}

// Export types for use in styled components or helper functions
export type Theme = typeof theme;
export type Colors = typeof lightColors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Shadows = typeof Shadows;
export type Elevation = typeof elevation;

// `colors.ts` already re-exports every scale from `./palette`, so palette is not
// re-exported here — two `export *` sources for the same name is ambiguous.
export * from './colors';
export * from './typography';
export * from './spacing';
