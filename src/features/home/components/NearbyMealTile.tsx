import React, { useMemo } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart, MapPin } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import PressableScale from '@animations/PressableScale';
import { theme as staticTheme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import AddToCartControl from '@components/AddToCartControl';
import { RatingPill } from '@components/ui/Rating';
import FoodTypeDot from '@components/ui/FoodTypeDot';
import type { NearbyMealCard } from '@api/types';
import { useTheme } from "@app/theme/useTheme";

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = staticTheme.spacing.lg;
const CARD_WIDTH = (SCREEN_WIDTH - staticTheme.layout.screenPadding * 2 - CARD_GAP) / 2;

interface NearbyMealTileProps {
  meal: NearbyMealCard;
  onPress: () => void;
  onAdd: () => void;
  quantity?: number;
  onChangeQuantity?: (next: number) => void;
  onToggleFavorite: () => void;
}

/**
 * The 2-column "Trending Near You" grid tile — deliberately its own small
 * component rather than `MealCard`'s `compact` layout, since the rating badge
 * overlays the photo here and the kitchen line shows real distance, which no
 * other meal card in the app needs.
 */
/** Text over photography stays white in both themes. */
const ON_PHOTO = staticTheme.colors.palette.white;

const NearbyMealTile: React.FC<NearbyMealTileProps> = ({
  meal,
  onPress,
  onAdd,
  quantity = 0,
  onChangeQuantity,
  onToggleFavorite,
}) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const unavailable = !meal.isOrderable;

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.975}
      haptic={false}
      accessibilityRole="button"
      accessibilityLabel={meal.name}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        {meal.image ? (
          <Image source={{ uri: meal.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imageFallback]} />
        )}
        <LinearGradient
          colors={theme.colors.overlay.imageFade}
          locations={[0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.ratingSlot}>
          <RatingPill value={meal.rating} variant="solid" />
        </View>
        <View style={styles.foodType}>
          <FoodTypeDot type={meal.foodType} size={11} />
        </View>
        <View style={styles.distancePill}>
          <MapPin size={10} color={ON_PHOTO} strokeWidth={2.6} />
          <Text style={styles.distanceText} numberOfLines={1}>
            {meal.distanceLabel}
          </Text>
        </View>
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
        <Text style={[theme.text.h4, styles.name]} numberOfLines={1}>
          {meal.name}
        </Text>

        <Text style={[theme.text.caption, styles.meta]} numberOfLines={1}>
          {meal.kitchen.name}
        </Text>

        <View style={styles.footer}>
          <Text style={[{ color: theme.colors.text.primary }, theme.text.numeric]}>{formatCurrency(meal.price)}</Text>
          <AddToCartControl
            quantity={onChangeQuantity ? quantity : 0}
            onAdd={onAdd}
            onChangeQuantity={onChangeQuantity ?? (() => {})}
            disabled={unavailable}
          />
        </View>
      </View>
    </PressableScale>
  );
};

export default NearbyMealTile;
export { CARD_WIDTH };

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
      card: {
        width: CARD_WIDTH,
        backgroundColor: theme.colors.surface.raised,
        borderRadius: theme.radius.xxl,
        overflow: 'hidden',
        ...theme.elevation.md,
      },
      ratingSlot: {
        position: 'absolute',
        top: theme.spacing.sm,
        left: theme.spacing.sm,
      },
      foodType: {
        position: 'absolute',
        right: theme.spacing.sm,
        bottom: theme.spacing.sm,
        padding: 3,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.surface.base,
      },
      distancePill: {
        position: 'absolute',
        left: theme.spacing.sm,
        bottom: theme.spacing.sm,
        maxWidth: '65%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.overlay.scrimSoft,
        borderWidth: 1,
        borderColor: theme.colors.overlay.glass,
      },
      distanceText: {
        ...theme.text.caption,
        fontSize: 10,
        lineHeight: 13,
        color: ON_PHOTO,
      },
      imageContainer: {
        width: '100%',
        height: 128,
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
        padding: theme.spacing.md,
        gap: 2,
      },
      name: {
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
    });
