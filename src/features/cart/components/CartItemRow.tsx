import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import { FoodTypeDot, QuantityStepper } from '@components/ui';
import type { CartLine } from '@api/types';

interface CartItemRowProps {
  line: CartLine;
  onChangeQuantity: (quantity: number) => void;
  isUpdating?: boolean;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ line, onChangeQuantity, isUpdating }) => (
  <View style={[styles.row, !line.meal.isAvailable ? styles.unavailable : null]}>
    {line.meal.image ? (
      <Image source={{ uri: line.meal.image }} style={styles.image} resizeMode="cover" />
    ) : (
      <View style={[styles.image, styles.imageFallback]} />
    )}

    <View style={styles.body}>
      <View style={styles.titleRow}>
        <FoodTypeDot type={line.meal.foodType} size={12} />
        <Text style={[theme.text.h4, styles.name]} numberOfLines={2}>
          {line.meal.name}
        </Text>
      </View>

      {line.customizations.length ? (
        <Text style={[theme.text.caption, styles.addOns]} numberOfLines={2}>
          {line.customizations.map((option) => option.name).join(' · ')}
        </Text>
      ) : null}

      {line.specialInstructions ? (
        <Text style={[theme.text.caption, styles.note]} numberOfLines={2}>
          Note: {line.specialInstructions}
        </Text>
      ) : null}

      {!line.meal.isAvailable ? (
        <Text style={[theme.text.caption, styles.soldOut]}>
          No longer available — remove to continue
        </Text>
      ) : null}

      <View style={styles.footer}>
        <QuantityStepper
          value={line.quantity}
          onChange={onChangeQuantity}
          size="sm"
          // At quantity 1 the minus turns into a bin, which is how people
          // expect to clear a line without hunting for a separate control.
          showRemoveAtMin
          disabled={isUpdating}
        />
        <Text style={theme.text.numeric}>{formatCurrency(line.lineTotal)}</Text>
      </View>
    </View>
  </View>
);

export default CartItemRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  unavailable: {
    opacity: 0.6,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.neutral[100],
  },
  imageFallback: {
    backgroundColor: theme.colors.neutral[200],
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  name: {
    flex: 1,
  },
  addOns: {
    color: theme.colors.text.tertiary,
    marginTop: 3,
  },
  note: {
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: 3,
  },
  soldOut: {
    color: theme.colors.state.error,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
});
