import { Appearance } from 'react-native';
import { colors as lightColors, elevation, Shadows } from './colors';
import { darkColors } from './darkColors';
import { textStyles, typography } from './typography';
import { layoutTokens, spacing } from './spacing';
import { getPersistedMode } from './themeStore';

/**
 * Every customer-facing screen reads live-reactive colors via `useTheme()`
 * (`useTheme.ts`), which tracks `useThemeStore`'s `resolvedScheme` and
 * re-renders instantly on a change — no restart, no remount. This static
 * `theme` export still exists for two narrower cases: (1) the small number
 * of customer-side files that only ever needed *mode-independent* tokens
 * (`spacing`/`radius`/the brand gradient, which are identical in both
 * palettes) and import this under a `staticTheme` alias rather than calling
 * the hook, and (2) the kitchen-partner side of the app, which has its own,
 * separate scope this round didn't touch — those screens still resolve
 * whatever the palette was *at app boot* and won't live-update if the
 * customer flips Appearance mid-session (acceptable: kitchen-partner and
 * customer sessions are mutually exclusive per login, so this is never
 * visible to the same person at the same time in practice).
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
