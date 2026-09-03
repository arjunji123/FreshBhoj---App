import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';
import type { Cuisine } from '@api/types';

interface CuisinePillRowProps {
  cuisines: Cuisine[];
  selectedSlug?: string;
  onSelect: (cuisine: Cuisine) => void;
}

/**
 * Cuisine pills — style of food (Thali, Curry, Tandoor…), not to be confused
 * with `GoalFilterRow`'s health-goal chips just below it. Deliberately a
 * different visual language (larger, photo-led, brand-red when active) so the
 * two rows read as separate concepts rather than two identical green strips
 * stacked on top of each other.
 *
 * Single-select: tapping the active pill clears it, so the row doubles as
 * an on/off toggle for the main feed's `cuisine` filter.
 */
const CuisinePillRow: React.FC<CuisinePillRowProps> = ({ cuisines, selectedSlug, onSelect }) => {
  if (!cuisines.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {cuisines.map((cuisine) => {
        const isActive = cuisine.slug === selectedSlug;

        return (
          <Pressable
            key={cuisine.id}
            onPress={() => onSelect(cuisine)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [pressed ? styles.pressed : null]}
          >
            {isActive ? (
              <AppGradient
                colors={theme.colors.gradients.brand}
                locations={theme.colors.gradients.brandLocations}
                direction="diagonal"
                style={styles.pill}
              >
                <PillContent cuisine={cuisine} isActive />
              </AppGradient>
            ) : (
              <View style={[styles.pill, styles.pillIdle]}>
                <PillContent cuisine={cuisine} isActive={false} />
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const PillContent: React.FC<{ cuisine: Cuisine; isActive: boolean }> = ({ cuisine, isActive }) => (
  <>
    {cuisine.iconUrl ? (
      <Image source={{ uri: cuisine.iconUrl }} style={styles.pillIcon} />
    ) : (
      <View style={[styles.pillIcon, styles.pillIconFallback]} />
    )}
    <Text
      style={[theme.text.label, { color: isActive ? theme.colors.text.inverse : theme.colors.primary[700] }]}
      numberOfLines={1}
    >
      {cuisine.name}
    </Text>
  </>
);

export default CuisinePillRow;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
    paddingLeft: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    gap: theme.spacing.sm,
  },
  pillIdle: {
    backgroundColor: theme.colors.primary[50],
  },
  pillIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  pillIconFallback: {
    backgroundColor: theme.colors.neutral[200],
  },
});
