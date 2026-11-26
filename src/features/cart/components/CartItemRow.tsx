import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { formatCurrency } from '@utils/format';
import { FoodTypeDot, Text } from '@components/ui';
import type { CartLine } from '@api/types';
import { useTheme } from "@app/theme/useTheme";

const MAX_QUANTITY = 20;

interface CartItemRowProps {
  line: CartLine;
  onChangeQuantity: (quantity: number) => void;
  isUpdating?: boolean;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ line, onChangeQuantity, isUpdating }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const details = [
    ...line.customizations.map((option) => option.name),
    ...(line.specialInstructions ? [`Note: ${line.specialInstructions}`] : []),
  ].join(' · ');
  const atMin = line.quantity <= 1;

  return (
    <View style={[styles.row, !line.meal.isAvailable ? styles.unavailable : null]}>
      {line.meal.image ? (
        <Image source={{ uri: line.meal.image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.image} />
      )}

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <FoodTypeDot type={line.meal.foodType} size={11} />
          <Text style={[theme.text.label, styles.name]} numberOfLines={1}>
            {line.meal.name}
          </Text>
        </View>
        {details ? (
          <Text style={[theme.text.caption, styles.details]} numberOfLines={1}>
            {details}
          </Text>
        ) : null}
        {!line.meal.isAvailable ? (
          <Text style={[theme.text.caption, styles.soldOut]}>No longer available, remove to continue</Text>
        ) : null}

        <View style={styles.bottomRow}>
          <Text style={[theme.text.label, styles.price]}>{formatCurrency(line.lineTotal)}</Text>
          <View style={styles.stepper}>
            <Pressable
              // At quantity 1 the minus turns into a bin, which is how people expect to clear a line.
              onPress={() => onChangeQuantity(atMin ? 0 : line.quantity - 1)}
              disabled={isUpdating}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={atMin ? 'Remove item' : 'Decrease quantity'}
              style={styles.step}
            >
              {atMin ? (
                <Trash2 size={14} color={theme.colors.state.error} strokeWidth={2.2} />
              ) : (
                <Minus size={14} color={theme.colors.text.brand} strokeWidth={2.8} />
              )}
            </Pressable>
            <Text style={[theme.text.label, styles.quantity]}>{line.quantity}</Text>
            <Pressable
              onPress={() => onChangeQuantity(line.quantity + 1)}
              disabled={isUpdating || line.quantity >= MAX_QUANTITY}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
              style={styles.step}
            >
              <Plus size={14} color={theme.colors.text.brand} strokeWidth={2.8} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CartItemRow;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  unavailable: { opacity: 0.6 },
  image: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutral[100],
  },
  body: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flex: 1, color: theme.colors.text.primary },
  details: { color: theme.colors.text.tertiary, marginTop: 1 },
  soldOut: { color: theme.colors.state.error, marginTop: 2 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  price: { color: theme.colors.text.primary },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.surface.brandWash,
  },
  step: { width: 28, height: '100%', alignItems: 'center', justifyContent: 'center' },
  quantity: { minWidth: 18, textAlign: 'center', color: theme.colors.text.brand },
});
