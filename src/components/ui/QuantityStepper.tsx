import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { theme } from '@app/theme/index';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  /** Shows a bin icon instead of "−" at the minimum, for cart rows. */
  showRemoveAtMin?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** −/+ stepper used in the cart, the customisation sheet and the sticky bar. */
const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 20,
  size = 'md',
  showRemoveAtMin = false,
  disabled = false,
  style,
}) => {
  const dimension = size === 'sm' ? 28 : 36;
  const iconSize = size === 'sm' ? 14 : 18;
  const atMin = value <= min;
  const atMax = value >= max;

  const decrement = () => {
    if (disabled) return;
    if (atMin && showRemoveAtMin) {
      onChange(0);
      return;
    }
    if (!atMin) onChange(value - 1);
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable
        onPress={decrement}
        disabled={disabled || (atMin && !showRemoveAtMin)}
        hitSlop={theme.layout.hitSlop}
        accessibilityRole="button"
        accessibilityLabel={atMin && showRemoveAtMin ? 'Remove item' : 'Decrease quantity'}
        style={({ pressed }) => [
          styles.button,
          { width: dimension, height: dimension },
          atMin && !showRemoveAtMin ? styles.buttonDisabled : null,
          pressed ? styles.pressed : null,
        ]}
      >
        {atMin && showRemoveAtMin ? (
          <Trash2 size={iconSize} color={theme.colors.state.error} strokeWidth={2.2} />
        ) : (
          <Minus
            size={iconSize}
            color={atMin ? theme.colors.text.disabled : theme.colors.primary[600]}
            strokeWidth={2.8}
          />
        )}
      </Pressable>

      <Text style={[size === 'sm' ? theme.text.label : theme.text.h4, styles.value]}>{value}</Text>

      <Pressable
        onPress={() => !disabled && !atMax && onChange(value + 1)}
        disabled={disabled || atMax}
        hitSlop={theme.layout.hitSlop}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        style={({ pressed }) => [
          styles.button,
          styles.buttonPrimary,
          { width: dimension, height: dimension },
          atMax ? styles.buttonDisabled : null,
          pressed ? styles.pressed : null,
        ]}
      >
        <Plus size={iconSize} color={theme.colors.text.inverse} strokeWidth={2.8} />
      </Pressable>
    </View>
  );
};

export default QuantityStepper;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  button: {
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[50],
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary[600],
  },
  buttonDisabled: {
    backgroundColor: theme.colors.neutral[100],
  },
  value: {
    minWidth: 22,
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.9 }],
  },
});
