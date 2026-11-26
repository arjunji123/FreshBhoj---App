import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { CalendarCheck, ChevronRight } from 'lucide-react-native';
import { enterRise } from '@animations/motion';
import PressableScale from '@animations/PressableScale';
import MealCard from '@components/MealCard';
import { EmptyState, MealCardSkeleton, Skeleton } from '@components/ui';
import EmptyPhoto from '@components/EmptyPhoto';
import type { MealCard as MealCardType } from '@api/types';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useTabBarFootprint, useTabBarScrollHandler } from '@app/navigation/private/tabBarVisibility';
import { MINI_CART_BAR_CLEARANCE } from '@components/MiniCartBar';
import { useTheme } from '@app/theme/useTheme';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import { useCart, useCartQuantityControls } from '@features/cart/hooks/useCart';
import BestPick, { pickBestMeal } from '../components/BestPick';
import TodayCard from '../components/TodayCard';
import FitHeader from '../components/FitHeader';
import FitSectionHeader from '../components/FitSectionHeader';
import StreakCard from '../components/StreakCard';
import FitKitchensRail from '../components/FitKitchensRail';
import FitMealCard from '../components/FitMealCard';
import GoalPicker from '../components/GoalPicker';
import HydrationCard from '../components/HydrationCard';
import MacroFilters, { NO_MACRO_FILTERS, type MacroFilterState } from '../components/MacroFilters';
import TargetSheet from '../components/TargetSheet';
import { FIT, FIT_COPY } from '../fit.constants';
import { cartNutrition } from '../fit.utils';
import { useFitFeed, useFitPool, useFitStreak } from '../hooks/useFitData';
import { useFitStore } from '../store/fitStore';

/**
 * The Fit tab: a self-contained home for people who train or just want to eat
 * well. Everything personal (target, goal, water) lives on-device; meals and
 * kitchens come from the same endpoints as the rest of the app, filtered and
 * ranked by nutrition.
 */
