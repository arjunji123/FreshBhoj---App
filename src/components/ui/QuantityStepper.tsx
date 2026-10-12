import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { useTheme } from "@app/theme/useTheme";
import Animated, { ZoomIn } from 'react-native-reanimated';
import PressableScale from '@animations/PressableScale';

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
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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
      <PressableScale
        onPress={decrement}
        disabled={disabled || (atMin && !showRemoveAtMin)}
        hitSlop={theme.layout.hitSlop}
        accessibilityRole="button"
        accessibilityLabel={atMin && showRemoveAtMin ? 'Remove item' : 'Decrease quantity'}
        scaleTo={0.86}
        style={[
          styles.button,
          { width: dimension, height: dimension },
          atMin && !showRemoveAtMin ? styles.buttonDisabled : null,
        ]}
      >
        {atMin && showRemoveAtMin ? (
          <Trash2 size={iconSize} color={theme.colors.state.error} strokeWidth={2.2} />
        ) : (
          <Minus
            size={iconSize}
            color={atMin ? theme.colors.text.disabled : theme.colors.text.brand}
            strokeWidth={2.8}
          />
        )}
      </PressableScale>

      <Animated.Text
        key={value}
        entering={ZoomIn.duration(160)}
        style={[size === 'sm' ? theme.text.label : theme.text.h4, styles.value]}
      >
        {value}
      </Animated.Text>

      <PressableScale
        onPress={() => !disabled && !atMax && onChange(value + 1)}
        disabled={disabled || atMax}
        hitSlop={theme.layout.hitSlop}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        scaleTo={0.86}
        style={[
          styles.button,
          styles.buttonPrimary,
          { width: dimension, height: dimension },
          atMax ? styles.buttonDisabled : null,
        ]}
      >
        <Plus size={iconSize} color={theme.colors.text.inverse} strokeWidth={2.8} />
      </PressableScale>
    </View>
  );
};

export default QuantityStepper;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  button: {
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.brandWash,
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
});
