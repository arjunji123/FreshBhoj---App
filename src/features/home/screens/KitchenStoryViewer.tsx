import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Share2, ShoppingBag, X } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import FocusAwareStatusBar from '@components/FocusAwareStatusBar';
import type { StoryItem } from '@api/types';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import { useMarkStorySeen, useRegisterStoryShare, useToggleStoryLike } from '../hooks/useHomeFeed';

type Route = RouteProp<PrivateStackParamList, 'KitchenStoryViewer'>;

/**
 * Full-screen Kitchen Story viewer — tap right/left to advance/rewind within
 * this one kitchen's stories, auto-advancing on a per-story timer. Opened
 * from the Home rail; closing (or running out of stories) goes back there.
 *
 * Video stories fall back to their thumbnail — there's no video player
 * anywhere in the app yet (FoodFeed/Reels have the same limitation).
 */
const KitchenStoryViewer = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<Route>();

  const [items, setItems] = useState<StoryItem[]>(params.items);
  const [index, setIndex] = useState(Math.min(params.initialIndex ?? 0, params.items.length - 1));

  const markSeen = useMarkStorySeen();
  const toggleLike = useToggleStoryLike();
  const registerShare = useRegisterStoryShare();
  const { addToCart, conflictDialog } = useAddToCartFlow();

  const current = items[index];
  const progress = useRef(new Animated.Value(0)).current;

  const goNext = useCallback(() => {
    setIndex((i) => {
      if (i + 1 >= items.length) {
        navigation.goBack();
        return i;
      }
      return i + 1;
    });
  }, [items.length, navigation]);

  useEffect(() => {
    if (!current) {
      navigation.goBack();
      return;
    }
    if (!current.isSeen) {
      markSeen.mutate(current.id);
      setItems((prev) => prev.map((it) => (it.id === current.id ? { ...it, isSeen: true } : it)));
    }

    progress.setValue(0);
    const durationMs = Math.max(current.durationSec, 3) * 1000;
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) goNext();
    });

    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  const handleLike = () => {
    if (!current) return;
    const wasLiked = current.isLiked;
    const storyId = current.id;
    setItems((prev) =>
      prev.map((it) =>
        it.id === storyId
          ? { ...it, isLiked: !wasLiked, likeCount: it.likeCount + (wasLiked ? -1 : 1) }
          : it,
      ),
    );
    toggleLike.mutate(storyId, {
      onSuccess: (result) => {
        setItems((prev) =>
          prev.map((it) =>
            it.id === storyId ? { ...it, isLiked: result.isLiked, likeCount: result.likeCount } : it,
          ),
        );
      },
      onError: () => {
        setItems((prev) =>
          prev.map((it) =>
            it.id === storyId
              ? { ...it, isLiked: wasLiked, likeCount: it.likeCount + (wasLiked ? 1 : -1) }
              : it,
          ),
        );
      },
    });
  };

  const handleShare = async () => {
    if (!current) return;
    registerShare.mutate(current.id);
    try {
      await Share.share({
        message:
          `${params.kitchenName} on FreshBhoj` +
          `${current.caption ? ` — ${current.caption}` : ''}\n` +
          `https://freshbhoj.com/kitchens/${params.kitchenId}`,
      });
    } catch {
      // Ignored — a dismissed share sheet isn't an error.
    }
  };

  const handleOrderNow = () => {
    if (!current?.meal) return;
    addToCart(
      {
        id: current.meal.id,
        name: current.meal.name,
        isOrderable: true,
        image: current.meal.image,
        price: current.meal.price,
        foodType: current.meal.foodType,
        kitchen: { id: params.kitchenId, name: params.kitchenName },
      },
      { sourceStoryId: current.id },
      { onSuccess: () => navigation.navigate('Cart') },
    );
  };

  if (!current) return null;

  return (
    <View style={styles.screen}>
      <FocusAwareStatusBar barStyle="light-content" />

      <Image
        source={{ uri: current.thumbnailUrl ?? current.mediaUrl }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <View style={styles.scrim} pointerEvents="none" />

      <View style={[styles.progressRow, { top: insets.top + theme.spacing.sm }]}>
        {items.map((item, i) => (
          <View key={item.id} style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                i < index
                  ? { width: '100%' }
                  : i === index
                  ? { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }
                  : { width: '0%' },
              ]}
            />
          </View>
        ))}
      </View>

      <View style={[styles.header, { top: insets.top + theme.spacing.lg }]}>
        <Text style={styles.kitchenName} numberOfLines={1}>
          {params.kitchenName}
        </Text>
        <Pressable
          onPress={navigation.goBack}
          hitSlop={theme.layout.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={22} color={theme.colors.text.inverse} strokeWidth={2.4} />
        </Pressable>
      </View>

      <Pressable style={styles.tapLeft} onPress={goPrev} accessibilityLabel="Previous story" />
      <Pressable style={styles.tapRight} onPress={goNext} accessibilityLabel="Next story" />

      {current.caption ? (
        <View style={[styles.captionWrap, { bottom: (current.meal ? 150 : 90) + insets.bottom }]}>
          <Text style={styles.caption}>{current.caption}</Text>
        </View>
      ) : null}

      <View style={[styles.actions, { bottom: (current.meal ? 220 : 160) + insets.bottom }]}>
        <Pressable onPress={handleLike} style={styles.actionButton} accessibilityLabel="Like this story">
          <Heart
            size={22}
            color={current.isLiked ? '#FF6B6B' : theme.colors.text.inverse}
            fill={current.isLiked ? '#FF6B6B' : 'transparent'}
            strokeWidth={2.2}
          />
          <Text style={styles.actionLabel}>{current.likeCount}</Text>
        </Pressable>
        <Pressable onPress={handleShare} style={styles.actionButton} accessibilityLabel="Share this story">
          <Share2 size={20} color={theme.colors.text.inverse} strokeWidth={2.2} />
          <Text style={styles.actionLabel}>{current.shareCount}</Text>
        </Pressable>
      </View>

      {current.meal ? (
        <Pressable
          style={[styles.mealCard, { bottom: insets.bottom + theme.spacing.lg }]}
          onPress={handleOrderNow}
          accessibilityRole="button"
          accessibilityLabel={`Order ${current.meal.name}`}
        >
          {current.meal.image ? (
            <Image source={{ uri: current.meal.image }} style={styles.mealImage} />
          ) : (
            <View style={[styles.mealImage, styles.mealImageFallback]} />
          )}
          <View style={styles.mealInfo}>
            <Text style={styles.mealName} numberOfLines={1}>
              {current.meal.name}
            </Text>
            <Text style={styles.mealPrice}>{formatCurrency(current.meal.price)}</Text>
          </View>
          <View style={styles.orderButton}>
            <ShoppingBag size={13} color={theme.colors.text.inverse} strokeWidth={2.4} />
            <Text style={styles.orderButtonText}>Order Now</Text>
          </View>
        </Pressable>
      ) : null}

      {conflictDialog}
    </View>
  );
};

export default KitchenStoryViewer;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  progressRow: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    gap: 4,
  },
  progressTrack: {
    flex: 1,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.palette.white,
    borderRadius: 2,
  },
  header: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kitchenName: {
    ...theme.text.h4,
    color: theme.colors.text.inverse,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  tapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '35%',
  },
  tapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '65%',
  },
  captionWrap: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  caption: {
    ...theme.text.bodyMedium,
    color: theme.colors.text.inverse,
  },
  actions: {
    position: 'absolute',
    right: theme.spacing.lg,
    gap: theme.spacing.lg,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    gap: 3,
  },
  actionLabel: {
    ...theme.text.caption,
    color: theme.colors.text.inverse,
    fontWeight: '700',
  },
  mealCard: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.radius.card,
    padding: theme.spacing.sm,
    ...theme.elevation.md,
  },
  mealImage: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
  },
  mealImageFallback: {
    backgroundColor: theme.colors.neutral[200],
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    ...theme.text.bodyMedium,
    color: theme.colors.text.primary,
  },
  mealPrice: {
    ...theme.text.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
  },
  orderButtonText: {
    ...theme.text.caption,
    color: theme.colors.text.inverse,
    fontWeight: '700',
  },
});
