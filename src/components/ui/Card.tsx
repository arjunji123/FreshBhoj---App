import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '@app/theme/index';

type Elevation = 'none' | 'xs' | 'sm' | 'md' | 'lg';
type Padding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  elevation?: Elevation;
  padding?: Padding;
  /** Adds a hairline border. Use on flat cards that sit on a white page. */
  bordered?: boolean;
  radius?: number;
  backgroundColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const PADDING: Record<Padding, number> = {
  none: 0,
  sm: theme.spacing.md,
  md: theme.spacing.lg,
  lg: theme.spacing.xl,
};

/** The base surface for everything: rounded, soft-shadowed, generously padded. */
const Card: React.FC<CardProps> = ({
  children,
  elevation = 'sm',
  padding = 'md',
  bordered = false,
  radius = theme.radius.card,
  backgroundColor = theme.colors.surface.raised,
  onPress,
  style,
  testID,
}) => {
  const cardStyle: StyleProp<ViewStyle> = [
    styles.base,
    theme.elevation[elevation],
    {
      padding: PADDING[padding],
      borderRadius: radius,
      backgroundColor,
    },
    bordered ? styles.bordered : null,
    style,
  ];

  if (!onPress) {
    return (
      <View testID={testID} style={cardStyle}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed ? styles.pressed : null]}
    >
      {children}
    </Pressable>
  );
};

export default Card;

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  bordered: {
    borderWidth: 1,
    borderColor: theme.colors.borders.subtle,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