const FitHub = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const insets = useSafeAreaInsets();
  const tabBarFootprint = useTabBarFootprint();
  const onScroll = useTabBarScrollHandler();

  const profile = useFitStore((s) => s.profile);
  const targets = useFitStore((s) => s.targets);
  const goal = useFitStore((s) => s.goal);
  const setGoal = useFitStore((s) => s.setGoal);
  const saveProfile = useFitStore((s) => s.saveProfile);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [filters, setFilters] = useState<MacroFilterState>(NO_MACRO_FILTERS);

  const { data: cart } = useCart();
  const inCart = useMemo(() => cartNutrition(cart), [cart]);

  const pool = useFitPool();
  const { data: streak, refetch: refetchStreak } = useFitStreak();
  const { query: feedQuery, meals } = useFitFeed(goal, filters);
  const { addToCart, conflictDialog } = useAddToCartFlow();
  const { getQuantity, changeQuantity } = useCartQuantityControls();

  const bestMeal = useMemo(
    () => pickBestMeal([...pool.proteinChampions, ...meals], targets, inCart),
    [pool.proteinChampions, meals, targets, inCart],
  );

  const openMeal = useCallback(
    (meal: MealCardType) => navigation.navigate('MealDetail', { mealId: meal.id, mealName: meal.name }),
    [navigation],
  );
  const toggleFilter = useCallback(
    (key: keyof MacroFilterState) => setFilters((f) => ({ ...f, [key]: !f[key] })),
    [],
  );
  const hasFilters = Object.values(filters).some(Boolean);

  const refresh = () => {
    pool.refetch();
    refetchStreak();
    feedQuery.refetch();
  };

  const rail = (list: MealCardType[]) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {list.map((meal) => (
        <View key={meal.id}>
          <MealCard
            layout="compact"
            meal={meal}
            onPress={() => openMeal(meal)}
            onAdd={() => addToCart(meal)}
            quantity={getQuantity(meal.id)}
            onChangeQuantity={(next) => changeQuantity(meal.id, next)}
          />
        </View>
      ))}
    </ScrollView>
  );

  const railSkeleton = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail} scrollEnabled={false}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} width={168} height={250} radius={theme.radius.xxl} />
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: insets.top + theme.spacing.md,
          paddingBottom: theme.spacing.xxxl + MINI_CART_BAR_CLEARANCE + tabBarFootprint,
        }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refresh} tintColor={FIT.emerald} colors={[FIT.emerald]} />
        }
        onMomentumScrollEnd={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 600 &&
            feedQuery.hasNextPage &&
            !feedQuery.isFetchingNextPage
          ) {
            feedQuery.fetchNextPage();
          }
        }}
      >
        <FitHeader streak={streak?.current ?? 0} />

        <Animated.View entering={enterRise(0)}>
          <TodayCard targets={targets} inCart={inCart} onSetTarget={() => setSheetOpen(true)} />
        </Animated.View>

        {streak ? <StreakCard streak={streak} /> : null}

        {bestMeal ? (
          <Animated.View entering={enterRise(1)} style={styles.section}>
            <FitSectionHeader
              title="Best pick for you"
              subtitle={targets ? 'Most protein within the calories you have left' : 'Highest protein near you'}
            />
            <BestPick
              meal={bestMeal}
              targets={targets}
              inCart={inCart}
              quantity={getQuantity(bestMeal.id)}
              onPress={() => openMeal(bestMeal)}
              onAdd={() => addToCart(bestMeal)}
              onChangeQuantity={(next) => changeQuantity(bestMeal.id, next)}
            />
          </Animated.View>
        ) : null}

        <Animated.View entering={enterRise(2)} style={styles.section}>
          <HydrationCard />
        </Animated.View>

        {pool.isLoading || pool.proteinChampions.length ? (
          <View style={styles.section}>
            <FitSectionHeader title={FIT_COPY.proteinTitle} subtitle={FIT_COPY.proteinSubtitle} />
            {pool.isLoading ? railSkeleton : rail(pool.proteinChampions)}
          </View>
        ) : null}

        <Animated.View entering={enterRise(3)} style={styles.section}>
          <PressableScale
            onPress={() => navigation.navigate('SetupPlanChooseKitchen')}
            haptic={false}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel="Start a weekly Bhoj Fit plan"
            style={styles.plan}
          >
            <View style={styles.planIcon}>
              <CalendarCheck size={22} color={FIT.forest} strokeWidth={2.4} />
            </View>
            <View style={styles.planText}>
              <Text style={styles.planTitle}>Weekly Bhoj Fit plan</Text>
              <Text style={styles.planSub}>Lock in your macros. Fresh meals delivered every day.</Text>
            </View>
            <ChevronRight size={20} color={FIT.lime} />
          </PressableScale>
        </Animated.View>

        {pool.kitchens.length ? (
          <View style={styles.section}>
            <FitSectionHeader title={FIT_COPY.kitchensTitle} subtitle={FIT_COPY.kitchensSubtitle} />
            <FitKitchensRail
              kitchens={pool.kitchens}
              onPress={(k) => navigation.navigate('KitchenProfile', { kitchenId: k.id, kitchenName: k.name })}
            />
          </View>
        ) : null}

        {pool.lightAndLean.length ? (
          <View style={styles.section}>
            <FitSectionHeader title={FIT_COPY.lightTitle} subtitle={FIT_COPY.lightSubtitle} />
            {rail(pool.lightAndLean)}
          </View>
        ) : null}

        <View style={styles.section}>
          <FitSectionHeader title={FIT_COPY.feedTitle} subtitle="Pick a goal, then filter" />
          <View style={styles.filterBlock}>
            <GoalPicker value={goal} onChange={setGoal} />
            <MacroFilters value={filters} onToggle={toggleFilter} />
          </View>
          <View style={styles.list}>
            {feedQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <MealCardSkeleton key={i} />)
            ) : meals.length === 0 ? (
              <EmptyState
                illustration={<EmptyPhoto kind="search" size={130} />}
                title="No meals match yet"
                description="Try another goal or clear a filter. New kitchens join every week."
                actionLabel={hasFilters ? 'Clear filters' : undefined}
                onAction={() => setFilters(NO_MACRO_FILTERS)}
              />
            ) : (
              meals.map((meal, index) => (
                <Animated.View key={meal.id} entering={enterRise(index)}>
                  <FitMealCard
                    meal={meal}
                    targets={targets}
                    quantity={getQuantity(meal.id)}
                    onPress={() => openMeal(meal)}
                    onAdd={() => addToCart(meal)}
                    onChangeQuantity={(next) => changeQuantity(meal.id, next)}
                  />
                </Animated.View>
              ))
            )}
            {feedQuery.isFetchingNextPage ? <MealCardSkeleton /> : null}
          </View>
        </View>
      </ScrollView>

      {/* Keeps scrolled content from showing behind the clock and battery. */}
      <View pointerEvents="none" style={[styles.statusShield, { height: insets.top }]} />

      {sheetOpen ? (
        <TargetSheet
          visible
          initial={profile}
          onClose={() => setSheetOpen(false)}
          onSave={(p) => {
            saveProfile(p);
            setSheetOpen(false);
          }}
        />
      ) : null}
      {conflictDialog}
    </View>
  );
};

export default FitHub;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.surface.page },
    statusShield: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: theme.colors.surface.page },
    section: { marginTop: theme.spacing.xl },
    // Vertical padding keeps the card shadows and bottom edges inside the rail.
    rail: {
      paddingHorizontal: theme.layout.screenPadding,
      paddingTop: theme.spacing.xs,
      paddingBottom: theme.spacing.md,
      gap: theme.spacing.md,
      alignItems: 'flex-start',
    },
    // Breathing room between the heading, the goal tiles, the filter chips and the first dish.
    filterBlock: { gap: theme.spacing.md, marginTop: theme.spacing.xs },
    list: { paddingHorizontal: theme.layout.screenPadding, gap: theme.spacing.md, marginTop: theme.spacing.lg },
    plan: {
      marginHorizontal: theme.layout.screenPadding,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radius.xl,
      backgroundColor: FIT.forest,
    },
    planIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: FIT.lime },
    planText: { flex: 1 },
    planTitle: { color: FIT.onHero, fontSize: 16, fontWeight: '800' },
    planSub: { color: FIT.heroMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  });
