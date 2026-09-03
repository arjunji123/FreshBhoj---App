import React from 'react';
import { Image, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Clock, Heart, Plus } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import type { MealCard as MealCardType } from '@api/types';
import Badge from './ui/Badge';
import FoodTypeDot from './ui/FoodTypeDot';
import NutritionBadgeRow from './ui/NutritionBadge';
import { GOAL_TAG_LABELS } from '@utils/labels';

interface MealCardProps {
  meal: MealCardType;
  onPress?: () => void;
  onAdd?: () => void;
  onToggleFavorite?: () => void;
  /** `list` is the full-width feed row; `compact` is the horizontal rail. */
  layout?: 'list' | 'compact';
  style?: StyleProp<ViewStyle>;
}

/**
 * The meal card, shared by the Home feed, Search results and kitchen menus.
 *
 * Nutrition sits directly under the name rather than buried in the detail page —
 * calories and protein at a glance is the product's core promise, so it gets
 * prime vertical space on every card.
 */
const MealCard: React.FC<MealCardProps> = ({
  meal,
  onPress,
  onAdd,
  onToggleFavorite,
  layout = 'list',
  style,
}) => {
  const isCompact = layout === 'compact';
  const unavailable = !meal.isOrderable;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={meal.name}
      style={({ pressed }) => [
        styles.card,
        isCompact ? styles.cardCompact : null,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      <View style={[styles.imageWrap, isCompact ? styles.imageWrapCompact : null]}>
        {meal.image ? (
          <Image source={{ uri: meal.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imageFallback]} />
        )}

        {meal.isBestseller ? (
          <View style={styles.bestsellerTag}>
            <Text style={styles.bestsellerText}>BESTSELLER</Text>
          </View>
        ) : null}

        {onToggleFavorite ? (
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={theme.layout.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={meal.isFavorite ? 'Remove from favourites' : 'Add to favourites'}
            style={styles.favoriteButton}
          >
            <Heart
              size={15}
              color={meal.isFavorite ? theme.colors.primary[600] : theme.colors.neutral[400]}
              fill={meal.isFavorite ? theme.colors.primary[600] : 'transparent'}
              strokeWidth={2.2}
            />
          </Pressable>
        ) : null}

        {unavailable ? (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>
              {meal.isAvailable ? 'Kitchen closed' : 'Unavailable'}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.body, isCompact ? styles.bodyCompact : null]}>
        <View style={styles.titleRow}>
          <FoodTypeDot type={meal.foodType} size={13} />
          <Text style={[theme.text.h4, styles.name]} numberOfLines={isCompact ? 1 : 2}>
            {meal.name}
          </Text>
        </View>

        <Text style={[theme.text.bodySmall, styles.kitchen]} numberOfLines={1}>
          {meal.kitchen.name}
          {meal.rating > 0 ? '  ·  ' : ''}
          {meal.rating > 0 ? `★ ${meal.rating.toFixed(1)}` : ''}
        </Text>

        <NutritionBadgeRow
          calories={meal.nutrition.calories}
          proteinG={meal.nutrition.proteinG}
          style={styles.nutrition}
        />

        {!isCompact && meal.goalTags.length ? (
          <View style={styles.tagRow}>
            {meal.goalTags.slice(0, 2).map((tag) => (
              <Badge key={tag} label={GOAL_TAG_LABELS[tag] ?? tag} tone="accent" />
            ))}
            {meal.prepTimeMins ? (
              <Badge
                label={`${meal.prepTimeMins} min`}
                tone="neutral"
                icon={<Clock size={11} color={theme.colors.neutral[600]} strokeWidth={2.4} />}
              />
            ) : null}
          </View>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.priceWrap}>
            <Text style={[theme.text.numeric, styles.price]}>{formatCurrency(meal.price)}</Text>
            {meal.mrp && meal.mrp > meal.price ? (
              <Text style={[theme.text.bodySmall, styles.mrp]}>{formatCurrency(meal.mrp)}</Text>
            ) : null}
          </View>

          {onAdd ? (
            <Pressable
              onPress={onAdd}
              disabled={unavailable}
              accessibilityRole="button"
              accessibilityLabel={`Add ${meal.name} to cart`}
              style={({ pressed }) => [
                styles.addButton,
                unavailable ? styles.addButtonDisabled : null,
                pressed ? styles.addButtonPressed : null,
              ]}
            >
              <Plus size={14} color={theme.colors.primary[600]} strokeWidth={3} />
              <Text style={[theme.text.buttonSmall, styles.addText]}>ADD</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

export default MealCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.raised,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.elevation.sm,
  },
  cardCompact: {
    flexDirection: 'column',
    width: 168,
    gap: theme.spacing.sm,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  imageWrap: {
    width: 112,
    height: 112,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.neutral[100],
  },
  imageWrapCompact: {
    width: '100%',
    height: 110,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    backgroundColor: theme.colors.neutral[200],
  },
  bestsellerTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: theme.colors.amber[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  bestsellerText: {
    ...theme.text.caption,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0.4,
    color: theme.colors.text.inverse,
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.xs,
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableText: {
    ...theme.text.caption,
    color: theme.colors.text.inverse,
    textAlign: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bodyCompact: {
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  name: {
    flex: 1,
    color: theme.colors.text.primary,
  },
  kitchen: {
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  nutrition: {
    marginTop: theme.spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    color: theme.colors.text.primary,
  },
  mrp: {
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    height: 34,
    borderRadius: theme.radius.control,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.brand,
    backgroundColor: theme.colors.surface.brandWash,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  addText: {
    color: theme.colors.primary[600],
    letterSpacing: 0.5,
  },
});
