import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Skeleton } from '@components/ui';
import MealCard from '@components/MealCard';
import HomeSectionHeader from './HomeSectionHeader';
import { enterRise } from '@animations/motion';
import type { MealCard as MealCardType } from '@api/types';
import { useTheme } from '@app/theme/useTheme';
import { HOME_COPY } from '../home.constants';

interface HealthyPicksProps {
  meals: MealCardType[];
  isLoading: boolean;
  onPressMeal: (meal: MealCardType) => void;
  onAddMeal: (meal: MealCardType) => void;
  getQuantity?: (mealId: string) => number;
  onChangeQuantity?: (mealId: string, next: number) => void;
  onToggleFavorite: (meal: MealCardType) => void;
}

/** Horizontal rail of the best-scoring healthy meals (see `useHealthyPicks`). */
const HealthyPicks: React.FC<HealthyPicksProps> = ({
  meals,
  isLoading,
  onPressMeal,
  onAddMeal,
  getQuantity,
  onChangeQuantity,
  onToggleFavorite,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!isLoading && !meals.length) return null;

  return (
    <View style={styles.container}>
      <HomeSectionHeader title={HOME_COPY.healthyTitle} subtitle={HOME_COPY.healthySubtitle} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} width={168} height={250} radius={theme.radius.xxl} />
            ))
          : meals.map((meal, index) => (
              <Animated.View key={meal.id} entering={enterRise(index)}>
                <MealCard
                  layout="compact"
                  meal={meal}
                  onPress={() => onPressMeal(meal)}
                  onAdd={() => onAddMeal(meal)}
                  quantity={getQuantity?.(meal.id)}
                  onChangeQuantity={onChangeQuantity ? (next) => onChangeQuantity(meal.id, next) : undefined}
                  onToggleFavorite={() => onToggleFavorite(meal)}
                />
              </Animated.View>
            ))}
      </ScrollView>
    </View>
  );
};

export default HealthyPicks;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    marginTop: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.sm,
  },
});
