/**
 * FreshBhoj colour scales — the single source of truth for every colour in the app.
 *
 * The brand gradient (#FF6B6B → #BA2121 → #670000) already shipped in the logo,
 * splash and CTAs, so the primary ramp is built *around* those three values
 * rather than replacing them: 400 / 700 / 900 are the existing brand stops.
 *
 * Rule for every screen built after this file: reference a token here.
 * No new hex literals in feature code.
 */

/** Red / coral — brand primary. Logo, CTAs, active states, gradients. */
export const primary = {
  50: '#FFF5F5',
  100: '#FFE3E3',
  200: '#FFC9C9',
  300: '#FFA8A8',
  400: '#FF6B6B', // brand gradient stop 1
  500: '#F03E3E',
  600: '#E2121D', // primary CTA fill
  700: '#BA2121', // brand gradient stop 2
  800: '#8F1414',
  900: '#670000', // brand gradient stop 3
} as const;

/** Green — health, nutrition, "verified kitchen", success. Never a CTA colour. */
export const accent = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A', // verified badge, healthy tags
  700: '#15803D',
  800: '#166534',
  900: '#14532D',
} as const;

/** Cool grey ramp for text, borders and surfaces. */
export const neutral = {
  0: '#FFFFFF',
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
} as const;

/** Warm amber for offers, ratings and "bestseller" flags. */
export const amber = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  300: '#FCD34D',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
} as const;

/**
 * Indian food-app convention for the veg/non-veg square indicator.
 * These are regulated visual signals — do not restyle them per screen.
 */
export const foodType = {
  VEG: '#0F8A3D',
  VEGAN: '#16A34A',
  EGG: '#F59E0B',
  NON_VEG: '#C0392B',
} as const;

/** Semantic states. */
export const semantic = {
  success: accent[600],
  successBg: accent[50],
  warning: amber[500],
  warningBg: amber[50],
  error: '#DC2626',
  errorBg: '#FEF2F2',
  info: '#2563EB',
  infoBg: '#EFF6FF',
} as const;

/** Overlays and scrims, mostly for image treatments. */
export const overlay = {
  scrim: 'rgba(15, 23, 42, 0.55)',
  scrimSoft: 'rgba(15, 23, 42, 0.28)',
  /** Bottom-up fade that keeps text legible over a food photo. */
  imageFade: ['rgba(15,23,42,0)', 'rgba(15,23,42,0.75)'] as [string, string],
  glass: 'rgba(255, 255, 255, 0.2)',
  glassStrong: 'rgba(255, 255, 255, 0.35)',
  primaryWash: 'rgba(226, 18, 29, 0.06)',
  primaryBorder: 'rgba(226, 18, 29, 0.2)',
  accentWash: 'rgba(22, 163, 74, 0.08)',
} as const;

/** Named gradients. Every gradient in the app comes from here. */
export const gradients = {
  /** The brand gradient — splash, headers, primary CTAs. */
  brand: [primary[400], primary[700], primary[900]] as string[],
  brandLocations: [0.09, 0.77, 1] as [number, number, number],
  /** Flatter two-stop version for small surfaces (chips, pills, icons). */
  brandSoft: [primary[400], primary[600]] as string[],
  /** Tinted background wash for hero/highlight sections. */
  blush: [primary[50], neutral[0]] as string[],
  accent: [accent[400], accent[600]] as string[],
  /** Dark fade for text over photography. */
  imageScrim: overlay.imageFade as unknown as string[],
} as const;
