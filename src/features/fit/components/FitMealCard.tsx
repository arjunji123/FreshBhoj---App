import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Star, Utensils } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import AddToCartControl from '@components/AddToCartControl';
import FoodTypeDot from '@components/ui/FoodTypeDot';
import { formatCurrency } from '@utils/format';
import type { MealCard } from '@api/types';
import { useTheme } from '@app/theme/useTheme';
import { FIT, MACRO_COLORS } from '../fit.constants';
import type { FitTargets } from '../fit.utils';
import MacroPills from './MacroPills';

interface FitMealCardProps {
  meal: MealCard;
  targets: FitTargets | null;
  quantity: number;
  onPress: () => void;
  onAdd: () => void;
  onChangeQuantity: (next: number) => void;
}

/**
 * Fit meal row: photo, the four macros up front, and (once a daily target is
 * set) a bar showing how much of the day's protein this one plate covers.
 */
const FitMealCard: React.FC<FitMealCardProps> = ({ meal, targets, quantity, onPress, onAdd, onChangeQuantity }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const protein = meal.nutrition.proteinG;
  const share = targets && protein != null ? Math.min(1, protein / targets.proteinG) : null;

  return (
    <PressableScale onPress={onPress} haptic={false} scaleTo={0.98} accessibilityRole="button" accessibilityLabel={meal.name} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.imageWrap}>
          {meal.image ? (
            <Image source={{ uri: meal.image }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Utensils size={26} color={FIT.emerald} strokeWidth={2} />
            </View>
          )}
        </View>
        <View style={styles.body}>
          <View style={styles.nameRow}>
            <FoodTypeDot type={meal.foodType} size={12} />
            <Text style={styles.name} numberOfLines={2}>
              {meal.name}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.kitchen} numberOfLines={1}>
              {meal.kitchen.name}
            </Text>
            {meal.rating > 0 ? (
              <View style={styles.rating}>
                <Star size={11} color={theme.colors.amber[500]} fill={theme.colors.amber[500]} />
                <Text style={styles.ratingText}>{meal.rating.toFixed(1)}</Text>
              </View>
            ) : null}
          </View>
          <MacroPills nutrition={meal.nutrition} />
        </View>
      </View>

      {share != null ? (
        <View style={styles.shareRow}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.max(4, share * 100)}%` }]} />
          </View>
          <Text style={styles.shareText}>{Math.round(share * 100)}% of daily protein</Text>
        </View>
      ) : null}

      <View style={styles.bottom}>
        <Text style={styles.price}>{formatCurrency(meal.price)}</Text>
        <AddToCartControl
          quantity={quantity}
          onAdd={onAdd}
          onChangeQuantity={onChangeQuantity}
          disabled={!meal.isOrderable}
          variant="pill"
        />
      </View>
    </PressableScale>
  );
};

export default FitMealCard;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface.raised,
      borderWidth: 1,
      borderColor: theme.colors.borders.subtle,
      ...theme.elevation.sm,
    },
    top: { flexDirection: 'row', gap: theme.spacing.md },
    imageWrap: { width: 96, height: 96, borderRadius: theme.radius.lg, overflow: 'hidden' },
    image: { width: 96, height: 96 },
    placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: FIT.mint },
    body: { flex: 1, gap: 6 },
    nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
    name: { ...theme.text.label, flex: 1, color: theme.colors.text.primary },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    kitchen: { ...theme.text.caption, flexShrink: 1, color: theme.colors.text.secondary },
    rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    ratingText: { ...theme.text.caption, color: theme.colors.text.secondary, fontWeight: '700' },
    shareRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: theme.colors.surface.subtle, overflow: 'hidden' },
    fill: { height: 6, borderRadius: 3, backgroundColor: MACRO_COLORS.protein },
    shareText: { ...theme.text.caption, color: theme.colors.text.secondary, fontWeight: '600' },
    bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    price: { ...theme.text.h4, color: theme.colors.text.primary },
  });
