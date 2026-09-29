/**
 * Dark-mode counterpart to `palette.ts`. Brand `primary`/`accent`/`amber` and
 * the regulated `foodType` indicators are intentionally UNCHANGED — the brand
 * red and the veg/non-veg square must read identically in both modes. Only
 * the `neutral` ramp inverts (it drives every `text`/`surface`/`borders`
 * token in `colors.ts`), plus a handful of overlay/gradient values that
 * assumed a white page background.
 */
import { accent, amber, foodType, primary } from './palette';

export { primary, accent, amber, foodType };

/** Inverted cool-grey ramp — 900 is now the near-white "highest contrast" end, 0 is the page background. */
export const neutral = {
  0: '#0B0F19', // page background (was white)
  50: '#111827',
  100: '#1B2333',
  200: '#2A3347',
  300: '#3D4759',
  400: '#5B6478',
  500: '#7C8598',
  600: '#9CA6B8',
  700: '#C3CAD8',
  800: '#E4E8EF',
  900: '#F8FAFC', // near-white text (was near-black)
} as const;

export const semantic = {
  success: accent[600],
  successBg: 'rgba(22, 163, 74, 0.16)',
  warning: amber[500],
  warningBg: 'rgba(245, 158, 11, 0.16)',
  error: '#F87171',
  errorBg: 'rgba(220, 38, 38, 0.16)',
  info: '#60A5FA',
  infoBg: 'rgba(37, 99, 235, 0.16)',
} as const;

/** Overlays/scrims re-tuned for a dark page — the light-mode `glass`/`primaryWash` values assumed a white surface underneath. */
export const overlay = {
  scrim: 'rgba(0, 0, 0, 0.65)',
  scrimSoft: 'rgba(0, 0, 0, 0.35)',
  imageFade: ['rgba(11,15,25,0)', 'rgba(11,15,25,0.85)'] as [string, string],
  glass: 'rgba(255, 255, 255, 0.08)',
  glassStrong: 'rgba(255, 255, 255, 0.16)',
  primaryWash: 'rgba(226, 18, 29, 0.14)',
  primaryBorder: 'rgba(226, 18, 29, 0.32)',
  accentWash: 'rgba(22, 163, 74, 0.14)',
} as const;

export const gradients = {
  brand: [primary[400], primary[700], primary[900]] as string[],
  brandLocations: [0.09, 0.77, 1] as [number, number, number],
  brandSoft: [primary[400], primary[600]] as string[],
  /** Was a light blush wash onto white — on dark, fades into the dark page instead. */
  blush: [primary[900], neutral[0]] as string[],
  accent: [accent[400], accent[600]] as string[],
  imageScrim: overlay.imageFade as unknown as string[],
} as const;
