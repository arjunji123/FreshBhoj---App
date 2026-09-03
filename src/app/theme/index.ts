import { colors, elevation, Shadows } from './colors';
import { textStyles, typography } from './typography';
import { layoutTokens, spacing } from './spacing';

export const theme = {
    colors,
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
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Shadows = typeof Shadows;
export type Elevation = typeof elevation;

// `colors.ts` already re-exports every scale from `./palette`, so palette is not
// re-exported here — two `export *` sources for the same name is ambiguous.
export * from './colors';
export * from './typography';
export * from './spacing';
