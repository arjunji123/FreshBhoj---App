import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart, Plus } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import { RatingPill } from '@components/ui/Rating';
import FoodTypeDot from '@components/ui/FoodTypeDot';
import type { NearbyMealCard } from '@api/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = theme.spacing.lg;
const CARD_WIDTH = (SCREEN_WIDTH - theme.layout.screenPadding * 2 - CARD_GAP) / 2;

interface NearbyMealTileProps {
  meal: NearbyMealCard;
  onPress: () => void;
  onAdd: () => void;
  onToggleFavorite: () => void;
}

/**
 * The 2-column "Trending Near You" grid tile — deliberately its own small
 * component rather than `MealCard`'s `compact` layout, since the rating badge
 * overlays the photo here and the kitchen line shows real distance, which no
 * other meal card in the app needs.
 */
const NearbyMealTile: React.FC<NearbyMealTileProps> = ({ meal, onPress, onAdd, onToggleFavorite }) => {
  const unavailable = !meal.isOrderable;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={meal.name}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.imageContainer}>
        {meal.image ? (
          <Image source={{ uri: meal.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imageFallback]} />
        )}
        <Pressable
          style={styles.favoriteButton}
          hitSlop={theme.layout.hitSlop}
          accessibilityRole="button"
          accessibilityLabel={meal.isFavorite ? 'Remove from favourites' : 'Add to favourites'}
          onPress={onToggleFavorite}
        >
          <Heart
            size={15}
            color={meal.isFavorite ? theme.colors.primary[600] : theme.colors.neutral[400]}
            fill={meal.isFavorite ? theme.colors.primary[600] : 'transparent'}
          />
        </Pressable>
        {unavailable ? (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>
              {meal.isAvailable ? 'Kitchen closed' : 'Unavailable'}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <FoodTypeDot type={meal.foodType} size={11} />
          <Text style={[theme.text.h4, styles.name]} numberOfLines={1}>
            {meal.name}
          </Text>
          <RatingPill value={meal.rating} variant="solid" />
        </View>

        <Text style={[theme.text.caption, styles.meta]} numberOfLines={1}>
          {meal.kitchen.name} · {meal.distanceLabel}
        </Text>

        <View style={styles.footer}>
          <Text style={theme.text.numeric}>{formatCurrency(meal.price)}</Text>
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
            <Plus size={16} color={theme.colors.text.inverse} strokeWidth={2.6} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

export default NearbyMealTile;
export { CARD_WIDTH };

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.surface.raised,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    ...theme.elevation.sm,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    width: '100%',
    height: 110,
    backgroundColor: theme.colors.neutral[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    backgroundColor: theme.colors.neutral[200],
  },
  favoriteButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.surface.base,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: theme.spacing.sm,
  },
  content: {
    padding: theme.spacing.sm,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    flex: 1,
    color: theme.colors.text.primary,
  },
  meta: {
    color: theme.colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonPressed: {
    transform: [{ scale: 0.92 }],
  },
});
