import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Skeleton } from '@components/ui';
import PressableScale from '@animations/PressableScale';
import type { MealCategory } from '@api/types';
import { CATEGORY_EMOJI } from '../home.constants';
import { useTheme } from '@app/theme/useTheme';

interface CategoryGridProps {
  categories: MealCategory[];
  activeSlug?: string;
  onSelect: (category: MealCategory) => void;
  isLoading?: boolean;
}

/** Breakfast / Lunch / Dinner / Healthy Snacks — a soft 2x2 grid of roomy tiles. */
const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, activeSlug, onSelect, isLoading }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (isLoading) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={[styles.tile, styles.skeletonTile]}>
            <Skeleton width={48} height={48} radius={24} />
            <Skeleton width="50%" height={12} />
          </View>
        ))}
      </View>
    );
  }

  if (!categories.length) return null;

  return (
    <View style={styles.grid}>
      {categories.map((category) => {
        const isActive = category.slug === activeSlug;

        return (
          <PressableScale
            key={category.id}
            onPress={() => onSelect(category)}
            scaleTo={0.97}
            haptic={false}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={[styles.tile, isActive ? styles.tileActive : null]}
          >
            <View style={styles.iconWrap}>
              {category.iconUrl ? (
                <Image source={{ uri: category.iconUrl }} style={styles.icon} resizeMode="cover" />
              ) : (
                <Text style={[{ color: theme.colors.text.primary }, styles.emoji]}>{CATEGORY_EMOJI[category.slug] ?? '🍽️'}</Text>
              )}
            </View>
            <Text
              style={[
                theme.text.h4,
                styles.label,
                { color: isActive ? theme.colors.text.brand : theme.colors.text.primary },
              ]}
              numberOfLines={2}
            >
              {category.name}
            </Text>
            <ChevronRight size={16} color={theme.colors.text.tertiary} strokeWidth={2.4} />
          </PressableScale>
        );
      })}
    </View>
  );
};

export default CategoryGrid;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: theme.layout.screenPadding,
      gap: theme.spacing.md,
    },
    tile: {
      width: '47.9%',
      flexGrow: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radius.xxl,
      backgroundColor: theme.colors.surface.raised,
      borderWidth: 1.5,
      borderColor: 'transparent',
      ...theme.elevation.sm,
    },
    skeletonTile: {
      height: 72,
    },
    tileActive: {
      borderColor: theme.colors.borders.brand,
      backgroundColor: theme.colors.surface.brandWash,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface.brandWash,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      width: '100%',
      height: '100%',
    },
    emoji: {
      fontSize: 24,
    },
    label: {
      flex: 1,
    },
  });
