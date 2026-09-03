import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { UtensilsCrossed } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import MealCard from '@components/MealCard';
import SectionHeader from '@components/SectionHeader';
import { EmptyState, MealCardSkeleton } from '@components/ui';
import type {
  Cuisine,
  GoalTag,
  KitchenStoryGroup,
  MealCard as MealCardType,
  MealCategory,
  NearbyMealCard,
} from '@api/types';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { flattenPages, useMealFeed, useToggleFavorite, useTrendingNearby } from '@features/meals/hooks/useMeals';
import { useCartCount } from '@features/cart/hooks/useCart';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import { useAuthStore } from '@features/authentication/store/authStore';
import HomeHeader from '../components/HomeHeader';
import GoalFilterRow from '../components/GoalFilterRow';
import CategoryGrid from '../components/CategoryGrid';
import CuisinePillRow from '../components/CuisinePillRow';
import CuisineCarousel from '../components/CuisineCarousel';
import KitchenStoriesRail from '../components/KitchenStoriesRail';
import TrendingNearYou from '../components/TrendingNearYou';
import FeaturedKitchens from '../components/FeaturedKitchens';
import ReelsRail from '../components/ReelsRail';
import ActiveOrderStrip from '../components/ActiveOrderStrip';
import { HOME_COPY } from '../home.constants';
import { useCuisines, useHomeFeed, useKitchenStories, useMarkStorySeen } from '../hooks/useHomeFeed';

/**
 * Discovery screen.
 *
 * Everything above the meal feed arrives in one `/home/feed` call; the feed
 * itself is a separate infinite query so filtering re-fetches only the list and
 * the rails above it stay put. Kitchen Stories and Trending Near You are each
 * their own query because they're scoped to the customer's city/coordinates,
 * not part of the generic aggregated payload.
 */
