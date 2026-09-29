import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { theme as staticTheme } from '@app/theme/index';
import { useTheme } from '@app/theme/useTheme';
import AppGradient from '@components/AppGradient';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretches to the container width. Default true — most CTAs are full-width. */
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

const SIZES: Record<ButtonSize, { height: number; paddingHorizontal: number; radius: number }> = {
  sm: { height: 38, paddingHorizontal: staticTheme.spacing.md, radius: staticTheme.radius.control },
  md: { height: 48, paddingHorizontal: staticTheme.spacing.lg, radius: staticTheme.radius.control },
  lg: { height: 56, paddingHorizontal: staticTheme.spacing.xl, radius: staticTheme.radius.button },
};

/**
 * The app's button. `primary` renders the brand gradient with a tinted glow;
 * every other variant is a flat fill so only one thing on screen shouts.
 * Press state is a scale-down plus opacity, applied through Pressable.
 */
const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  testID,
}) => {
  const theme = useTheme();
  const contentColor = useMemo(() => createContentColor(theme), [theme]);
  const variantStyles = useMemo(() => createVariantStyles(theme), [theme]);
  const isDisabled = disabled || loading;
  const dimensions = SIZES[size];
  const textVariant = size === 'sm' ? staticTheme.text.buttonSmall : staticTheme.text.button;

  const label = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator size="small" color={contentColor[variant]} />
      ) : (
        <>
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <Text
            style={[textVariant, { color: contentColor[variant] }, textStyle]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </>
      )}
    </View>
  );

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          height: dimensions.height,
          paddingHorizontal: dimensions.paddingHorizontal,
          borderRadius: dimensions.radius,
        },
        fullWidth ? styles.fullWidth : styles.autoWidth,
        variantStyles[variant],
        variant === 'primary' && !isDisabled ? staticTheme.elevation.primary : null,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {variant === 'primary' ? (
        <AppGradient
          colors={theme.colors.gradients.brand}
          locations={theme.colors.gradients.brandLocations}
          direction="diagonal"
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      {label}
    </Pressable>
  );
};

const createContentColor = (theme: ReturnType<typeof useTheme>): Record<ButtonVariant, string> => ({
  primary: theme.colors.text.inverse,
  secondary: theme.colors.text.brand,
  ghost: theme.colors.text.brand,
  outline: theme.colors.text.primary,
  danger: theme.colors.text.inverse,
});

const createVariantStyles = (theme: ReturnType<typeof useTheme>): Record<ButtonVariant, ViewStyle> => ({
  primary: {},
  secondary: { backgroundColor: theme.colors.surface.brandWash },
  ghost: { backgroundColor: 'transparent' },
  outline: {
    backgroundColor: theme.colors.surface.base,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
  },
  danger: { backgroundColor: theme.colors.state.error },
});

export default Button;

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullWidth: { alignSelf: 'stretch' },
  // `center`, not `flex-start` — a non-fullWidth button almost always sits in a
  // centered container (EmptyState, dialogs), and flex-start was dragging it
  // to the left edge there.
  autoWidth: { alignSelf: 'center' },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: { marginRight: staticTheme.spacing.sm },
  iconRight: { marginLeft: staticTheme.spacing.sm },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
