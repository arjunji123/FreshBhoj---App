import React from 'react';
import { Text, TextProps } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import AppGradient from './AppGradient';

export interface GradientTextProps extends TextProps {
  colors?: string[];
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  children: React.ReactNode;
}

const GradientText: React.FC<GradientTextProps> = ({
  colors,
  direction = 'horizontal',
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
      <AppGradient colors={colors} direction={direction}>
        <Text style={[style, { opacity: 0 }]} {...rest}>
          {children}
        </Text>
      </AppGradient>
    </MaskedView>
  );
};

export default GradientText;
