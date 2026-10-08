/**
 * FreshBhoj colour scales — the single source of truth for every colour in the app.
 *
 * Brand: an aqua → teal → deep-ocean gradient (#1DB9A0 → #087F78 → #0B4F6C),
 * shared with the website. `primary[600]` (#087F78) is the CTA fill — it keeps
 * white text at WCAG AA. Marigold (`amber`) is the single warm accent.
 *
 * Rule for every screen built after this file: reference a token here.
 * No new hex literals in feature code.
 */

/** Teal — brand primary. Logo, CTAs, active states, gradients. */
export const primary = {
  50: '#EFFAF8',
  100: '#D3F1EE',
  200: '#A7E3DC',
  300: '#6FD0C5',
  400: '#1DB9A0', // brand gradient stop 1
  500: '#0E9A8E',
  600: '#087F78', // primary CTA fill (white text passes AA)
  700: '#076B6A',
  800: '#0A5A66',
  900: '#0B4F6C', // brand gradient stop 3
} as const;

/** Emerald — health, nutrition, "verified kitchen", success. Never a CTA colour. */
export const accent = {
  50: '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981',
  600: '#0F9D6B', // verified badge, healthy tags
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
} as const;

/** Teal-tinted ink ramp for text, borders and surfaces. */
export const neutral = {
  0: '#FFFFFF',
  50: '#F3F8F8',
  100: '#E9F1F1',
  200: '#DCE6E7',
  300: '#C3D1D3',
  400: '#8FA2A6',
  500: '#5F7377',
  600: '#47595D',
  700: '#2F4146',
  800: '#1C2D31',
  900: '#0D1B1E',
} as const;

/** Marigold for offers, ratings and "bestseller" flags. */
export const amber = {
  50: '#FFF8E1',
  100: '#FFEFB3',
  300: '#FFD866',
  500: '#FFC21A', // marigold accent
  600: '#E6A700',
  700: '#8A5E00',
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
  info: '#1E7BD8',
  infoBg: '#EAF3FD',
} as const;

/** Overlays and scrims, mostly for image treatments. */
export const overlay = {
  scrim: 'rgba(13, 27, 30, 0.55)',
  scrimSoft: 'rgba(13, 27, 30, 0.28)',
  /** Bottom-up fade that keeps text legible over a food photo. */
  imageFade: ['rgba(13,27,30,0)', 'rgba(13,27,30,0.78)'] as [string, string],
  glass: 'rgba(255, 255, 255, 0.2)',
  glassStrong: 'rgba(255, 255, 255, 0.35)',
  primaryWash: 'rgba(8, 127, 120, 0.07)',
  primaryBorder: 'rgba(8, 127, 120, 0.22)',
  accentWash: 'rgba(15, 157, 107, 0.09)',
} as const;

/** Named gradients. Every gradient in the app comes from here. */
export const gradients = {
  /** The brand gradient — splash, headers, primary CTAs. */
  brand: [primary[500], primary[600], primary[900]] as string[],
  brandLocations: [0.09, 0.77, 1] as [number, number, number],
  /** Flatter two-stop version for small surfaces (chips, pills, icons). */
  brandSoft: [primary[500], primary[600]] as string[],
  /** Tinted background wash for hero/highlight sections. */
  blush: [primary[50], neutral[0]] as string[],
  accent: [accent[400], accent[600]] as string[],
  /** Dark fade for text over photography. */
  imageScrim: overlay.imageFade as unknown as string[],
} as const;
