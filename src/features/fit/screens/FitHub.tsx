import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { CalendarCheck, ChevronRight } from 'lucide-react-native';
import { enterRise } from '@animations/motion';
import PressableScale from '@animations/PressableScale';
import MealCard from '@components/MealCard';
import { EmptyState, MealCardSkeleton, Skeleton } from '@components/ui';
import { EmptySearch } from '@components/illustrations';
import type { MealCard as MealCardType } from '@api/types';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useTabBarFootprint, useTabBarScrollHandler } from '@app/navigation/private/tabBarVisibility';
import { MINI_CART_BAR_CLEARANCE } from '@components/MiniCartBar';
import { useTheme } from '@app/theme/useTheme';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import { useCart, useCartQuantityControls } from '@features/cart/hooks/useCart';
import HomeSectionHeader from '@features/home/components/HomeSectionHeader';
import FitHero from '../components/FitHero';
import FitKitchensRail from '../components/FitKitchensRail';
import FitMealCard from '../components/FitMealCard';
import GoalPicker from '../components/GoalPicker';
import HydrationCard from '../components/HydrationCard';
import MacroFilters, { NO_MACRO_FILTERS, type MacroFilterState } from '../components/MacroFilters';
import TargetSheet from '../components/TargetSheet';
import { FIT, FIT_COPY } from '../fit.constants';
import { cartNutrition } from '../fit.utils';
import { useFitFeed, useFitPool } from '../hooks/useFitData';
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
  const { query: feedQuery, meals } = useFitFeed(goal, filters);
  const { addToCart, conflictDialog } = useAddToCartFlow();
  const { getQuantity, changeQuantity } = useCartQuantityControls();

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
    feedQuery.refetch();
  };

  const rail = (list: MealCardType[], offset: number) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {list.map((meal, index) => (
        <Animated.View key={meal.id} entering={enterRise(index + offset)}>
          <MealCard
            layout="compact"
            meal={meal}
            onPress={() => openMeal(meal)}
            onAdd={() => addToCart(meal)}
            quantity={getQuantity(meal.id)}
            onChangeQuantity={(next) => changeQuantity(meal.id, next)}
          />
        </Animated.View>
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
        contentContainerStyle={[styles.content, { paddingBottom: theme.spacing.xxxl + MINI_CART_BAR_CLEARANCE + tabBarFootprint }]}
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
        <Animated.View entering={enterRise(0)}>
          <FitHero targets={targets} inCart={inCart} onSetTarget={() => setSheetOpen(true)} />
        </Animated.View>

        <Animated.View entering={enterRise(1)} style={styles.section}>
          <HomeSectionHeader title={FIT_COPY.goalTitle} />
          <GoalPicker value={goal} onChange={setGoal} />
        </Animated.View>

        <Animated.View entering={enterRise(2)} style={styles.section}>
          <HydrationCard />
        </Animated.View>

        {pool.isLoading || pool.proteinChampions.length ? (
          <View style={styles.section}>
            <HomeSectionHeader title={FIT_COPY.proteinTitle} subtitle={FIT_COPY.proteinSubtitle} />
            {pool.isLoading ? railSkeleton : rail(pool.proteinChampions, 0)}
          </View>
        ) : null}

        <Animated.View entering={enterRise(3)} style={styles.section}>
          <PressableScale
            onPress={() => navigation.navigate('SetupPlanChooseKitchen')}
            haptic={false}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel="Start a weekly Fit plan"
            style={styles.plan}
          >
            <View style={styles.planIcon}>
              <CalendarCheck size={22} color={FIT.forest} strokeWidth={2.4} />
            </View>
            <View style={styles.planText}>
              <Text style={styles.planTitle}>Weekly Fit plan</Text>
              <Text style={styles.planSub}>Lock in your macros. Fresh meals delivered every day.</Text>
            </View>
            <ChevronRight size={20} color={FIT.lime} />
          </PressableScale>
        </Animated.View>

        {pool.kitchens.length ? (
          <View style={styles.section}>
            <HomeSectionHeader title={FIT_COPY.kitchensTitle} subtitle={FIT_COPY.kitchensSubtitle} />
            <FitKitchensRail
              kitchens={pool.kitchens}
              onPress={(k) => navigation.navigate('KitchenProfile', { kitchenId: k.id, kitchenName: k.name })}
            />
          </View>
        ) : null}

        {pool.lightAndLean.length ? (
          <View style={styles.section}>
            <HomeSectionHeader title={FIT_COPY.lightTitle} subtitle={FIT_COPY.lightSubtitle} />
            {rail(pool.lightAndLean, 0)}
          </View>
        ) : null}

        <View style={styles.section}>
          <HomeSectionHeader title={FIT_COPY.feedTitle} subtitle="Filter by what matters to you" />
          <MacroFilters value={filters} onToggle={toggleFilter} />
          <View style={styles.list}>
            {feedQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <MealCardSkeleton key={i} />)
            ) : meals.length === 0 ? (
              <EmptyState
                illustration={<EmptySearch size={150} />}
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
    content: { paddingTop: theme.spacing.xxl + theme.spacing.lg },
    section: { marginTop: theme.spacing.xl, gap: theme.spacing.sm },
    rail: { paddingHorizontal: theme.layout.screenPadding, gap: theme.spacing.md },
    list: { paddingHorizontal: theme.layout.screenPadding, gap: theme.spacing.md, marginTop: theme.spacing.sm },
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
