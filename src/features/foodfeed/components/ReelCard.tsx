import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Bookmark, Heart, Share2, ShoppingBag } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import AddToCartControl from '@components/AddToCartControl';
import AppGradient from '@components/AppGradient';
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
  quantity?: number;
  onChangeQuantity?: (next: number) => void;
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
 * The scrub bar below fakes playback progress against `durationSec` for the
 * same reason — it seeks and loops correctly, it just isn't tied to a decoder.
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
  quantity = 0,
  onChangeQuantity,
  onView,
}) => {
  useEffect(() => {
    // Counted once per time the reel becomes the active page.
    if (isActive) onView(reel.id);
  }, [isActive, reel.id, onView]);

  const durationMs = Math.max((reel.durationSec || 15) * 1000, 1000);
  const [progress, setProgress] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const progressRef = useRef(0);
  const barWidthRef = useRef(0);

  // Reset to the start every time this card stops being the one on screen.
  useEffect(() => {
    if (!isActive) {
      progressRef.current = 0;
      setProgress(0);
    }
  }, [isActive]);

  // Ticks progress forward while active; pauses the instant the user grabs the bar.
  useEffect(() => {
    if (!isActive || seeking) return;
    let startedAt = Date.now() - progressRef.current * durationMs;
    const id = setInterval(() => {
      let next = (Date.now() - startedAt) / durationMs;
      if (next >= 1) {
        next = 0;
        startedAt = Date.now();
      }
      progressRef.current = next;
      setProgress(next);
    }, 100);
    return () => clearInterval(id);
  }, [isActive, seeking, durationMs]);

  const seekTo = (locationX: number) => {
    const width = barWidthRef.current;
    if (!width) return;
    const next = Math.min(Math.max(locationX / width, 0), 1);
    progressRef.current = next;
    setProgress(next);
  };

  const seekResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setSeeking(true);
        seekTo(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => seekTo(evt.nativeEvent.locationX),
      onPanResponderRelease: () => setSeeking(false),
      onPanResponderTerminate: () => setSeeking(false),
    }),
  ).current;

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
          gradient
          icon={
            <Heart
              size={22}
              color={theme.colors.text.inverse}
              fill={reel.isLiked ? theme.colors.text.inverse : 'transparent'}
              strokeWidth={2.2}
            />
          }
          label={reel.stats.likesLabel}
          onPress={onLike}
          accessibilityLabel={reel.isLiked ? 'Unlike' : 'Like'}
        />
        {reel.meal ? (
          <Action
            gradient
            icon={<ShoppingBag size={20} color={theme.colors.text.inverse} strokeWidth={2.2} />}
            label="Add"
            onPress={onAddToCart}
            accessibilityLabel="Add to cart"
          />
        ) : null}
        <Action
          gradient
          icon={<Share2 size={20} color={theme.colors.text.inverse} strokeWidth={2.2} />}
          label="Share"
          onPress={onShare}
          accessibilityLabel="Share reel"
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

            <AddToCartControl
              quantity={onChangeQuantity ? quantity : 0}
              onAdd={onAddToCart}
              onChangeQuantity={onChangeQuantity ?? (() => {})}
              disabled={!reel.meal.isAvailable}
              size="md"
            />
          </Pressable>
        ) : null}
      </View>

      {/* ── Scrub bar — how much of the reel is left, drag to seek ──── */}
      <View
        style={styles.progressHitArea}
        onLayout={(e: LayoutChangeEvent) => {
          barWidthRef.current = e.nativeEvent.layout.width;
        }}
        {...seekResponder.panHandlers}
      >
        <View style={styles.progressTrack}>
          <AppGradient
            colors={theme.colors.gradients.brand}
            locations={theme.colors.gradients.brandLocations}
            direction="horizontal"
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
        <View
          style={[
            styles.progressThumb,
            seeking ? styles.progressThumbActive : null,
            { left: `${progress * 100}%` },
          ]}
        />
      </View>
    </View>
  );
};

const Action: React.FC<{
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  gradient?: boolean;
}> = ({ icon, label, onPress, accessibilityLabel, gradient = false }) => (
  <Pressable
    onPress={onPress}
    hitSlop={theme.layout.hitSlop}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={({ pressed }) => [styles.action, pressed ? styles.pressed : null]}
  >
    {gradient ? (
      <AppGradient
        colors={theme.colors.gradients.brand}
        locations={theme.colors.gradients.brandLocations}
        direction="diagonal"
        style={styles.actionCircle}
      >
        {icon}
      </AppGradient>
    ) : (
      icon
    )}
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
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.sm,
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
  progressHitArea: {
    position: 'absolute',
    left: theme.layout.screenPadding,
    right: theme.layout.screenPadding,
    bottom: theme.spacing.sm,
    height: 24,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 3,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.pill,
  },
  progressThumb: {
    position: 'absolute',
    top: '50%',
    width: 11,
    height: 11,
    borderRadius: 6,
    marginTop: -5.5,
    marginLeft: -5.5,
    backgroundColor: theme.colors.text.inverse,
    ...theme.elevation.xs,
  },
  progressThumbActive: {
    width: 15,
    height: 15,
    borderRadius: 8,
    marginTop: -7.5,
    marginLeft: -7.5,
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
});
