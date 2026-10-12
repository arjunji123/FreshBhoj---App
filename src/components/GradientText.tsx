import React from 'react';
import { Text, TextProps } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import AppGradient from './AppGradient';
import { theme } from '@app/theme/index';
import { useTheme } from '@app/theme/useTheme';
import { useThemeStore } from '@app/theme/themeStore';

export interface GradientTextProps extends TextProps {
  colors?: string[];
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  location?: number[];
  children: React.ReactNode;
}

const GradientText: React.FC<GradientTextProps> = ({
  colors,
  direction = 'horizontal',
  location = [0, 0.44, 1],
  style,
  children,
  ...rest
}) => {
  const isDark = useThemeStore((st) => st.resolvedScheme) === 'dark';
  const live = useTheme();
  // The brand gradient ends in deep navy, which vanishes as text on a dark page.
  const isBrandDefault = !colors || colors === theme.colors.defaultColor || colors === live.colors.defaultColor;
  const resolved = isBrandDefault
    ? isDark
      ? [live.colors.textGradient1, live.colors.textGradient2, live.colors.textGradient2]
      : theme.colors.defaultColor
    : colors;
  return (
    <MaskedView
      maskElement={
        <Text style={style} {...rest}>
          {children}
        </Text>
      }
    >
      <AppGradient colors={resolved} direction={direction} locations={location}>
        <Text style={[style, { opacity: 0 }]} {...rest}>
          {children}
        </Text>
      </AppGradient>
    </MaskedView>
  );
};

export default GradientText;
