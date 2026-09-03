import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@app/theme/index';
import type { MealCategory } from '@api/types';
import { CATEGORY_EMOJI } from '../home.constants';

interface CategoryGridProps {
  categories: MealCategory[];
  activeSlug?: string;
  onSelect: (category: MealCategory) => void;
}

/** Breakfast / Lunch / Dinner / Healthy Snacks — four tiles, one row. */
const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, activeSlug, onSelect }) => {
  if (!categories.length) return null;

  return (
    <View style={styles.grid}>
      {categories.map((category) => {
        const isActive = category.slug === activeSlug;

        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [
              styles.tile,
              isActive ? styles.tileActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={[styles.iconWrap, isActive ? styles.iconWrapActive : null]}>
              {category.iconUrl ? (
                <Image source={{ uri: category.iconUrl }} style={styles.icon} resizeMode="cover" />
              ) : (
                <Text style={styles.emoji}>{CATEGORY_EMOJI[category.slug] ?? '🍽️'}</Text>
              )}
            </View>
            <Text
              style={[
                theme.text.caption,
                { color: isActive ? theme.colors.primary[700] : theme.colors.text.secondary },
              ]}
              numberOfLines={2}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default CategoryGrid;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface.raised,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...theme.elevation.xs,
  },
  tileActive: {
    borderColor: theme.colors.borders.brand,
    backgroundColor: theme.colors.surface.brandWash,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: theme.colors.surface.base,
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    fontSize: 24,
  },
});
