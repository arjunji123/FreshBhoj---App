import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Bookmark, Heart, Plus, Share2, Store } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import { VerifiedBadge } from '@components/ui';
import FoodTypeDot from '@components/ui/FoodTypeDot';
import type { Reel } from '@api/types';

interface ReelCardProps {
  reel: Reel;
  height: number;
  isActive: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onOpenKitchen: () => void;
  onOpenMeal: () => void;
  onAddToCart: () => void;
  onView: (reelId: string) => void;
}

/**
 * One full-screen reel.
 *
 * The differentiator versus a plain video feed is the shoppable card: a reel
 * tied to a meal carries its price, veg marker and calories, and an Add button
 * that puts it in the cart without leaving the feed.
 *
 * The video itself renders as its poster frame — `react-native-video` is not a
 * dependency yet, so this shows the thumbnail and keeps every other behaviour
 * (paging, likes, saves, shoppable CTA, view counting) real and testable.
 */
const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  height,
  isActive,
  onLike,
  onSave,
  onShare,
  onOpenKitchen,
  onOpenMeal,
  onAddToCart,
  onView,
}) => {
  useEffect(() => {
    // Counted once per time the reel becomes the active page.
    if (isActive) onView(reel.id);
  }, [isActive, reel.id, onView]);

  return (
    <View style={[styles.container, { height }]}>
      {reel.thumbnailUrl ? (
        <Image
          source={{ uri: reel.thumbnailUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.fallback]} />
      )}

      <LinearGradient
        colors={['rgba(15,23,42,0.45)', 'transparent', 'rgba(15,23,42,0.85)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Right action rail ─────────────────────────────────────── */}
      <View style={styles.rail}>
        <Action
          icon={
            <Heart
              size={26}
              color={reel.isLiked ? theme.colors.primary[500] : theme.colors.text.inverse}
              fill={reel.isLiked ? theme.colors.primary[500] : 'transparent'}
              strokeWidth={2.2}
            />
          }
          label={reel.stats.likesLabel}
          onPress={onLike}
          accessibilityLabel={reel.isLiked ? 'Unlike' : 'Like'}
        />
        <Action
          icon={
            <Bookmark
              size={24}
              color={theme.colors.text.inverse}
              fill={reel.isSaved ? theme.colors.text.inverse : 'transparent'}
              strokeWidth={2.2}
            />
          }
          label="Save"
          onPress={onSave}
          accessibilityLabel={reel.isSaved ? 'Unsave' : 'Save'}
        />
        <Action
          icon={<Share2 size={24} color={theme.colors.text.inverse} strokeWidth={2.2} />}
          label="Share"
          onPress={onShare}
          accessibilityLabel="Share reel"
        />
        <Action
          icon={<Store size={24} color={theme.colors.text.inverse} strokeWidth={2.2} />}
          label="Kitchen"
          onPress={onOpenKitchen}
          accessibilityLabel="Open kitchen"
        />
      </View>

      {/* ── Bottom content ────────────────────────────────────────── */}
      <View style={styles.bottom}>
        <Pressable style={styles.kitchenRow} onPress={onOpenKitchen} accessibilityRole="button">
          {reel.kitchen.logoUrl ? (
            <Image source={{ uri: reel.kitchen.logoUrl }} style={styles.kitchenLogo} />
          ) : (
            <View style={[styles.kitchenLogo, styles.kitchenLogoFallback]} />
          )}
          <Text style={[theme.text.h4, styles.kitchenName]} numberOfLines={1}>
            {reel.kitchen.name}
          </Text>
          {reel.kitchen.isVerified ? <VerifiedBadge /> : null}
        </Pressable>

        {reel.caption ? (
          <Text style={[theme.text.body, styles.caption]} numberOfLines={3}>
            {reel.caption}
          </Text>
        ) : null}

        {reel.hashtags.length ? (
          <Text style={[theme.text.caption, styles.hashtags]} numberOfLines={1}>
            {reel.hashtags.map((tag) => `#${tag}`).join('  ')}
          </Text>
        ) : null}

        {reel.meal ? (
          <Pressable
            style={styles.shopCard}
            onPress={onOpenMeal}
            accessibilityRole="button"
            accessibilityLabel={`Open ${reel.meal.name}`}
          >
            {reel.meal.image ? (
              <Image source={{ uri: reel.meal.image }} style={styles.shopImage} />
            ) : (
              <View style={[styles.shopImage, styles.kitchenLogoFallback]} />
            )}

            <View style={styles.shopText}>
              <View style={styles.shopTitleRow}>
                <FoodTypeDot type={reel.meal.foodType} size={11} />
                <Text style={[theme.text.h4, styles.shopName]} numberOfLines={1}>
                  {reel.meal.name}
                </Text>
              </View>
              <Text style={[theme.text.caption, styles.shopMeta]} numberOfLines={1}>
                {formatCurrency(reel.meal.price)}
                {reel.meal.calories ? ` · ${reel.meal.calories} kcal` : ''}
                {reel.meal.proteinG ? ` · ${Math.round(reel.meal.proteinG)}g protein` : ''}
              </Text>
            </View>

            <Pressable
              onPress={onAddToCart}
              disabled={!reel.meal.isAvailable}
              accessibilityRole="button"
              accessibilityLabel="Add to cart"
              style={({ pressed }) => [
                styles.shopAdd,
                !reel.meal?.isAvailable ? styles.shopAddDisabled : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Plus size={16} color={theme.colors.text.inverse} strokeWidth={3} />
            </Pressable>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const Action: React.FC<{
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
}> = ({ icon, label, onPress, accessibilityLabel }) => (
  <Pressable
    onPress={onPress}
    hitSlop={theme.layout.hitSlop}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={({ pressed }) => [styles.action, pressed ? styles.pressed : null]}
  >
    {icon}
    <Text style={styles.actionLabel}>{label}</Text>
  </Pressable>
);

export default ReelCard;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.colors.neutral[900],
  },
  fallback: {
    backgroundColor: theme.colors.neutral[800],
  },
  rail: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: 190,
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  action: {
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    ...theme.text.caption,
    fontSize: 10,
    color: theme.colors.text.inverse,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
  bottom: {
    position: 'absolute',
    left: theme.layout.screenPadding,
    right: 76,
    bottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  kitchenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  kitchenLogo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: theme.colors.surface.base,
    backgroundColor: theme.colors.neutral[700],
  },
  kitchenLogoFallback: {
    backgroundColor: theme.colors.neutral[700],
  },
  kitchenName: {
    color: theme.colors.text.inverse,
    flexShrink: 1,
  },
  caption: {
    color: theme.colors.text.inverse,
  },
  hashtags: {
    color: theme.colors.primary[200],
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.card,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    marginTop: theme.spacing.sm,
  },
  shopImage: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutral[700],
  },
  shopText: {
    flex: 1,
  },
  shopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  shopName: {
    flexShrink: 1,
    color: theme.colors.text.inverse,
  },
  shopMeta: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  shopAdd: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopAddDisabled: {
    opacity: 0.4,
  },
});