const Home = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const scrollY = useSharedValue(0);

  const [goalTags, setGoalTags] = useState<GoalTag[]>([]);
  const [category, setCategory] = useState<string | undefined>();
  const [cuisine, setCuisine] = useState<string | undefined>();

  const location = useAuthStore((s) => s.location);
  const hasLocation = Boolean(location.latitude && location.longitude);

  const homeQuery = useHomeFeed();
  const cuisinesQuery = useCuisines();
  const storiesQuery = useKitchenStories(location.city);
  const markStorySeen = useMarkStorySeen();
  const { data: cartCount } = useCartCount();
  const toggleFavorite = useToggleFavorite();
  const { addToCart, conflictDialog } = useAddToCartFlow();

  const nearbyQuery = useTrendingNearby(
    hasLocation
      ? { lat: location.latitude, lng: location.longitude, cuisine, limit: 4 }
      : null,
  );
  const nearbyMeals = flattenPages(nearbyQuery.data?.pages).slice(0, 4);

  const feedFilters = useMemo(
    () => ({ goalTags: goalTags.length ? goalTags : undefined, category, cuisine }),
    [goalTags, category, cuisine],
  );

  const feedQuery = useMealFeed(feedFilters);
  const meals = flattenPages(feedQuery.data?.pages);

  // Drives the collapsing header on the UI thread.
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleToggleGoal = useCallback((tag: GoalTag) => {
    setGoalTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );
  }, []);

  const handleSelectCategory = useCallback((selected: MealCategory) => {
    // Tapping the active category clears it, so the grid doubles as a toggle.
    setCategory((current) => (current === selected.slug ? undefined : selected.slug));
  }, []);

  const handleSelectCuisine = useCallback((selected: Cuisine) => {
    setCuisine((current) => (current === selected.slug ? undefined : selected.slug));
  }, []);

  const openMeal = useCallback(
    (meal: MealCardType | NearbyMealCard) =>
      navigation.navigate('MealDetail', { mealId: meal.id, mealName: meal.name }),
    [navigation],
  );

  const handlePressStoryGroup = useCallback(
    (group: KitchenStoryGroup) => {
      const firstUnseen = group.items.find((item) => !item.isSeen) ?? group.items[0];
      if (firstUnseen) markStorySeen.mutate(firstUnseen.id);
      navigation.navigate('KitchenProfile', {
        kitchenId: group.kitchen.id,
        kitchenName: group.kitchen.name,
      });
    },
    [navigation, markStorySeen],
  );

  const handleRefresh = useCallback(() => {
    homeQuery.refetch();
    feedQuery.refetch();
    storiesQuery.refetch();
    if (hasLocation) nearbyQuery.refetch();
  }, [homeQuery, feedQuery, storiesQuery, nearbyQuery, hasLocation]);

  const home = homeQuery.data;
  const activeOrder = home?.activeOrders?.[0];
  const isFiltered = goalTags.length > 0 || Boolean(category) || Boolean(cuisine);

  return (
    <View style={styles.screen}>
      <HomeHeader
        scrollY={scrollY}
        cartCount={cartCount?.itemCount ?? 0}
        onPressSearch={() => navigation.navigate('MainTabs', { screen: 'Search' })}
        onPressCart={() => navigation.navigate('Cart')}
        onPressProfile={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
        onPressLocation={() => navigation.navigate('Addresses')}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={homeQuery.isRefetching && !homeQuery.isLoading}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[600]}
            colors={[theme.colors.primary[600]]}
          />
        }
        onMomentumScrollEnd={({ nativeEvent }) => {
          // Prefetch the next page as the user approaches the bottom.
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isNearBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 600;
          if (isNearBottom && feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
            feedQuery.fetchNextPage();
          }
        }}
      >
        <View style={styles.cuisinePillSection}>
          <CuisinePillRow
            cuisines={cuisinesQuery.data ?? []}
            selectedSlug={cuisine}
            onSelect={handleSelectCuisine}
          />
        </View>

        <KitchenStoriesRail
          groups={storiesQuery.data ?? []}
          onPressGroup={handlePressStoryGroup}
        />

        {activeOrder ? (
          <ActiveOrderStrip
            order={activeOrder}
            onPress={() => navigation.navigate('OrderTracking', { orderId: activeOrder.id })}
          />
        ) : null}

        <GoalFilterRow
          options={home?.goalTags ?? []}
          selected={goalTags}
          onToggle={handleToggleGoal}
        />

        <CuisineCarousel cuisines={cuisinesQuery.data ?? []} onSelect={handleSelectCuisine} />

        <View style={styles.categorySection}>
          <SectionHeader title={HOME_COPY.categories} />
          <CategoryGrid
            categories={home?.categories ?? []}
            activeSlug={category}
            onSelect={handleSelectCategory}
          />
        </View>

        <FeaturedKitchens
          kitchens={home?.featuredKitchens ?? []}
          isLoading={homeQuery.isLoading}
          onPressKitchen={(kitchen) =>
            navigation.navigate('KitchenProfile', {
              kitchenId: kitchen.id,
              kitchenName: kitchen.name,
            })
          }
        />

        <ReelsRail
          reels={home?.trendingReels ?? []}
          onPressReel={(reel) => navigation.navigate('ReelViewer', { reelId: reel.id })}
          onSeeAll={() => navigation.navigate('MainTabs', { screen: 'FoodFeed' })}
        />

        <TrendingNearYou
          meals={nearbyMeals}
          isLoading={hasLocation && nearbyQuery.isLoading}
          hasLocation={hasLocation}
          onPressMeal={openMeal}
          onAddMeal={(meal) => addToCart(meal)}
          onToggleFavorite={(meal) => toggleFavorite.mutate(meal.id)}
          onSetLocation={() => navigation.navigate('Addresses')}
        />

        <View style={styles.feedSection}>
          <SectionHeader title={isFiltered ? 'Matching meals' : HOME_COPY.feedTitle} />
          <Text style={[theme.text.bodySmall, styles.feedSubtitle]}>
            {HOME_COPY.feedSubtitle}
          </Text>

          {feedQuery.isLoading ? (
            <View style={styles.feedList}>
              {Array.from({ length: 4 }).map((_, index) => (
                <MealCardSkeleton key={index} />
              ))}
            </View>
          ) : meals.length === 0 ? (
            <EmptyState
              icon={
                <UtensilsCrossed size={36} color={theme.colors.primary[600]} strokeWidth={1.8} />
              }
              title={HOME_COPY.emptyFeedTitle}
              description={HOME_COPY.emptyFeedBody}
              actionLabel={isFiltered ? 'Clear filters' : undefined}
              onAction={() => {
                setGoalTags([]);
                setCategory(undefined);
                setCuisine(undefined);
              }}
            />
          ) : (
            <View style={styles.feedList}>
              {meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onPress={() => openMeal(meal)}
                  onAdd={() => addToCart(meal)}
                  onToggleFavorite={() => toggleFavorite.mutate(meal.id)}
                />
              ))}

              {feedQuery.isFetchingNextPage ? <MealCardSkeleton /> : null}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {conflictDialog}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  cuisinePillSection: {
    marginTop: theme.spacing.lg,
  },
  categorySection: {
    marginTop: theme.spacing.xl,
  },
  feedSection: {
    marginTop: theme.spacing.xl,
  },
  feedSubtitle: {
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.layout.screenPadding,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  feedList: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
});
