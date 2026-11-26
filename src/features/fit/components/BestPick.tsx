import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import PressableScale from '@animations/PressableScale';
import AddToCartControl from '@components/AddToCartControl';
import { NutritionBadgeRow, Text } from '@components/ui';
import type { MealCard } from '@api/types';
import { useTheme } from '@app/theme/useTheme';
import { formatCurrency } from '@utils/format';
import type { CartNutrition, FitTargets } from '../fit.utils';

/**
 * The orderable dish with the most protein that still fits the calories left
 * for the day. Without a target it is simply the highest-protein orderable dish.
 */
export function pickBestMeal(meals: MealCard[], targets: FitTargets | null, inCart: CartNutrition): MealCard | null {
  const kcalLeft = targets ? targets.kcal - inCart.kcal : Infinity;
  const fits = meals.filter(
    (meal) =>
      meal.isOrderable &&
      meal.nutrition.proteinG != null &&
      meal.nutrition.calories != null &&
      meal.nutrition.calories <= kcalLeft,
  );
  return fits.sort((a, b) => (b.nutrition.proteinG ?? 0) - (a.nutrition.proteinG ?? 0))[0] ?? null;
}

interface BestPickProps {
  meal: MealCard;
  targets: FitTargets | null;
  inCart: CartNutrition;
  quantity: number;
  onPress: () => void;
  onAdd: () => void;
  onChangeQuantity: (next: number) => void;
}

const BestPick: React.FC<BestPickProps> = ({ meal, targets, inCart, quantity, onPress, onAdd, onChangeQuantity }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const proteinLeft = targets ? targets.proteinG - inCart.proteinG : 0;
  const share =
    targets && proteinLeft > 0
      ? Math.min(100, Math.round(((meal.nutrition.proteinG ?? 0) / proteinLeft) * 100))
      : null;

  return (
    <PressableScale onPress={onPress} scaleTo={0.98} haptic={false} accessibilityRole="button" accessibilityLabel={meal.name} style={styles.card}>
      <View style={styles.row}>
        {meal.image ? (
          <Image source={{ uri: meal.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.image} />
        )}
        <View style={styles.body}>
          <Text style={theme.text.h4} numberOfLines={2}>{meal.name}</Text>
          <Text style={[theme.text.caption, styles.kitchen]} numberOfLines={1}>{meal.kitchen.name}</Text>
          <View style={styles.badges}>
            <NutritionBadgeRow calories={meal.nutrition.calories} proteinG={meal.nutrition.proteinG} />
          </View>
        </View>
      </View>

      {share != null ? (
        <Text style={[theme.text.bodySmall, styles.reason]}>
          Covers {share}% of the protein you still need today.
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Text style={theme.text.numeric}>{formatCurrency(meal.price)}</Text>
        <AddToCartControl variant="pill" quantity={quantity} onAdd={onAdd} onChangeQuantity={onChangeQuantity} />
      </View>
    </PressableScale>
  );
};

export default BestPick;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      marginHorizontal: theme.layout.screenPadding,
      padding: theme.spacing.md,
      gap: theme.spacing.md,
      borderRadius: theme.radius.xxl,
      backgroundColor: theme.colors.surface.raised,
      ...theme.elevation.sm,
    },
    row: { flexDirection: 'row', gap: theme.spacing.md },
    image: { width: 96, height: 96, borderRadius: theme.radius.xl, backgroundColor: theme.colors.neutral[100] },
    body: { flex: 1 },
    kitchen: { color: theme.colors.text.tertiary, marginTop: 2 },
    badges: { marginTop: theme.spacing.sm },
    reason: { color: theme.colors.text.brand },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  });
