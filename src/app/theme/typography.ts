export const fontFamilies = {
    medievalSharp: 'MedievalSharp',
    aBeeZee: {
        regular: 'ABeeZee-Regular',
        italic: 'ABeeZee-Italic',
    },
    plusJakartaSans: {
        regular: 'PlusJakartaSans-Regular',
        medium: 'PlusJakartaSans-Medium',
        mediumItalic: 'PlusJakartaSans-MediumItalic',
        semibold: 'PlusJakartaSans-SemiBold',
        semiboldItalic: 'PlusJakartaSans-SemiBoldItalic',
        bold: 'PlusJakartaSans-Bold',
        boldItalic: 'PlusJakartaSans-BoldItalic',
        extrabold: 'PlusJakartaSans-ExtraBold',
        extraBoldItalic: 'PlusJakartaSans-ExtraBoldItalic',
        italic: 'PlusJakartaSans-Italic',
        light: 'PlusJakartaSans-Light',
        extraLight: 'PlusJakartaSans-ExtraLight',
        extraLightItalic: 'PlusJakartaSans-ExtraLightItalic',
        lightItalic: 'PlusJakartaSans-LightItalic',
    },
};

export const fontWeights = {
    thin: '100',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
} as const;

export const fontSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    display1: 24,
    display2: 32,
    display3: 40,
    display4: 48,
    display5: 56,
    display6: 64,
    display7: 72,
    display8: 80,
    display9: 88,
    display10: 96,
};

export const lineHeights = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
    display1: 36,
    display2: 44,
    display3: 52,
};

export const fontRoles = {
    appName: fontFamilies.medievalSharp,
    heading: fontFamilies.aBeeZee.regular,
    headingItalic: fontFamilies.aBeeZee.italic,
    body: fontFamilies.plusJakartaSans.regular,
    bodyMedium: fontFamilies.plusJakartaSans.medium,
    bodySemibold: fontFamilies.plusJakartaSans.semibold,
    bodyBold: fontFamilies.plusJakartaSans.bold,
} as const;


/**
 * Composed text styles — the vocabulary every screen should speak.
 *
 * Headlines use Plus Jakarta Sans Bold/ExtraBold with negative tracking for the
 * tight, confident look of a 2025 consumer app; body copy uses the Regular and
 * Medium weights of the same family so the whole app reads as one voice.
 * (Plus Jakarta Sans is already bundled in assets/fonts — no new font files.)
 */
export const textStyles = {
    // ── Display: splash, success moments, big numbers ──────────────────────
    displayLarge: {
        fontFamily: fontFamilies.plusJakartaSans.extrabold,
        fontSize: 40,
        lineHeight: 46,
        letterSpacing: -1,
    },
    displayMedium: {
        fontFamily: fontFamilies.plusJakartaSans.extrabold,
        fontSize: 32,
        lineHeight: 38,
        letterSpacing: -0.8,
    },
    displaySmall: {
        fontFamily: fontFamilies.plusJakartaSans.bold,
        fontSize: 28,
        lineHeight: 34,
        letterSpacing: -0.6,
    },

    // ── Headings: screen titles and section headers ────────────────────────
    h1: {
        fontFamily: fontFamilies.plusJakartaSans.bold,
        fontSize: 24,
        lineHeight: 30,
        letterSpacing: -0.5,
    },
    h2: {
        fontFamily: fontFamilies.plusJakartaSans.bold,
        fontSize: 20,
        lineHeight: 26,
        letterSpacing: -0.4,
    },
    h3: {
        fontFamily: fontFamilies.plusJakartaSans.semibold,
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: -0.2,
    },
    h4: {
        fontFamily: fontFamilies.plusJakartaSans.semibold,
        fontSize: 16,
        lineHeight: 22,
        letterSpacing: -0.1,
    },

    // ── Body ───────────────────────────────────────────────────────────────
    bodyLarge: {
        fontFamily: fontFamilies.plusJakartaSans.regular,
        fontSize: 16,
        lineHeight: 24,
    },
    body: {
        fontFamily: fontFamilies.plusJakartaSans.regular,
        fontSize: 14,
        lineHeight: 21,
    },
    bodyMedium: {
        fontFamily: fontFamilies.plusJakartaSans.medium,
        fontSize: 14,
        lineHeight: 21,
    },
    bodySmall: {
        fontFamily: fontFamilies.plusJakartaSans.regular,
        fontSize: 12,
        lineHeight: 18,
    },

    // ── Supporting ─────────────────────────────────────────────────────────
    label: {
        fontFamily: fontFamilies.plusJakartaSans.semibold,
        fontSize: 13,
        lineHeight: 18,
    },
    caption: {
        fontFamily: fontFamilies.plusJakartaSans.medium,
        fontSize: 12,
        lineHeight: 16,
    },
    /** ALL-CAPS micro-label above a value ("DELIVERY ADDRESS", "TOTAL"). */
    overline: {
        fontFamily: fontFamilies.plusJakartaSans.bold,
        fontSize: 11,
        lineHeight: 14,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
    },
    button: {
        fontFamily: fontFamilies.plusJakartaSans.bold,
        fontSize: 16,
        lineHeight: 22,
        letterSpacing: 0.1,
    },
    buttonSmall: {
        fontFamily: fontFamilies.plusJakartaSans.bold,
        fontSize: 14,
        lineHeight: 20,
    },
    /** Prices and macro numbers — tabular so columns line up. */
    numeric: {
        fontFamily: fontFamilies.plusJakartaSans.bold,
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: -0.3,
    },
} as const;

export type TextStyleName = keyof typeof textStyles;

export const typography = {
    textStyles,
    fontFamilies,
    fontRoles,
    fontWeights,
    fontSizes,
    lineHeights,
};
