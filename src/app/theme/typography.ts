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

export const typography = {
    fontFamilies,
    fontRoles,
    fontWeights,
    fontSizes,
    lineHeights,
};
