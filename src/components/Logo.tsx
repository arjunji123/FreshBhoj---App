import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { theme as staticTheme } from '@app/theme/index';
import GradientText from './GradientText';

export type LogoSize = 'sm' | 'md' | 'lg';
export type LogoVariant = 'gradient' | 'solid' | 'inverse';

interface LogoProps {
  size?: LogoSize;
  /** `gradient` (brand red, for light backgrounds) is the default; `inverse`
   * is plain white for use over the brand-red header/gradient surfaces. */
  variant?: LogoVariant;
  style?: StyleProp<TextStyle>;
}

const SIZES: Record<LogoSize, number> = {
  sm: staticTheme.typography.fontSizes.xxl,
  md: staticTheme.typography.fontSizes.display2,
  lg: staticTheme.typography.fontSizes.display3,
};

/** The FreshBhoj wordmark — the same medievalSharp treatment used on the
 * splash and login screens, reused wherever the brand mark belongs post-login. */
const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'gradient', style }) => {
  const textStyle: TextStyle = {
    fontFamily: staticTheme.typography.fontFamilies.medievalSharp,
    fontSize: SIZES[size],
  };

  if (variant === 'gradient') {
    return (
      <GradientText
        colors={staticTheme.colors.gradients.brand}
        direction="diagonal"
        style={[textStyle, style]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
        maxFontSizeMultiplier={1}
      >
        FreshBhoj
      </GradientText>
    );
  }

  return (
    <Text
      style={[
        textStyle,
        { color: variant === 'inverse' ? staticTheme.colors.palette.white : staticTheme.colors.primary[600] },
        style,
      ]}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.5}
      maxFontSizeMultiplier={1}
    >
      FreshBhoj
    </Text>
  );
};

export default Logo;
