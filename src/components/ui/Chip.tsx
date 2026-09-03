import React from 'react';
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '@app/theme/index';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Goal-filter chip. Selected state uses the *accent* green — green is the
 * health signal in this product, and red is reserved for CTAs, so a selected
 * filter must never compete with the primary action on screen.
 */
export const Chip: React.FC<ChipProps> = ({ label, selected = false, onPress, icon, style }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    style={({ pressed }) => [
      styles.chip,
      selected ? styles.chipSelected : styles.chipIdle,
      pressed ? styles.pressed : null,
      style,
    ]}
  >
    {icon ? <View style={styles.icon}>{icon}</View> : null}
    <Text
      style={[
        theme.text.label,
        { color: selected ? theme.colors.text.inverse : theme.colors.text.secondary },
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
  </Pressable>
);

interface ChipRowProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Horizontally scrollable rail with the standard screen gutter. */
export const ChipRow: React.FC<ChipRowProps> = ({ children, style }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={[styles.row, style]}
  >
    {children}
  </ScrollView>
);

export default Chip;

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
  },
  chipIdle: {
    backgroundColor: theme.colors.surface.base,
    borderColor: theme.colors.borders.subtle,
  },
  chipSelected: {
    backgroundColor: theme.colors.accent[600],
    borderColor: theme.colors.accent[600],
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  icon: {
    justifyContent: 'center',
  },
  row: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
});
