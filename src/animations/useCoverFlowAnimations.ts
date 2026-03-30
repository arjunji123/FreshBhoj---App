import {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';

interface CoverFlowConfig {
  scrollX: SharedValue<number>;
  index: number;
  itemSize: number;
  scale?: [number, number, number, number, number];
  overlayOpacity?: [number, number, number, number, number];
  ringOpacity?: [number, number, number, number, number];
  shadowMultiplier?: number;
  labelBgColors?: [string, string, string];
  labelTextColors?: [string, string, string];
}

const DEFAULTS = {
  scale: [0.65, 0.75, 1, 0.75, 0.65] as [number, number, number, number, number],
  overlayOpacity: [0.55, 0.4, 0, 0.4, 0.55] as [number, number, number, number, number],
  ringOpacity: [0, 0, 1, 0, 0] as [number, number, number, number, number],
  shadowMultiplier: 1,
  labelBgColors: ['rgba(208, 33, 35, 0)', '#D02123', 'rgba(208, 33, 35, 0)'] as [string, string, string],
  labelTextColors: ['#777777', '#FFFFFF', '#777777'] as [string, string, string],
};

export const useCoverFlowAnimations = (config: CoverFlowConfig) => {
  const {
    scrollX,
    index,
    itemSize,
    scale = DEFAULTS.scale,
    overlayOpacity = DEFAULTS.overlayOpacity,
    ringOpacity = DEFAULTS.ringOpacity,
    shadowMultiplier = DEFAULTS.shadowMultiplier,
    labelBgColors = DEFAULTS.labelBgColors,
    labelTextColors = DEFAULTS.labelTextColors,
  } = config;

  const inputRange = [
    (index - 2) * itemSize,
    (index - 1) * itemSize,
    index * itemSize,
    (index + 1) * itemSize,
    (index + 2) * itemSize,
  ];

  const animatedScale = useAnimatedStyle(() => {
    const s = interpolate(scrollX.value, inputRange, scale, Extrapolation.CLAMP);
    return { transform: [{ scale: s }] };
  });

  const animatedOverlay = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, overlayOpacity, Extrapolation.CLAMP);
    return { opacity };
  });

  const animatedRing = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, ringOpacity, Extrapolation.CLAMP);
    return { opacity };
  });

  const animatedShadow = useAnimatedStyle(() => {
    const val = interpolate(scrollX.value, inputRange, [0, 0, 1, 0, 0], Extrapolation.CLAMP);
    return {
      shadowOpacity: val * 0.35 * shadowMultiplier,
      shadowRadius: val * 12 * shadowMultiplier,
      elevation: val * 8 * shadowMultiplier,
    };
  });

  const animatedLabelBg = useAnimatedStyle(() => {
    const bg = interpolateColor(
      scrollX.value,
      [inputRange[1], inputRange[2], inputRange[3]],
      labelBgColors,
    );
    return { backgroundColor: bg };
  });

  const animatedLabelText = useAnimatedStyle(() => {
    const color = interpolateColor(
      scrollX.value,
      [inputRange[1], inputRange[2], inputRange[3]],
      labelTextColors,
    );
    return { color };
  });

  return {
    animatedScale,
    animatedOverlay,
    animatedRing,
    animatedShadow,
    animatedLabelBg,
    animatedLabelText,
  };
};
