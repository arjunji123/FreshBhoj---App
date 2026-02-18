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

    // Text Colors
    textPrimary: '#F76C6C',
    textSecondary: '#D02123',
    textGradient1: "#FB0000",
    textGradient2: "#950000",

    // Grays
    gray1: '#777777',

    // Semantic
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
};

export const colors = {
    // Global
    // primary: palette.brandPrimary,
    // secondary: palette.brandSecondary,
    primary: palette.gradient1,
    secondary: palette.gradient2,
    background: palette.white,
    surface: palette.white,
    glass: palette.glass,

    // Gradient Colors
    gradient1: palette.gradient1,
    gradient2: palette.gradient2,
    gradient3: palette.gradient3,

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
};
