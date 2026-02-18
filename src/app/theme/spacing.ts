import { moderateScale } from 'react-native-size-matters';

const layout = {
    screenWidth: 0,
    screenHeight: 0,
    borderWidth: 1
};

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
    screenPadding: moderateScale(16),
    gutter: moderateScale(12),
    paddings: paddings,
    borderRadius: borderRadius,
    layout: layout,
};


