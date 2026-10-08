import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Share, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, ArrowLeft, Clapperboard, Search } from 'lucide-react-native';
import AppGradient from '@components/AppGradient';
import { Chip, ChipRow, EmptyState, Screen, Skeleton } from '@components/ui';
import type { Reel } from '@api/types';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import { useCartQuantityControls } from '@features/cart/hooks/useCart';
import { useCuisines } from '@features/home/hooks/useHomeFeed';
import { MINI_CART_BAR_CLEARANCE } from '@components/MiniCartBar';
import FoodFeedCard from '../components/FoodFeedCard';
import {
  recordReelShare,
  recordReelView,
  useReelFeed,
  useToggleReelLike,
} from '../hooks/useReels';
import { useTheme } from "@app/theme/useTheme";

/**
 * Food Feed — a normal scrollable browse list, one reel preview per row.
 *
 * The full-screen swipe-through player (`ReelViewer`) is a tap away, not the
 * default: scrolling here costs nothing (no video takes over the screen),
 * while tapping a card commits to watching it full-screen and continuing from
 * there — the split Instagram's own feed vs. Reels tab makes for the same reason.
 */
const FoodFeed = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const insets = useSafeAreaInsets();
  const [cuisineId, setCuisineId] = useState<string | undefined>(undefined);
  const [muted, setMuted] = useState(true);

  const cuisinesQuery = useCuisines();
  const query = useReelFeed('for_you', undefined, cuisineId);
  const toggleLike = useToggleReelLike();
  const { addToCart, conflictDialog } = useAddToCartFlow();
  const { getQuantity, changeQuantity } = useCartQuantityControls();

  const reels = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ item: Reel }> }) => {
      viewableItems.forEach(({ item }) => recordReelView(item.id));
    },
  ).current;

  const handleShare = useCallback((reel: Reel) => {
    recordReelShare(reel.id);
    Share.share({
      message: `${reel.kitchen.name} on FreshBhoj${reel.meal ? ` — ${reel.meal.name}` : ''}\nhttps://freshbhoj.com/reels/${reel.id}`,
    }).catch(() => undefined);
  }, []);

  const openReel = useCallback(
    (reelId: string) => navigation.navigate('ReelViewer', { reelId, feed: 'for_you', cuisineId }),
    [navigation, cuisineId],
  );

  return (
    <Screen background="page" edges={[]} barStyle="light-content">
      <AppGradient
        colors={theme.colors.gradients.brand}
        locations={theme.colors.gradients.brandLocations}
        direction="vertical"
        style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={theme.layout.hitSlop}
            style={styles.headerIconButton}
          >
            <ArrowLeft size={19} color={theme.colors.text.inverse} strokeWidth={2.5} />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={[theme.text.h3, styles.headerTitle]}>Food Feed</Text>
            <Text style={[theme.text.caption, styles.headerSubtitle]}>Watch what you like</Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate('MainTabs', { screen: 'Search' })}
            accessibilityRole="button"
            accessibilityLabel="Search"
            hitSlop={theme.layout.hitSlop}
            style={styles.headerIconButton}
          >
            <Search size={19} color={theme.colors.text.inverse} strokeWidth={2.2} />
          </Pressable>
        </View>
      </AppGradient>

      <ChipRow style={styles.chipRow}>
        <Chip label="All" selected={!cuisineId} onPress={() => setCuisineId(undefined)} />
        {(cuisinesQuery.data ?? []).map((cuisine) => (
          <Chip
            key={cuisine.id}
            label={cuisine.name}
            selected={cuisineId === cuisine.id}
            onPress={() => setCuisineId(cuisine.id)}
          />
        ))}
      </ChipRow>

      {query.isLoading ? (
        <View style={styles.listPadding}>
          {[0, 1].map((i) => (
            <Skeleton key={i} height={420} radius={0} style={styles.skeletonCard} />
          ))}
        </View>
      ) : query.isError && !reels.length ? (
        <EmptyState
          icon={<AlertCircle size={36} color={theme.colors.state.error} strokeWidth={1.8} />}
          title="Could not load reels"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => query.refetch()}
        />
      ) : (
        <FlatList
          data={reels}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching && !query.isFetchingNextPage}
              onRefresh={() => query.refetch()}
              tintColor={theme.colors.primary[600]}
            />
          }
          keyExtractor={(reel) => reel.id}
          showsVerticalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
          }}
          contentContainerStyle={reels.length ? styles.listContent : styles.emptyContent}
          ListEmptyComponent={
            <EmptyState
              icon={<Clapperboard size={36} color={theme.colors.primary[600]} strokeWidth={1.8} />}
              title="No reels yet"
              description={
                cuisineId
                  ? 'Nothing in this cuisine right now — try another filter.'
                  : 'Our kitchens are filming. Check back shortly.'
              }
              actionLabel={cuisineId ? 'Clear filter' : undefined}
              onAction={cuisineId ? () => setCuisineId(undefined) : undefined}
            />
          }
          renderItem={({ item }) => (
            <FoodFeedCard
              reel={item}
              muted={muted}
              onToggleMute={() => setMuted((prev) => !prev)}
              onPress={() => openReel(item.id)}
              onLike={() => toggleLike.mutate(item.id)}
              onShare={() => handleShare(item)}
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
              quantity={item.meal ? getQuantity(item.meal.id) : 0}
              onChangeQuantity={item.meal ? (next) => changeQuantity(item.meal!.id, next) : undefined}
            />
          )}
        />
      )}

      {conflictDialog}
    </Screen>
  );
};

export default FoodFeed;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  header: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.md,
    borderBottomLeftRadius: theme.radius.sheet,
    borderBottomRightRadius: theme.radius.sheet,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.overlay.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.text.inverse,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  chipRow: {
    paddingVertical: theme.spacing.md,
  },
  listContent: {
    paddingBottom: MINI_CART_BAR_CLEARANCE,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  listPadding: {
    gap: theme.spacing.lg,
  },
  skeletonCard: {
    marginHorizontal: 0,
  },
});
