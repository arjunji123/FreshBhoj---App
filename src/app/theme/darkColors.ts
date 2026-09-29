/**
 * Dark-mode counterpart to `colors.ts`'s `colors` export — same shape, same
 * keys, so every existing `theme.colors.x.y` access site works unchanged
 * regardless of which mode is active. Only the derived `text`/`surface`/
 * `borders` tokens (built from the neutral ramp) actually differ in
 * substance; `brand`/`state`/`foodType` intentionally read the same in both.
 */
import { accent, amber, foodType, gradients, neutral, overlay, primary, semantic } from './darkPalette';

export const darkPalette = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  glass: 'rgba(255,255,255,0.08)',

  gradient1: '#FF6B6B',
  gradient2: '#BA2121',
  gradient3: '#670000',
  gradient4: '#1B2333',
  gradient5: '#5B6478',
  gradient6: '#0B0F19',
  gradient7: '#FF4D4D',
  gradient8: '#913F3F',

  textPrimary: '#F76C6C',
  textSecondary: '#FF8A8A',
  textGradient1: '#FB0000',
  textGradient2: '#FF6666',

  gray1: '#9CA6B8',
  gray2: '#3D4759',
  gray3: '#5B6478',
  gray4: '#C3CAD8',

  inactive: '#5B3F3F',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F87171',
  info: '#60A5FA',
};

export const darkColors = {
  primary,
  accent,
  neutral,
  amber,

  background: neutral[0],
  glass: darkPalette.glass,
  defaultLocations: [0.09, 0.77, 1] as [number, number, number],

  gradient1: darkPalette.gradient1,
  gradient2: darkPalette.gradient2,
  gradient3: darkPalette.gradient3,

  defaultColor: [darkPalette.gradient1, darkPalette.gradient2, darkPalette.gradient3],

  textGradient1: darkPalette.textGradient1,
  textGradient2: darkPalette.textGradient2,
  textGray1: darkPalette.gray1,

  border: darkPalette.gray1,
  backdrop: 'rgba(0, 0, 0, 0.7)',

  success: darkPalette.success,
  warning: darkPalette.warning,
  error: darkPalette.error,
  info: darkPalette.info,

  palette: darkPalette,

  brand: {
    primary: primary[500],
    primaryPressed: primary[400],
    primarySubtle: 'rgba(226, 18, 29, 0.16)',
    onPrimary: neutral[0],
    accent: accent[500],
    accentSubtle: 'rgba(22, 163, 74, 0.16)',
    onAccent: neutral[0],
  },

  text: {
    primary: neutral[900],
    secondary: neutral[600],
    tertiary: neutral[500],
    inverse: neutral[0],
    brand: primary[400],
    accent: accent[400],
    danger: semantic.error,
    disabled: neutral[400],
  },

  surface: {
    base: neutral[50],
    /** Page background — near-black throughout the app in dark mode. */
    page: neutral[0],
    subtle: neutral[100],
    raised: neutral[100],
    inverse: neutral[900],
    overlay: overlay.scrim,
    brandWash: overlay.primaryWash,
    accentWash: overlay.accentWash,
  },

  borders: {
    subtle: neutral[200],
    default: neutral[300],
    strong: neutral[400],
    brand: overlay.primaryBorder,
    focus: primary[500],
  },

  state: semantic,
  foodType,
  gradients,
  overlay,
};
