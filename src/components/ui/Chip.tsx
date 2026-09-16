import React from 'react';
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Filter / tab chip used across Home, Search, Orders, Kitchen and Food Feed.
 * Selected state is the brand gradient — the same red used on every primary
 * CTA — so every "active" state in the app reads as one consistent colour
 * language instead of some screens going green and others red.
 */
export const Chip: React.FC<ChipProps> = ({ label, selected = false, onPress, icon, style }) => {
  const content = (
    <>
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
    </>
  );

  if (selected) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        style={({ pressed }) => [pressed ? styles.pressed : null, style]}
      >
        <AppGradient
          colors={theme.colors.gradients.brand}
          locations={theme.colors.gradients.brandLocations}
          direction="diagonal"
          style={[styles.chip, styles.chipSelected]}
        >
          {content}
        </AppGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        styles.chipIdle,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
};

interface ChipRowProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Horizontally scrollable rail with the standard screen gutter. */
export const ChipRow: React.FC<ChipRowProps> = ({ children, style }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    // On Android, an unstyled horizontal ScrollView stretches to fill the
    // rest of its flex-column parent's height instead of wrapping its
    // content — without this it pushes everything below it (a list, an
    // empty state) far down the screen.
    style={styles.scroll}
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
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  icon: {
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
});
