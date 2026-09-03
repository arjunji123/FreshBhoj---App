import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPinOff } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Skeleton } from '@components/ui';
import type { NearbyMealCard } from '@api/types';
import NearbyMealTile, { CARD_WIDTH } from './NearbyMealTile';

interface TrendingNearYouProps {
  meals: NearbyMealCard[];
  isLoading: boolean;
  /** True once we know the device/onboarding location — distinct from "no results". */
  hasLocation: boolean;
  onPressMeal: (meal: NearbyMealCard) => void;
  onAddMeal: (meal: NearbyMealCard) => void;
  onToggleFavorite: (meal: NearbyMealCard) => void;
  onSetLocation: () => void;
}

const Header = () => (
  <View style={styles.header}>
    <Text style={theme.text.h2}>Trending Near You</Text>
    <Text style={[theme.text.bodySmall, styles.headerSubtitle]}>
      Popular dishes that others nearby are loving
    </Text>
  </View>
);

const TileSkeleton = () => (
  <View style={styles.tileSkeleton}>
    <Skeleton height={110} radius={theme.radius.card} />
    <View style={styles.tileSkeletonBody}>
      <Skeleton width="80%" height={14} />
      <Skeleton width="55%" height={11} />
      <View style={styles.tileSkeletonFooter}>
        <Skeleton width={48} height={16} />
        <Skeleton width={28} height={28} radius={14} />
      </View>
    </View>
  </View>
);

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
  onToggleFavorite,
  onSetLocation,
}) => {
  if (!hasLocation) {
    return (
      <View style={styles.container}>
        <Header />
        <Pressable
          onPress={onSetLocation}
          accessibilityRole="button"
          accessibilityLabel="Set your delivery area"
          style={styles.noLocationCard}
        >
          <MapPinOff size={20} color={theme.colors.primary[600]} strokeWidth={2} />
          <Text style={[theme.text.bodyMedium, styles.noLocationText]}>
            Set your delivery area to see what’s trending near you
          </Text>
        </Pressable>
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
                onToggleFavorite={() => onToggleFavorite(meal)}
              />
            ))}
      </View>
    </View>
  );
};

export default TrendingNearYou;

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.layout.screenPadding,
    marginBottom: theme.spacing.md,
  },
  headerSubtitle: {
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.lg,
  },
  tileSkeleton: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.surface.raised,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    ...theme.elevation.xs,
  },
  tileSkeletonBody: {
    padding: theme.spacing.sm,
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
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.primary[50],
    borderWidth: 1,
    borderColor: theme.colors.borders.brand,
  },
  noLocationText: {
    flex: 1,
    color: theme.colors.primary[700],
  },
});
