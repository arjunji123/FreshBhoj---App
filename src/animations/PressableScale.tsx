import React, { useCallback } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { tap } from './haptics';
import { SPRING_PRESS, SPRING_RELEASE } from './motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Scale while held. 0.96 is a firm press, 0.985 a barely-there one. */
  scaleTo?: number;
  /** Fire a short tactile tick on press-in. Default on. */
  haptic?: boolean;
}

/**
 * Drop-in `Pressable` that springs down on touch and bounces back on release.
 * Runs on the UI thread (reanimated), so it stays smooth while JS is busy.
 */
const PressableScale: React.FC<PressableScaleProps> = ({
  style,
  scaleTo = 0.96,
  haptic = true,
  onPressIn,
  onPressOut,
  disabled,
  children,
  ...rest
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    (e) => {
      scale.value = withSpring(scaleTo, SPRING_PRESS);
      if (haptic && !disabled) tap();
      onPressIn?.(e);
    },
    [scale, scaleTo, haptic, disabled, onPressIn],
  );

  const handlePressOut = useCallback<NonNullable<PressableProps['onPressOut']>>(
    (e) => {
      scale.value = withSpring(1, SPRING_RELEASE);
      onPressOut?.(e);
    },
    [scale, onPressOut],
  );

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};

export default PressableScale;
