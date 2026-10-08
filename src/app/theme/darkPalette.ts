/**
 * Dark-mode counterpart to `palette.ts`. Brand `primary`/`accent`/`amber` and
 * the regulated `foodType` indicators are intentionally UNCHANGED — the brand
 * teal and the veg/non-veg square must read identically in both modes. Only
 * the `neutral` ramp inverts (it drives every `text`/`surface`/`borders`
 * token in `colors.ts`), plus a handful of overlay/gradient values that
 * assumed a white page background.
 */
import { accent, amber, foodType, primary } from './palette';

export { primary, accent, amber, foodType };

/** Inverted cool-grey ramp — 900 is now the near-white "highest contrast" end, 0 is the page background. */
export const neutral = {
  0: '#091416', // page background (was white)
  50: '#0F1E21',
  100: '#152A2D',
  200: '#1F3A3D',
  300: '#2E4E52',
  400: '#4F6E73',
  500: '#7A9498',
  600: '#9DB2B5',
  700: '#C2D2D4',
  800: '#E3EBEC',
  900: '#F4F9F9', // near-white text (was near-black)
} as const;

export const semantic = {
  success: accent[600],
  successBg: 'rgba(15, 157, 107, 0.18)',
  warning: amber[500],
  warningBg: 'rgba(255, 194, 26, 0.16)',
  error: '#F87171',
  errorBg: 'rgba(220, 38, 38, 0.16)',
  info: '#6FB6FF',
  infoBg: 'rgba(30, 123, 216, 0.2)',
} as const;

/** Overlays/scrims re-tuned for a dark page — the light-mode `glass`/`primaryWash` values assumed a white surface underneath. */
export const overlay = {
  scrim: 'rgba(0, 0, 0, 0.65)',
  scrimSoft: 'rgba(0, 0, 0, 0.35)',
  imageFade: ['rgba(9,20,22,0)', 'rgba(9,20,22,0.88)'] as [string, string],
  glass: 'rgba(255, 255, 255, 0.08)',
  glassStrong: 'rgba(255, 255, 255, 0.16)',
  primaryWash: 'rgba(29, 185, 160, 0.14)',
  primaryBorder: 'rgba(29, 185, 160, 0.34)',
  accentWash: 'rgba(15, 157, 107, 0.16)',
} as const;

export const gradients = {
  brand: [primary[500], primary[600], primary[900]] as string[],
  brandLocations: [0.09, 0.77, 1] as [number, number, number],
  brandSoft: [primary[500], primary[600]] as string[],
  /** Was a light blush wash onto white — on dark, fades into the dark page instead. */
  blush: [primary[900], neutral[0]] as string[],
  accent: [accent[400], accent[600]] as string[],
  imageScrim: overlay.imageFade as unknown as string[],
} as const;
