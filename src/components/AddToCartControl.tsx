import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { Plus } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import AppGradient from './AppGradient';
import QuantityStepper from './ui/QuantityStepper';

interface AddToCartControlProps {
  /** Current quantity of this meal already in the cart. 0 shows the add button. */
  quantity: number;
  /** Called to add the first unit — routed through the kitchen-conflict flow. */
  onAdd: () => void;
  /** Called for every change once the item is already in the cart, incl. 0 (remove). */
  onChangeQuantity: (next: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  /** `circle` is a bare round + (grid tiles); `pill` carries an "ADD" label (list rows). */
  variant?: 'circle' | 'pill';
  style?: StyleProp<ViewStyle>;
}

/**
 * The single add-to-cart control used on every meal card in the app — Home,
 * Search, Kitchen menus, Favourites. Below zero it's a gradient add button;
 * at one-or-more it becomes the same −/+ stepper as the cart screen, so
 * bumping quantity never requires leaving the card.
 */
const AddToCartControl: React.FC<AddToCartControlProps> = ({
  quantity,
  onAdd,
  onChangeQuantity,
  disabled = false,
  size = 'sm',
  variant = 'circle',
  style,
}) => {
  if (quantity > 0) {
    return (
      <QuantityStepper
        value={quantity}
        onChange={onChangeQuantity}
        min={1}
        showRemoveAtMin
        size={size}
        disabled={disabled}
        style={style}
      />
    );
  }

  if (variant === 'pill') {
    return (
      <Pressable
        onPress={onAdd}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Add to cart"
        style={({ pressed }) => [
          styles.pillWrap,
          disabled ? styles.disabled : null,
          pressed ? styles.pressed : null,
          style,
        ]}
      >
        <AppGradient
          colors={theme.colors.gradients.brand}
          locations={theme.colors.gradients.brandLocations}
          direction="diagonal"
          style={styles.pill}
        >
          <Plus size={14} color={theme.colors.text.inverse} strokeWidth={3} />
          <Text style={[theme.text.buttonSmall, styles.pillText]}>ADD</Text>
        </AppGradient>
      </Pressable>
    );
  }

  const dimension = size === 'sm' ? 28 : 34;

  return (
    <Pressable
      onPress={onAdd}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Add to cart"
      style={({ pressed }) => [
        disabled ? styles.disabled : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      <AppGradient
        colors={theme.colors.gradients.brand}
        locations={theme.colors.gradients.brandLocations}
        direction="diagonal"
        style={[styles.circle, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
      >
        <Plus size={size === 'sm' ? 15 : 18} color={theme.colors.text.inverse} strokeWidth={2.8} />
      </AppGradient>
    </Pressable>
  );
};

export default AddToCartControl;

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillWrap: {
    borderRadius: theme.radius.control,
    overflow: 'hidden',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.control,
  },
  pillText: {
    color: theme.colors.text.inverse,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
});
