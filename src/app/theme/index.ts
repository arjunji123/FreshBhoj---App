import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const theme = {
    colors,
    typography,
    spacing,
};

// Export types for use in styled components or helper functions
export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;

export * from './colors';
export * from './typography';
export * from './spacing';
