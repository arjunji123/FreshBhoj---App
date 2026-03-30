import { colors, Shadows } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const theme = {
    colors,
    typography,
    spacing,
    Shadows,
};

// Export types for use in styled components or helper functions
export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Shadows = typeof Shadows;

export * from './colors';
export * from './typography';
export * from './spacing';
