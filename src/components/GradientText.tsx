import React from 'react';
import { Text, TextProps } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import AppGradient from './AppGradient';
import {theme} from '@app/theme/index';

export interface GradientTextProps extends TextProps {
  colors?: string[];
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  location?: number[];
  children: React.ReactNode;
}

const GradientText: React.FC<GradientTextProps> = ({
  colors = theme.colors.defaultColor,
  direction = 'horizontal',
  location = [0, 0.44, 1],
  style,
  children,
  ...rest
}) => {
  return (
    <MaskedView
      maskElement={
        <Text style={style} {...rest}>
          {children}
        </Text>
      }
    >
      <AppGradient colors={colors} direction={direction} locations={location}>
        <Text style={[style, { opacity: 0 }]} {...rest}>
          {children}
        </Text>
      </AppGradient>
    </MaskedView>
  );
};

export default GradientText;
