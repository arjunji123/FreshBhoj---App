import React, { createContext, useContext, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg from 'react-native-svg';
import { SharedDefs } from './defs';

/**
 * Idle loops (bobbing, swaying, drifting, pulsing) are off app-wide: the
 * artwork stays still and only `pop` entrances play, once. Flip to true to
 * bring the looping motion back.
 */
const IDLE_MOTION = false;

/** Every illustration is authored on this square canvas. */
export const VIEW_BOX = '0 0 200 200';
const CANVAS = 200;

export type MotionKind =
  | 'static'
  | 'float' // gentle up/down bob
  | 'sway' // rotate back and forth around pivot
  | 'spin' // continuous rotation around pivot
  | 'twinkle' // opacity + scale pulse (sparkles)
  | 'rise' // drift upwards while fading (steam, hearts)
  | 'slide' // drift sideways while fading (speed lines)
  | 'pulse' // soft scale pulse around pivot
  | 'pop'; // one-shot spring-in around pivot

export interface IllustrationProps {
  size?: number;
  /** 'onBrand' tunes translucent shapes for use on the teal brand gradient. */
  tone?: 'default' | 'onBrand';
}

const SizeContext = createContext(CANVAS);

export const Scene = ({ size, children }: { size: number; children: React.ReactNode }) => (
  <SizeContext.Provider value={size}>
    <View
      style={{ width: size, height: size }}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {children}
    </View>
  </SizeContext.Provider>
);

interface LayerProps {
  motion?: MotionKind;
  /** Travel distance (canvas units) or rotation (deg) or scale delta (0.1 = 10%). */
  amp?: number;
  duration?: number;
  delay?: number;
  /** Rotation / scale origin in canvas units. Defaults to the canvas centre. */
  pivot?: readonly [number, number];
  children: React.ReactNode;
}

/** Resting value of the 0..1 clock when reduced-motion is on. */
const REST: Record<MotionKind, number> = {
  static: 0,
  float: 0.5,
  sway: 0.5,
  spin: 0,
  twinkle: 1,
  rise: 0.35,
  slide: 0.35,
  pulse: 0,
  pop: 1,
};

const REVERSING: MotionKind[] = ['float', 'sway', 'twinkle', 'pulse'];

/**
 * One animated slice of an illustration. Each layer is its own transparent
 * <Svg> stacked on the canvas, so motion is a plain native-view transform
 * (UI thread, no SVG re-render) and CPU stays negligible.
 */
export const Layer = ({
  motion = 'static',
  amp = 4,
  duration = 2400,
  delay = 0,
  pivot = [100, 100],
  children,
}: LayerProps) => {
  const size = useContext(SizeContext);
  const reducedMotion = useReducedMotion();
  // Looping motions rest on a still frame; `pop` always plays (once).
  const reduced = reducedMotion || (!IDLE_MOTION && motion !== 'pop');
  const k = size / CANVAS;
  const t = useSharedValue(reduced ? REST[motion] : 0);
  const px = (pivot[0] - CANVAS / 2) * k;
  const py = (pivot[1] - CANVAS / 2) * k;

  useEffect(() => {
    if (motion === 'static' || reduced) {
      return;
    }
    if (motion === 'pop') {
      t.value = withDelay(delay, withSpring(1, { damping: 9, stiffness: 130, mass: 0.8 }));
      return;
    }
    const reverse = REVERSING.includes(motion);
    const easing = reverse ? Easing.inOut(Easing.sin) : Easing.linear;
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing }), -1, reverse));
  }, [motion, duration, delay, reduced, t]);

  const style = useAnimatedStyle(() => {
    const v = t.value;
    switch (motion) {
      case 'float':
        return { transform: [{ translateY: (v * 2 - 1) * amp * k }] };
      case 'sway':
        return {
          transform: [
            { translateX: px },
            { translateY: py },
            { rotate: `${(v * 2 - 1) * amp}deg` },
            { translateX: -px },
            { translateY: -py },
          ],
        };
      case 'spin':
        return {
          transform: [
            { translateX: px },
            { translateY: py },
            { rotate: `${v * 360}deg` },
            { translateX: -px },
            { translateY: -py },
          ],
        };
      case 'twinkle':
        return {
          opacity: 0.25 + 0.75 * v,
          transform: [
            { translateX: px },
            { translateY: py },
            { scale: 0.75 + 0.35 * v },
            { translateX: -px },
            { translateY: -py },
          ],
        };
      case 'rise':
        return {
          opacity: v < 0.2 ? v * 4.5 : 0.9 * (1 - (v - 0.2) / 0.8),
          transform: [{ translateY: -v * amp * k }],
        };
      case 'slide':
        return {
          opacity: v < 0.2 ? v * 5 : 1 - (v - 0.2) / 0.8,
          transform: [{ translateX: -v * amp * k }],
        };
      case 'pulse':
        return {
          transform: [
            { translateX: px },
            { translateY: py },
            { scale: 1 + v * amp },
            { translateX: -px },
            { translateY: -py },
          ],
        };
      case 'pop':
        return {
          opacity: Math.min(1, v * 3),
          transform: [
            { translateX: px },
            { translateY: py },
            { scale: Math.max(0, v) },
            { translateX: -px },
            { translateY: -py },
          ],
        };
      default:
        return {};
    }
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <SharedDefs />
        {children}
      </Svg>
    </Animated.View>
  );
};
