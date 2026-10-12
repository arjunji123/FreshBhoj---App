import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MapPinOff } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { Skeleton } from '@components/ui';
import type { NearbyMealCard } from '@api/types';
import HomeSectionHeader from './HomeSectionHeader';
import NearbyMealTile, { CARD_WIDTH } from './NearbyMealTile';
import { useTheme } from "@app/theme/useTheme";

interface TrendingNearYouProps {
  meals: NearbyMealCard[];
  isLoading: boolean;
  /** True once we know the device/onboarding location — distinct from "no results". */
  hasLocation: boolean;
  onPressMeal: (meal: NearbyMealCard) => void;
  onAddMeal: (meal: NearbyMealCard) => void;
  getQuantity?: (mealId: string) => number;
  onChangeQuantity?: (mealId: string, next: number) => void;
  onToggleFavorite: (meal: NearbyMealCard) => void;
  onSetLocation: () => void;
}

const Header = () => (
  <HomeSectionHeader
    title="Trending Near You"
    subtitle="Popular dishes that others nearby are loving"
  />
);

const TileSkeleton = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  return (
(
  <View style={styles.tileSkeleton}>
    <Skeleton height={128} radius={0} />
    <View style={styles.tileSkeletonBody}>
      <Skeleton width="80%" height={14} />
      <Skeleton width="55%" height={11} />
      <View style={styles.tileSkeletonFooter}>
        <Skeleton width={48} height={16} />
        <Skeleton width={28} height={28} radius={14} />
      </View>
    </View>
  </View>
)
  );
};

/**
 * Real "near you" — ranked by order volume among kitchens within a radius of
 * the customer's own coordinates (see `useTrendingNearby`). Distinct from the
 * generic meal feed further down, which is not location-filtered.
 */
const TrendingNearYou: React.FC<TrendingNearYouProps> = ({
  meals,
  isLoading,
  hasLocation,
  onPressMeal,
  onAddMeal,
  getQuantity,
  onChangeQuantity,
  onToggleFavorite,
  onSetLocation,
}) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  if (!hasLocation) {
    return (
      <View style={styles.container}>
        <Header />
        <PressableScale
          onPress={onSetLocation}
          scaleTo={0.98}
          haptic={false}
          accessibilityRole="button"
          accessibilityLabel="Set your delivery area"
          style={styles.noLocationCard}
        >
          <View style={styles.noLocationIcon}>
            <MapPinOff size={20} color={theme.colors.primary[600]} strokeWidth={2} />
          </View>
          <Text style={[theme.text.bodyMedium, styles.noLocationText]}>
            Set your delivery area to see what’s trending near you
          </Text>
        </PressableScale>
      </View>
    );
  }

  if (!isLoading && meals.length === 0) return null;

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.grid}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <TileSkeleton key={index} />)
          : meals.map((meal) => (
              <NearbyMealTile
                key={meal.id}
                meal={meal}
                onPress={() => onPressMeal(meal)}
                onAdd={() => onAddMeal(meal)}
                quantity={getQuantity?.(meal.id) ?? 0}
                onChangeQuantity={onChangeQuantity ? (next) => onChangeQuantity(meal.id, next) : undefined}
                onToggleFavorite={() => onToggleFavorite(meal)}
              />
            ))}
      </View>
    </View>
  );
};

export default TrendingNearYou;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    marginTop: theme.spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.lg,
    rowGap: theme.spacing.lg,
  },
  tileSkeleton: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.surface.raised,
    borderRadius: theme.radius.xxl,
    overflow: 'hidden',
    ...theme.elevation.sm,
  },
  tileSkeletonBody: {
    padding: theme.spacing.md,
    gap: 6,
  },
  tileSkeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  noLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginHorizontal: theme.layout.screenPadding,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.surface.brandWash,
    borderWidth: 1,
    borderColor: theme.colors.borders.brand,
  },
  noLocationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.base,
  },
  noLocationText: {
    flex: 1,
    color: theme.colors.text.brand,
  },
});
