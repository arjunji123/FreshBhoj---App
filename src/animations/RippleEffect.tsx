import React, { ReactNode, useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type RippleRingProps = {
  delay: number;
  size: number;
  color: string;
  duration: number;
  maxScale: number;
};

type RippleEffectProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  ringCount?: number;
  ringSize?: number;
  ringColor?: string;
  duration?: number;
  delayStep?: number;
  maxScale?: number;
};

const RippleRing = ({
  delay,
  size,
  color,
  duration,
  maxScale,
}: RippleRingProps) => {
  const ringProgress = useSharedValue(0);

  useEffect(() => {
    ringProgress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration,
          easing: Easing.out(Easing.ease),
        }),
        -1,
        false
      )
    );
  }, [delay, duration, ringProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.8 * (1 - ringProgress.value),
    transform: [{ scale: 1 + ringProgress.value * maxScale }],
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

const RippleEffect = ({
  children,
  style,
  ringCount = 3,
  ringSize = 90,
  ringColor = 'rgba(255, 255, 255, 0.25)',
  duration = 3000,
  delayStep = 800,
  maxScale = 2.5,
}: RippleEffectProps) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: ringCount }).map((_, index) => (
        <RippleRing
          key={`ripple-${index}`}
          delay={index * delayStep}
          size={ringSize}
          color={ringColor}
          duration={duration}
          maxScale={maxScale}
        />
      ))}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    zIndex: 10,
  },
  ring: {
    position: 'absolute',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 15,
  },
});

export default RippleEffect;
