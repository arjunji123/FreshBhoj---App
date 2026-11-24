import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Activity } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { enterRise } from '@animations/motion';
import { useTheme } from '@app/theme/useTheme';
import type { Cart } from '@api/types';
import { FIT, MACRO_COLORS } from '../fit.constants';
import { cartNutrition, cartVerdict } from '../fit.utils';
import { useFitStore } from '../store/fitStore';

const DEFAULT_KCAL = 2000;
const DEFAULT_PROTEIN = 60;

interface CartNutritionCardProps {
  cart: Cart;
  index?: number;
}

/**
 * "What am I actually eating?" meter for the cart: calories and protein in the
 * order, shown against the daily target if one is set (a generic 2000 kcal /
 * 60g day otherwise), plus a one-line verdict. Hidden when no item has data.
 */
const CartNutritionCard: React.FC<CartNutritionCardProps> = ({ cart, index = 1 }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const targets = useFitStore((s) => s.targets);
  const n = useMemo(() => cartNutrition(cart), [cart]);

  if (n.kcal === 0 && n.proteinG === 0) return null;

  const kcalGoal = targets?.kcal ?? DEFAULT_KCAL;
  const proteinGoal = targets?.proteinG ?? DEFAULT_PROTEIN;

  const bar = (label: string, value: number, goal: number, unit: string, color: string) => (
    <View key={label} style={styles.barBlock}>
      <View style={styles.barHead}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>
          <Text style={{ color, fontWeight: '800' }}>{value}</Text>
          {unit} / {goal}
          {unit}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(3, Math.min(100, (value / goal) * 100))}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <Animated.View entering={enterRise(index)} style={styles.card}>
      <View style={styles.head}>
        <View style={styles.iconWrap}>
          <Activity size={16} color={FIT.lime} strokeWidth={2.6} />
        </View>
        <View style={styles.headText}>
          <Text style={styles.title}>Nutrition in your cart</Text>
          <Text style={styles.sub}>{targets ? 'Against your daily target' : 'Against a typical day'}</Text>
        </View>
      </View>
      {bar("Calories", n.kcal, kcalGoal, " kcal", MACRO_COLORS.kcal)}
      {bar("Protein", n.proteinG, proteinGoal, "g", MACRO_COLORS.protein)}
      <Text style={styles.verdict}>{cartVerdict(n, targets)}</Text>
      {n.unknownItems > 0 ? (
        <Text style={styles.note}>
          {n.unknownItems} {n.unknownItems === 1 ? 'item has' : 'items have'} no nutrition info, so totals may be higher.
        </Text>
      ) : null}
    </Animated.View>
  );
};

export default CartNutritionCard;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      gap: theme.spacing.md,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface.raised,
      borderWidth: 1,
      borderColor: theme.colors.borders.subtle,
      ...theme.elevation.sm,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    iconWrap: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: FIT.deep },
    headText: { flex: 1 },
    title: { ...theme.text.h4, color: theme.colors.text.primary },
    sub: { ...theme.text.caption, color: theme.colors.text.secondary },
    barBlock: { gap: 6 },
    barHead: { flexDirection: 'row', justifyContent: 'space-between' },
    barLabel: { ...theme.text.label, color: theme.colors.text.primary },
    barValue: { ...theme.text.caption, color: theme.colors.text.secondary },
    track: { height: 8, borderRadius: 4, backgroundColor: theme.colors.surface.subtle, overflow: 'hidden' },
    fill: { height: 8, borderRadius: 4 },
    verdict: { ...theme.text.bodySmall, color: theme.colors.text.primary, fontWeight: '600' },
    note: { ...theme.text.caption, color: theme.colors.text.tertiary },
  });
