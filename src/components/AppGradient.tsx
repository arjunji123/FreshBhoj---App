import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import LinearGradient, { LinearGradientProps } from 'react-native-linear-gradient';
import { colors } from '@app/theme/index';

type GradientDirection = 'vertical' | 'horizontal' | 'diagonal';

interface AppGradientProps extends Omit<LinearGradientProps, 'colors'> {
  colors?: string[];
  direction?: GradientDirection;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Default Colors of the gradient (can be overriden by props)
const DEFAULT_COLORS = [colors.gradient1, colors.gradient2, colors.gradient3];

const AppGradient: React.FC<AppGradientProps> = ({ children, style, colors = DEFAULT_COLORS, direction = 'diagonal', ...props }) => {

  // Handlers
  const getCoordinates = (dir: GradientDirection): { start: { x: number; y: number }; end: { x: number; y: number } } => {
    switch (dir) {
      case 'horizontal':
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };
      case 'diagonal':
        return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
      case 'vertical':
      default:
        return { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
    }
  };

  const { start, end } = getCoordinates(direction);

  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={style}
      {...props}
    >
      {children}
    </LinearGradient>
  );
};

export default AppGradient;