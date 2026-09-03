import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@app/theme/index';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pulsing placeholder block. Loading states use these rather than a spinner so
 * the screen keeps its shape and nothing jumps when data lands.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  radius = theme.radius.md,
  style,
}) => {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.block,
        { width: width as any, height, borderRadius: radius },
        animatedStyle,
        style,
      ]}
    />
  );
};

/** Placeholder shaped like the meal card in the Home feed. */
export const MealCardSkeleton: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => (
  <View style={[styles.card, style]}>
    <Skeleton height={140} radius={theme.radius.lg} />
    <View style={styles.cardBody}>
      <Skeleton width="75%" height={16} />
      <Skeleton width="50%" height={12} />
      <View style={styles.cardRow}>
        <Skeleton width={64} height={20} radius={theme.radius.pill} />
        <Skeleton width={78} height={20} radius={theme.radius.pill} />
      </View>
      <View style={styles.cardRow}>
        <Skeleton width={56} height={18} />
        <Skeleton width={72} height={32} radius={theme.radius.control} />
      </View>
    </View>
  </View>
);

/** Placeholder shaped like the horizontal kitchen rail card. */
export const KitchenCardSkeleton: React.FC = () => (
  <View style={styles.kitchenCard}>
    <Skeleton height={112} radius={theme.radius.lg} />
    <Skeleton width="70%" height={14} style={styles.gapTop} />
    <Skeleton width="45%" height={11} style={styles.gapTopSm} />
  </View>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <View style={styles.list}>
    {Array.from({ length: count }).map((_, index) => (
      <MealCardSkeleton key={index} />
    ))}
  </View>
);

export default Skeleton;

const styles = StyleSheet.create({
  block: {
    backgroundColor: theme.colors.neutral[200],
  },
  card: {
    backgroundColor: theme.colors.surface.raised,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    ...theme.elevation.xs,
  },
  cardBody: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  kitchenCard: {
    width: 200,
    backgroundColor: theme.colors.surface.raised,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    ...theme.elevation.xs,
  },
  gapTop: { marginTop: theme.spacing.md },
  gapTopSm: { marginTop: theme.spacing.sm },
  list: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.layout.gridGap,
  },
});
