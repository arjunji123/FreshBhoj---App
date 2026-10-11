import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { theme as staticTheme } from '@app/theme/index';
import KitchenCard from '@components/KitchenCard';
import HomeSectionHeader from './HomeSectionHeader';
import { Skeleton } from '@components/ui';
import type { KitchenCard as KitchenCardType } from '@api/types';
import { HOME_COPY } from '../home.constants';

interface FeaturedKitchensProps {
  kitchens: KitchenCardType[];
  isLoading?: boolean;
  onPressKitchen: (kitchen: KitchenCardType) => void;
  onSeeAll?: () => void;
}

/** Matches the rail KitchenCard: 248 wide, 150 photo, name + meta lines. */
const KitchenSkeleton = () => (
  <View style={styles.skeleton}>
    <Skeleton height={150} radius={staticTheme.radius.xxl} />
    <Skeleton width="65%" height={14} />
    <Skeleton width="40%" height={11} />
  </View>
);

const FeaturedKitchens: React.FC<FeaturedKitchensProps> = ({
  kitchens,
  isLoading,
  onPressKitchen,
  onSeeAll,
}) => {
  if (!isLoading && !kitchens.length) return null;

  return (
    <View style={styles.container}>
      <HomeSectionHeader
        title={HOME_COPY.featuredKitchens}
        subtitle={HOME_COPY.featuredKitchensSubtitle}
        onSeeAll={onSeeAll}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => <KitchenSkeleton key={index} />)
          : kitchens.map((kitchen) => (
              <KitchenCard
                key={kitchen.id}
                kitchen={kitchen}
                onPress={() => onPressKitchen(kitchen)}
              />
            ))}
      </ScrollView>
    </View>
  );
};

export default FeaturedKitchens;

const styles = StyleSheet.create({
  container: {
    marginTop: staticTheme.spacing.xl,
  },
  skeleton: {
    width: 248,
    gap: staticTheme.spacing.sm,
  },
  scroll: {
    paddingHorizontal: staticTheme.layout.screenPadding,
    gap: staticTheme.spacing.md,
    paddingBottom: staticTheme.spacing.sm,
  },
});
