import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Share, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clapperboard } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Chip, EmptyState, Skeleton } from '@components/ui';
import FocusAwareStatusBar from '@components/FocusAwareStatusBar';
import type { Reel } from '@api/types';
import type { ReelFeedType } from '@api/endpoints/reels.api';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import ReelCard from '../components/ReelCard';
import {
  recordReelShare,
  recordReelView,
  useReelFeed,
  useToggleReelLike,
  useToggleReelSave,
} from '../hooks/useReels';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FEEDS: Array<{ key: ReelFeedType; label: string }> = [
  { key: 'for_you', label: 'For You' },
  { key: 'trending', label: 'Trending' },
  { key: 'following', label: 'Following' },
];

/**
 * The Food Feed — vertical, full-screen, shoppable reels.
 *
 * This is the piece Swiggy and Zomato don't have wired to the cart: every reel
 * can carry the exact dish being cooked, so discovery and ordering are the same
 * gesture instead of two separate journeys.
 */
const FoodFeed = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const insets = useSafeAreaInsets();
  const [feed, setFeed] = useState<ReelFeedType>('for_you');
  const [activeIndex, setActiveIndex] = useState(0);

  const query = useReelFeed(feed);
  const toggleLike = useToggleReelLike();
  const toggleSave = useToggleReelSave();
  const { addToCart, conflictDialog } = useAddToCartFlow();

  const reels = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  // Full-bleed pages: the tab bar overlays the video rather than shrinking it.
  const pageHeight = SCREEN_HEIGHT;

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
      message: `${reel.kitchen.name} on FreshBhoj${reel.meal ? ` — ${reel.meal.name}` : ''}\nhttps://freshbhoj.com/reels/${reel.id}`,
    }).catch(() => undefined);
  }, []);

  if (query.isLoading) {
    return (
      <View style={styles.screen}>
        <FocusAwareStatusBar barStyle="light-content" />
        <Skeleton height={pageHeight} radius={0} />
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
        snapToInterval={pageHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: pageHeight,
          offset: pageHeight * index,
          index,
        })}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
        }}
        ListEmptyComponent={
          <View style={[styles.empty, { height: pageHeight }]}>
            <EmptyState
              icon={<Clapperboard size={36} color={theme.colors.primary[600]} strokeWidth={1.8} />}
              title={feed === 'following' ? 'Nothing from your kitchens yet' : 'No reels yet'}
              description={
                feed === 'following'
                  ? 'Follow a kitchen and their behind-the-scenes clips show up here.'
                  : 'Our kitchens are filming. Check back shortly.'
              }
              actionLabel={feed === 'following' ? 'Discover kitchens' : undefined}
              onAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <ReelCard
            reel={item}
            height={pageHeight}
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
              })
            }
          />
        )}
      />

      {/* Feed switcher floats over the video, like every reels UI. */}
      <View style={[styles.tabs, { top: insets.top + theme.spacing.md }]} pointerEvents="box-none">
        {FEEDS.map((option) => (
          <Chip
            key={option.key}
            label={option.label}
            selected={feed === option.key}
            onPress={() => {
              setFeed(option.key);
              setActiveIndex(0);
            }}
            style={feed === option.key ? undefined : styles.tabIdle}
          />
        ))}
      </View>

      {conflictDialog}
    </View>
  );
};

export default FoodFeed;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
  },
  tabs: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  tabIdle: {
    backgroundColor: 'rgba(15,23,42,0.45)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  empty: {
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.page,
  },
});
