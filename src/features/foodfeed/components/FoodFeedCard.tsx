import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Heart, Share2, Volume2, VolumeX } from 'lucide-react-native';
import { Badge, VerifiedBadge } from '@components/ui';
import AddToCartControl from '@components/AddToCartControl';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import type { Reel } from '@api/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MEDIA_HEIGHT = SCREEN_WIDTH * 1.25;

const FOOD_TYPE_LABEL: Record<string, string> = {
  VEG: 'Veg',
  VEGAN: 'Vegan',
  EGG: 'Egg',
  NON_VEG: 'Non-Veg',
};

interface FoodFeedCardProps {
  reel: Reel;
  muted: boolean;
  onToggleMute: () => void;
  onPress: () => void;
  onLike: () => void;
  onShare: () => void;
  onAddToCart: () => void;
  quantity?: number;
  onChangeQuantity?: (next: number) => void;
}

/**
 * One row of the scrollable Food Feed — a preview, not the player. Tapping it
 * opens `ReelViewer` for the full-screen, swipe-through experience; this card
 * only needs to earn that tap (thumbnail, dish, kitchen) plus the two actions
 * (like, add to cart) worth taking without leaving the list.
 */
const FoodFeedCard: React.FC<FoodFeedCardProps> = ({
  reel,
  muted,
  onToggleMute,
  onPress,
  onLike,
  onShare,
  onAddToCart,
  quantity = 0,
  onChangeQuantity,
}) => {
  const foodTypeColor = reel.meal ? theme.colors.foodType[reel.meal.foodType] ?? theme.colors.foodType.VEG : null;
  const title = reel.meal?.name ?? reel.caption ?? reel.kitchen.name;

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${title}`}>
        <View style={styles.media}>
          {reel.thumbnailUrl ? (
            <Image source={{ uri: reel.thumbnailUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, styles.fallback]} />
          )}

          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(15,23,42,0.85)']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          <Pressable
            onPress={onToggleMute}
            hitSlop={theme.layout.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={muted ? 'Unmute' : 'Mute'}
            style={styles.muteButton}
          >
            {muted ? (
              <VolumeX size={15} color={theme.colors.text.inverse} strokeWidth={2.2} />
            ) : (
              <Volume2 size={15} color={theme.colors.text.inverse} strokeWidth={2.2} />
            )}
          </Pressable>

          {reel.meal ? (
            <View style={styles.badgeRow}>
              <View style={[styles.foodTypePill, { backgroundColor: foodTypeColor ?? undefined }]}>
                <Text style={styles.foodTypePillText}>{FOOD_TYPE_LABEL[reel.meal.foodType] ?? 'Veg'}</Text>
              </View>
              <Badge label={formatCurrency(reel.meal.price)} tone="brand" variant="solid" size="sm" />
            </View>
          ) : null}

          <View style={styles.captionOverlay}>
            <Text style={[theme.text.h3, styles.title]} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.kitchenRow}>
              <Text style={[theme.text.caption, styles.kitchenName]} numberOfLines={1}>
                {reel.kitchen.name}
              </Text>
              {reel.kitchen.isVerified ? <VerifiedBadge size={12} showLabel={false} /> : null}
            </View>
          </View>
        </View>
      </Pressable>

      <View style={styles.footer}>
        <Pressable onPress={onLike} hitSlop={theme.layout.hitSlop} style={styles.statButton} accessibilityRole="button" accessibilityLabel={reel.isLiked ? 'Unlike' : 'Like'}>
          <Heart
            size={18}
            color={reel.isLiked ? theme.colors.primary[600] : theme.colors.text.secondary}
            fill={reel.isLiked ? theme.colors.primary[600] : 'transparent'}
            strokeWidth={2.2}
          />
          <Text style={styles.statText}>{reel.stats.likesLabel}</Text>
        </Pressable>

        <Pressable onPress={onShare} hitSlop={theme.layout.hitSlop} style={styles.statButton} accessibilityRole="button" accessibilityLabel="Share">
          <Share2 size={17} color={theme.colors.text.secondary} strokeWidth={2.2} />
          <Text style={styles.statText}>{reel.stats.shares}</Text>
        </Pressable>

        <View style={styles.footerSpacer} />

        {reel.meal ? (
          <AddToCartControl
            quantity={onChangeQuantity ? quantity : 0}
            onAdd={onAddToCart}
            onChangeQuantity={onChangeQuantity ?? (() => {})}
            disabled={!reel.meal.isAvailable}
            variant="pill"
          />
        ) : null}
      </View>
    </View>
  );
};

export default FoodFeedCard;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.lg,
  },
  media: {
    width: '100%',
    height: MEDIA_HEIGHT,
    backgroundColor: theme.colors.neutral[900],
    overflow: 'hidden',
  },
  fallback: {
    backgroundColor: theme.colors.neutral[800],
  },
  muteButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    position: 'absolute',
    left: theme.spacing.md,
    bottom: 76,
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  foodTypePill: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  foodTypePillText: {
    ...theme.text.caption,
    color: theme.colors.text.inverse,
    fontWeight: '700' as const,
  },
  captionOverlay: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.text.inverse,
  },
  kitchenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  kitchenName: {
    color: 'rgba(255,255,255,0.85)',
    flexShrink: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.sm,
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    ...theme.text.label,
    color: theme.colors.text.secondary,
  },
  footerSpacer: {
    flex: 1,
  },
});
