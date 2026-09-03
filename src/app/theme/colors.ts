import { accent, amber, foodType, gradients, neutral, overlay, primary, semantic } from './palette';

export { primary, accent, neutral, amber, foodType, semantic, overlay, gradients };

export const palette = {
    // Base colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    glass: 'rgba(255,255,255,0.2)',

    gradient1: '#FF6B6B',
    gradient2: '#BA2121',
    gradient3: '#670000',
    gradient4: '#F2F2F2',
    gradient5: '#818181',
    gradient6: '#FFFFFF',
    gradient7: '#FF4D4D',
    gradient8: '#913F3F',

    // Text Colors
    textPrimary: '#F76C6C',
    textSecondary: '#D02123',
    textGradient1: "#FB0000",
    textGradient2: "#950000",

    // Grays
    gray1: '#777777',
    gray2: '#DBDBDB',
    gray3: '#C2C2C2',
    gray4: '#656565',

    // Semantic
    inactive: '#D5AFAF',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
};

/**
 * Soft, layered elevation. Deliberately low-opacity and wide-radius so cards
 * lift off the page without a hard drop shadow.
 * `elevation` is the Android equivalent; both are set on every step.
 */
export const elevation = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    xs: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    sm: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    md: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
    },
    lg: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 28,
        elevation: 12,
    },
    /** For sticky bottom bars — the shadow points upward. */
    bar: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 16,
    },
    /** Brand-tinted glow under primary CTAs. */
    primary: {
        shadowColor: '#E2121D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 18,
        elevation: 8,
    },
} as const;

export const Shadows = {
    light: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 3,
    },
    medium: {
        shadowColor: 'rgba(0, 0, 0, 0.15)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 5,
    },
    heavy: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 8,
    },
};


export const colors = {
    // ── Colour scales (the design-system source of truth) ────────────────────
    // Indexed 50–900, e.g. `theme.colors.primary[600]`.
    primary,
    accent,
    neutral,
    amber,

    // Global
    background: palette.white,
    glass: palette.glass,
    defaultLocations : [0.09, 0.77, 1] as [number, number, number],

    // Gradient Colors
    gradient1: palette.gradient1,
    gradient2: palette.gradient2,
    gradient3: palette.gradient3,

    defaultColor: [palette.gradient1, palette.gradient2, palette.gradient3],

    // Text
    textGradient1: palette.textGradient1,
    textGradient2: palette.textGradient2,
    textGray1: palette.gray1,

    // UI Elements
    border: palette.gray1,
    backdrop: 'rgba(0, 0, 0, 0.5)',

    // Status
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,

    palette, // Expose palette for direct access if needed

    // ── Design-system token layer (use these in all new screens) ──────────────
    // The keys above are kept for the screens built before the design system
    // existed; everything new should reference the scales below.
    brand: {
        primary: primary[600],
        primaryPressed: primary[700],
        primarySubtle: primary[50],
        onPrimary: neutral[0],
        accent: accent[600],
        accentSubtle: accent[50],
        onAccent: neutral[0],
    },

    text: {
        primary: neutral[900],
        secondary: neutral[500],
        tertiary: neutral[400],
        inverse: neutral[0],
        brand: primary[600],
        accent: accent[700],
        danger: semantic.error,
        disabled: neutral[300],
    },

    surface: {
        base: neutral[0],
        /** Page background — a hair off pure white so cards read as raised. */
        page: neutral[50],
        subtle: neutral[100],
        raised: neutral[0],
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
        focus: primary[600],
    },

    state: semantic,
    foodType,
    gradients,
    overlay,
};
