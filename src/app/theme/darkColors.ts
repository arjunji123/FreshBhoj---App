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

  gradient1: '#0E9A8E',
  gradient2: '#087F78',
  gradient3: '#0B4F6C',
  gradient4: '#152A2D',
  gradient5: '#4F6E73',
  gradient6: '#091416',
  gradient7: '#14ADA0',
  gradient8: '#0A5A66',

  textPrimary: '#34D1B8',
  textSecondary: '#6FD0C5',
  textGradient1: '#34D1B8',
  textGradient2: '#1DB9A0',

  gray1: '#9DB2B5',
  gray2: '#2E4E52',
  gray3: '#4F6E73',
  gray4: '#C2D2D4',

  inactive: '#2E4E52',
  success: '#34D399',
  warning: '#FFC21A',
  error: '#F87171',
  info: '#6FB6FF',
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
    primary: primary[600],
    primaryPressed: primary[500],
    primarySubtle: 'rgba(29, 185, 160, 0.18)',
    onPrimary: neutral[0],
    accent: accent[500],
    accentSubtle: 'rgba(15, 157, 107, 0.18)',
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
    focus: primary[400],
  },

  state: semantic,
  foodType,
  gradients,
  overlay,
};
