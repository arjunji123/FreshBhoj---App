import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { theme } from '@app/theme/index';
import KitchenCard from '@components/KitchenCard';
import SectionHeader from '@components/SectionHeader';
import { KitchenCardSkeleton } from '@components/ui';
import type { KitchenCard as KitchenCardType } from '@api/types';
import { HOME_COPY } from '../home.constants';

interface FeaturedKitchensProps {
  kitchens: KitchenCardType[];
  isLoading?: boolean;
  onPressKitchen: (kitchen: KitchenCardType) => void;
  onSeeAll?: () => void;
}

const FeaturedKitchens: React.FC<FeaturedKitchensProps> = ({
  kitchens,
  isLoading,
  onPressKitchen,
  onSeeAll,
}) => {
  if (!isLoading && !kitchens.length) return null;

  return (
    <View style={styles.container}>
      <SectionHeader
        title={HOME_COPY.featuredKitchens}
        actionLabel={onSeeAll ? 'See all' : undefined}
        onActionPress={onSeeAll}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => <KitchenCardSkeleton key={index} />)
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
    marginTop: theme.spacing.xl,
  },
  scroll: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
});
