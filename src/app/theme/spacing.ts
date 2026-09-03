import { moderateScale } from 'react-native-size-matters';

const layout = {
    screenWidth: 0,
    screenHeight: 0,
    borderWidth: 1
};

/**
 * Radius scale. The app leans large — 16px is the default for a card, 24px for
 * a hero surface — which is what gives the soft, modern feel.
 */
const borderRadius = {
    none: 0,
    xs: moderateScale(2),
    sm: moderateScale(4),
    md: moderateScale(8),
    lg: moderateScale(12),
    xl: moderateScale(16),
    xxl: moderateScale(24),
    xxxl: moderateScale(32),
    round: moderateScale(9999),

    // ── Named aliases used by the component library ────────────────────────
    /** Inputs, chips, small buttons. */
    control: moderateScale(14),
    /** Standard content card. */
    card: moderateScale(20),
    /** Large CTA buttons. */
    button: moderateScale(18),
    /** Bottom sheets and the curved bottom of the app header. */
    sheet: moderateScale(28),
    /** Fully rounded pill. */
    pill: moderateScale(9999),
};

const paddings = {
    none: 0,
    xxs: moderateScale(2),
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(24),
    xxl: moderateScale(32),
    xxxl: moderateScale(48),
    screenPadding: moderateScale(16),
    gutter: moderateScale(12),
};

/** Layout constants shared across screens. */
export const layoutTokens = {
    /** Horizontal gutter every screen uses. */
    screenPadding: moderateScale(20),
    /** Gap between cards in a grid. */
    gridGap: moderateScale(16),
    /** Height of the sticky bottom action bar (before safe-area inset). */
    stickyBarHeight: moderateScale(76),
    /** Height of the bottom tab bar (before safe-area inset). */
    tabBarHeight: moderateScale(64),
    /** Standard tap-target minimum. */
    hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
};

export const spacing = {
    none: 0,
    xxs: moderateScale(2),
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(24),
    xxl: moderateScale(32),
    xxxl: moderateScale(48),
    huge: moderateScale(60),
    giants: moderateScale(70),
    giant: moderateScale(100),
    screenPadding: moderateScale(16),
    gutter: moderateScale(12),
    paddings: paddings,
    borderRadius: borderRadius,
    layout: layout,
    tokens: layoutTokens,
};


