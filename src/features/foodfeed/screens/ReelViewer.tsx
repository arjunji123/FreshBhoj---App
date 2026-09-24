import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, Share, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Skeleton } from '@components/ui';
import FocusAwareStatusBar from '@components/FocusAwareStatusBar';
import { qk, reelsApi } from '@api';
import type { Reel } from '@api/types';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import ReelCard from '../components/ReelCard';
import {
  recordReelShare,
  recordReelView,
  useReelFeed,
  useToggleReelLike,
  useToggleReelSave,
} from '../hooks/useReels';

type Route = RouteProp<PrivateStackParamList, 'ReelViewer'>;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Full-screen reel player opened from a rail or a deep link.
 *
 * Same card as the Food Feed tab, but it starts on the requested reel and can
 * be scoped to one kitchen — so "watch how this dish is made" from the Home
 * rail lands you exactly there, still able to keep scrolling.
 */
const ReelViewer = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<Route>();

  const query = useReelFeed(params.feed ?? 'for_you', params.kitchenId, params.cuisineId);
  const toggleLike = useToggleReelLike();
  const toggleSave = useToggleReelSave();
  const { addToCart, conflictDialog } = useAddToCartFlow();

  // The feed's first page (`limit: 6`) may not contain the exact reel this
  // viewer was opened for — fetch it directly so the right one always opens,
  // regardless of which filtered feed it was tapped from.
  const targetReelQuery = useQuery({
    queryKey: qk.reels.detail(params.reelId ?? ''),
    queryFn: () => reelsApi.detail(params.reelId as string),
    enabled: Boolean(params.reelId),
    staleTime: 60_000,
  });

  const reels = useMemo(() => {
    const feedReels = query.data?.pages.flatMap((page) => page.items) ?? [];
    if (!targetReelQuery.data) return feedReels;
    return [targetReelQuery.data, ...feedReels.filter((reel) => reel.id !== targetReelQuery.data!.id)];
  }, [query.data, targetReelQuery.data]);

  // The target reel (when there is one) is always placed first by construction
  // above, so the viewer opens on it without needing to search for its index.
  const [activeIndex, setActiveIndex] = useState(0);
  const isResolvingTarget = Boolean(params.reelId) && !targetReelQuery.data && !targetReelQuery.isError;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      const first = viewableItems[0];
      if (typeof first?.index === 'number') setActiveIndex(first.index);
    },
  ).current;

  const handleShare = useCallback((reel: Reel) => {
    recordReelShare(reel.id);
    Share.share({
      message: `${reel.kitchen.name} on FreshBhoj\nhttps://freshbhoj.com/reels/${reel.id}`,
    }).catch(() => undefined);
  }, []);

  if (isResolvingTarget || (!params.reelId && query.isLoading)) {
    return (
      <View style={styles.screen}>
        <FocusAwareStatusBar barStyle="light-content" />
        <Skeleton height={SCREEN_HEIGHT} radius={0} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FocusAwareStatusBar barStyle="light-content" />

      <FlatList
        data={reels}
        keyExtractor={(reel) => reel.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
        }}
        renderItem={({ item, index }) => (
          <ReelCard
            reel={item}
            height={SCREEN_HEIGHT}
            isActive={index === activeIndex}
            onView={recordReelView}
            onLike={() => toggleLike.mutate(item.id)}
            onSave={() => toggleSave.mutate(item.id)}
            onShare={() => handleShare(item)}
            onOpenKitchen={() =>
              navigation.navigate('KitchenProfile', {
                kitchenId: item.kitchen.id,
                kitchenName: item.kitchen.name,
              })
            }
            onOpenMeal={() =>
              item.meal &&
              navigation.navigate('MealDetail', { mealId: item.meal.id, mealName: item.meal.name })
            }
            onAddToCart={() =>
              item.meal &&
              addToCart({
                id: item.meal.id,
                name: item.meal.name,
                isOrderable: item.meal.isAvailable,
                image: item.meal.image,
                price: item.meal.price,
                mrp: item.meal.mrp,
                foodType: item.meal.foodType,
                calories: item.meal.calories,
                proteinG: item.meal.proteinG,
                isAvailable: item.meal.isAvailable,
                kitchen: item.kitchen,
              })
            }
          />
        )}
      />

      <Pressable
        onPress={navigation.goBack}
        hitSlop={theme.layout.hitSlop}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={[styles.close, { top: insets.top + theme.spacing.md }]}
      >
        <X size={20} color={theme.colors.text.inverse} strokeWidth={2.5} />
      </Pressable>

      {conflictDialog}
    </View>
  );
};

export default ReelViewer;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
  },
  close: {
    position: 'absolute',
    left: theme.layout.screenPadding,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
