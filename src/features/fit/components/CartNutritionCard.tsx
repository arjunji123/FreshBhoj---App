import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Activity } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { enterRise } from '@animations/motion';
import { useTheme } from '@app/theme/useTheme';
import type { Cart } from '@api/types';
import { FIT } from '../fit.constants';
import { cartNutrition, cartVerdict } from '../fit.utils';
import { useFitStore } from '../store/fitStore';

interface CartNutritionCardProps {
  cart: Cart;
  index?: number;
}

/**
 * "What am I actually eating?" in one line: the order's calories and protein
 * with a short verdict. Hidden when no item has data.
 */
const CartNutritionCard: React.FC<CartNutritionCardProps> = ({ cart, index = 1 }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const targets = useFitStore((s) => s.targets);
  const n = useMemo(() => cartNutrition(cart), [cart]);

  if (n.kcal === 0 && n.proteinG === 0) return null;

  return (
    <Animated.View entering={enterRise(index)} style={styles.card}>
      <View style={styles.iconWrap}>
        <Activity size={16} color={FIT.lime} strokeWidth={2.6} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>
          {n.kcal} kcal · {n.proteinG}g protein
          {n.unknownItems > 0 ? '+' : ''}
        </Text>
        <Text style={styles.verdict} numberOfLines={2}>
          {cartVerdict(n, targets)}
        </Text>
      </View>
    </Animated.View>
  );
};

export default CartNutritionCard;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface.raised,
    },
    iconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: FIT.deep },
    text: { flex: 1 },
    title: { ...theme.text.label, color: theme.colors.text.primary },
    verdict: { ...theme.text.caption, color: theme.colors.text.secondary, marginTop: 1 },
  });
