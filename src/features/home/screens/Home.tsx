import React, { useCallback, useMemo, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { enterRise } from '@animations/motion';
import MealCard from '@components/MealCard';
import { EmptySearch } from '@components/illustrations';
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
import { useCartCount, useCartQuantityControls } from '@features/cart/hooks/useCart';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import { useKitchens } from '@features/kitchens/hooks/useKitchens';
import { MINI_CART_BAR_CLEARANCE } from '@components/MiniCartBar';
import { useTabBarFootprint, useTabBarScrollHandler } from '@app/navigation/private/tabBarVisibility';
import { useAuthStore } from '@features/authentication/store/authStore';
import { useRequireAuth } from '@features/authentication/hooks/useRequireAuth';
import { useUnreadNotificationCount } from '@features/notifications/hooks/useNotifications';
import HomeSectionHeader from '../components/HomeSectionHeader';
import HomeHeader from '../components/HomeHeader';
import GoalFilterRow from '../components/GoalFilterRow';
import CategoryGrid from '../components/CategoryGrid';
import CuisineCarousel from '../components/CuisineCarousel';
import KitchenStoriesRail from '../components/KitchenStoriesRail';
import TrendingNearYou from '../components/TrendingNearYou';
import FeaturedKitchens from '../components/FeaturedKitchens';
import ReelsRail from '../components/ReelsRail';
import HealthBanner from '../components/HealthBanner';
import HealthyPicks from '../components/HealthyPicks';
import ActiveOrderStrip from '../components/ActiveOrderStrip';
import { HOME_COPY } from '../home.constants';
import { useHealthyPicks } from '../hooks/useHealthyPicks';
import { useCuisines, useHomeFeed, useKitchenStories } from '../hooks/useHomeFeed';
import { useTheme } from "@app/theme/useTheme";

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
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const tabBarFootprint = useTabBarFootprint();
  const requireAuth = useRequireAuth();
  const scrollY = useSharedValue(0);

  const [goalTags, setGoalTags] = useState<GoalTag[]>([]);
  const [cuisine, setCuisine] = useState<string | undefined>();

  const location = useAuthStore((s) => s.location);
  const hasLocation = Boolean(location.latitude && location.longitude);

  const homeQuery = useHomeFeed();
  const recentKitchensQuery = useKitchens({ sortBy: 'newest', limit: 6 });
  const recentKitchens = flattenPages(recentKitchensQuery.data?.pages).slice(0, 6);
  const cuisinesQuery = useCuisines();
  const storiesQuery = useKitchenStories(location.city);
  const { data: cartCount } = useCartCount();
  const { data: unreadNotifications } = useUnreadNotificationCount();
  const toggleFavorite = useToggleFavorite();
  const { addToCart, conflictDialog } = useAddToCartFlow();
  const { getQuantity, changeQuantity } = useCartQuantityControls();

  const nearbyQuery = useTrendingNearby(
    hasLocation
      ? { lat: location.latitude, lng: location.longitude, cuisine, limit: 4 }
      : null,
  );
  const nearbyMeals = flattenPages(nearbyQuery.data?.pages).slice(0, 4);

  const feedFilters = useMemo(
    () => ({ goalTags: goalTags.length ? goalTags : undefined, cuisine }),
    [goalTags, cuisine],
  );

  const healthyPicks = useHealthyPicks();

  const feedQuery = useMealFeed(feedFilters);
  const meals = flattenPages(feedQuery.data?.pages);

  // Drives the collapsing header on the UI thread.
  // Also forwards to the tab bar's hide-on-scroll logic (plain JS handler).
  const onTabBarScroll = useTabBarScrollHandler();
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      runOnJS(onTabBarScroll)({
        nativeEvent: {
          contentOffset: { x: 0, y: event.contentOffset.y },
          contentSize: { width: event.contentSize.width, height: event.contentSize.height },
          layoutMeasurement: {
            width: event.layoutMeasurement.width,
            height: event.layoutMeasurement.height,
          },
        },
      } as NativeSyntheticEvent<NativeScrollEvent>);
    },
  });

  const handleToggleGoal = useCallback((tag: GoalTag) => {
    setGoalTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );
  }, []);

  const handleSelectCategory = useCallback(
    (selected: MealCategory) => {
      // Categories open their own filtered results page rather than filtering
      // the Home feed in place — Breakfast/Lunch/Dinner/Healthy Snacks are
      // meant to feel like distinct destinations, not a toggle.
      navigation.navigate('Search', { category: selected.slug, categoryName: selected.name });
    },
    [navigation],
  );

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
      const firstUnseenIndex = group.items.findIndex((item) => !item.isSeen);
      navigation.navigate('KitchenStoryViewer', {
        kitchenId: group.kitchen.id,
        kitchenName: group.kitchen.name,
        items: group.items,
        initialIndex: firstUnseenIndex >= 0 ? firstUnseenIndex : 0,
      });
    },
    [navigation],
  );

  const handleRefresh = useCallback(() => {
    homeQuery.refetch();
    feedQuery.refetch();
    healthyPicks.refetch();
    storiesQuery.refetch();
    recentKitchensQuery.refetch();
    if (hasLocation) nearbyQuery.refetch();
  }, [homeQuery, feedQuery, healthyPicks, storiesQuery, recentKitchensQuery, nearbyQuery, hasLocation]);

  const home = homeQuery.data;
  const activeOrder = home?.activeOrders?.[0];
  const isFiltered = goalTags.length > 0 || Boolean(cuisine);

  return (
    <View style={styles.screen}>
      <HomeHeader
        scrollY={scrollY}
        cartCount={cartCount?.itemCount ?? 0}
        notificationCount={unreadNotifications ?? 0}
        onPressSearch={(origin) => navigation.navigate('Search', { origin })}
        onPressCart={() => navigation.navigate('Cart')}
        onPressNotifications={() => requireAuth(() => navigation.navigate('NotificationInbox'))}
        onPressReferral={() => requireAuth(() => navigation.navigate('Referral'))}
        onPressLocation={() => navigation.navigate('Addresses')}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: theme.spacing.xxxl + MINI_CART_BAR_CLEARANCE + tabBarFootprint }]}
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
        <Animated.View entering={enterRise(0)}>
        <KitchenStoriesRail
          groups={storiesQuery.data ?? []}
          onPressGroup={handlePressStoryGroup}
          isLoading={storiesQuery.isLoading}
        />
        </Animated.View>

        {activeOrder ? (
          <ActiveOrderStrip
            order={activeOrder}
            onPress={() => navigation.navigate('OrderTracking', { orderId: activeOrder.id })}
          />
        ) : null}

        <Animated.View entering={enterRise(1)}>
        <ReelsRail
          reels={home?.trendingReels ?? []}
          isLoading={homeQuery.isLoading}
          onPressReel={(reel) => navigation.navigate('ReelViewer', { reelId: reel.id })}
          onOrderReel={(reel) =>
            reel.meal
              ? navigation.navigate('MealDetail', { mealId: reel.meal.id, mealName: reel.meal.name })
              : navigation.navigate('ReelViewer', { reelId: reel.id })
          }
          onSeeAll={() => navigation.navigate('MainTabs', { screen: 'FoodFeed' })}
        />
        </Animated.View>

        <Animated.View entering={enterRise(2)}>
          <HealthBanner />
        </Animated.View>

        <Animated.View entering={enterRise(3)}>
        <GoalFilterRow
          options={home?.goalTags ?? []}
          selected={goalTags}
          onToggle={handleToggleGoal}
          isLoading={homeQuery.isLoading}
        />
        </Animated.View>

        <Animated.View entering={enterRise(4)}>
          <HealthyPicks
            meals={healthyPicks.meals}
            isLoading={healthyPicks.isLoading}
            onPressMeal={openMeal}
            onAddMeal={(meal) => addToCart(meal)}
            getQuantity={getQuantity}
            onChangeQuantity={changeQuantity}
            onToggleFavorite={(meal) => toggleFavorite.mutate(meal.id)}
          />
        </Animated.View>

        <Animated.View entering={enterRise(5)}>
        <CuisineCarousel
          cuisines={cuisinesQuery.data ?? []}
          selectedSlug={cuisine}
          onSelect={handleSelectCuisine}
          isLoading={cuisinesQuery.isLoading}
        />
        </Animated.View>

        <Animated.View entering={enterRise(6)} style={styles.categorySection}>
          <HomeSectionHeader title={HOME_COPY.categories} />
          <CategoryGrid
            categories={home?.categories ?? []}
            onSelect={handleSelectCategory}
            isLoading={homeQuery.isLoading}
          />
        </Animated.View>

        <Animated.View entering={enterRise(7)}>
        <FeaturedKitchens
          kitchens={recentKitchens}
          isLoading={recentKitchensQuery.isLoading}
          onPressKitchen={(kitchen) =>
            navigation.navigate('KitchenProfile', {
              kitchenId: kitchen.id,
              kitchenName: kitchen.name,
            })
          }
        />
        </Animated.View>

        <Animated.View entering={enterRise(8)}>
        <TrendingNearYou
          meals={nearbyMeals}
          isLoading={hasLocation && nearbyQuery.isLoading}
          hasLocation={hasLocation}
          onPressMeal={openMeal}
          onAddMeal={(meal) => addToCart(meal)}
          getQuantity={getQuantity}
          onChangeQuantity={changeQuantity}
          onToggleFavorite={(meal) => toggleFavorite.mutate(meal.id)}
          onSetLocation={() => navigation.navigate('Addresses')}
        />
        </Animated.View>

        <View style={styles.feedSection}>
          <HomeSectionHeader
            title={isFiltered ? 'Matching meals' : HOME_COPY.feedTitle}
            subtitle={HOME_COPY.feedSubtitle}
          />

          {feedQuery.isLoading ? (
            <View style={styles.feedList}>
              {Array.from({ length: 4 }).map((_, index) => (
                <MealCardSkeleton key={index} />
              ))}
            </View>
          ) : meals.length === 0 ? (
            <EmptyState
              illustration={<EmptySearch size={160} />}
              title={HOME_COPY.emptyFeedTitle}
              description={HOME_COPY.emptyFeedBody}
              actionLabel={isFiltered ? 'Clear filters' : undefined}
              onAction={() => {
                setGoalTags([]);
                setCuisine(undefined);
              }}
            />
          ) : (
            <View style={styles.feedList}>
              {meals.map((meal, index) => (
                <Animated.View key={meal.id} entering={enterRise(index)}>
                <MealCard
                  meal={meal}
                  onPress={() => openMeal(meal)}
                  onAdd={() => addToCart(meal)}
                  quantity={getQuantity(meal.id)}
                  onChangeQuantity={(next) => changeQuantity(meal.id, next)}
                  onToggleFavorite={() => toggleFavorite.mutate(meal.id)}
                />
                </Animated.View>
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

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl + MINI_CART_BAR_CLEARANCE,
  },
  categorySection: {
    marginTop: theme.spacing.xl,
  },
  feedSection: {
    marginTop: theme.spacing.xl,
  },
  feedList: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
});
