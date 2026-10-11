import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  FadeInDown,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { AlertCircle, Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react-native';
import type { FoodType, GoalTag, GoalTagOption } from '@api/types';
import {
  Chip,
  ChipRow,
  EmptyState,
  MealCardSkeleton,
  type SheetHandle,
} from '@components/ui';
import MealCard from '@components/MealCard';
import { EmptySearch } from '@components/illustrations';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { flattenPages, useMealFeed, useToggleFavorite } from '@features/meals/hooks/useMeals';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import { useCartQuantityControls } from '@features/cart/hooks/useCart';
import { MINI_CART_BAR_CLEARANCE } from '@components/MiniCartBar';
import SearchFiltersSheet, { type PriceRange } from '../components/SearchFiltersSheet';
import type { MealSortBy } from '@api/endpoints/meals.api';
import { useTheme } from '@app/theme/useTheme';
import { useThemeStore } from '@app/theme/themeStore';
import { EASE_OUT } from '@animations/motion';
import SearchKitchenRail from '../components/SearchKitchenRail';
import { useKitchenSearch } from '../hooks/useKitchenSearch';

type Origin = { x: number; y: number; width: number; height: number };

type SearchParams =
  | { query?: string; goalTag?: GoalTag; category?: string; categoryName?: string; origin?: Origin }
  | undefined;
// Local so this screen type-checks whichever navigator currently hosts it.
type Route = RouteProp<{ Search: SearchParams }, 'Search'>;

const SORTS: Array<{ key: MealSortBy; label: string }> = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'protein_high', label: 'Most protein' },
  { key: 'calories_low', label: 'Fewest calories' },
  { key: 'price_low', label: 'Price: low to high' },
  { key: 'rating', label: 'Top rated' },
];

// The goal list is fixed by the backend enum; kept local now that this screen
// no longer loads the Home suggestions payload.
const GOAL_OPTIONS: GoalTagOption[] = [
  { key: 'HIGH_PROTEIN', label: 'High protein', icon: '', description: '' },
  { key: 'LOW_CALORIE', label: 'Low calorie', icon: '', description: '' },
  { key: 'WEIGHT_LOSS', label: 'Weight loss', icon: '', description: '' },
  { key: 'MUSCLE_GAIN', label: 'Muscle gain', icon: '', description: '' },
  { key: 'HEALTHY_LIFESTYLE', label: 'Healthy lifestyle', icon: '', description: '' },
];

const OPEN_MS = 280;
const CLOSE_MS = 240;
const BAR_OFFSET = -60;
const BAR_HEIGHT = 56;
const CLOSE_SIZE = 36;
const SEARCH_PLACEHOLDER = 'Search healthy meals...';
const FOCUS_DELAY_MS = 220;

/**
 * Search overlay. Opens as a blurred backdrop with a search bar sliding down
 * from the top; nothing else is shown until the user types (or arrives with a
 * category/goal param), at which point a results panel fades in below the bar.
 */
const Search = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scheme = useThemeStore((s) => s.resolvedScheme);
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();

  const [query, setQuery] = useState(params?.query ?? '');
  const [debounced, setDebounced] = useState(query.trim());
  const [goalTags, setGoalTags] = useState<GoalTag[]>(params?.goalTag ? [params.goalTag] : []);
  const [sortBy, setSortBy] = useState<MealSortBy>('recommended');
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>({});
  const [minProtein, setMinProtein] = useState<number | undefined>();
  const [maxCalories, setMaxCalories] = useState<number | undefined>();
  const [blurFailed, setBlurFailed] = useState(false);
  const filterSheetRef = useRef<SheetHandle>(null);
  const inputRef = useRef<TextInput>(null);
  const closing = useRef(false);
  const [isClosing, setIsClosing] = useState(false);

  // 0 = closed, 1 = open. Single timing driver, no springs.
  const progress = useSharedValue(0);

  // Debounced so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 320);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    progress.value = withTiming(1, { duration: OPEN_MS, easing: EASE_OUT });
    const timer = setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [progress]);

  const finishClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const dismiss = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    // Drop the results list first: re-laying it out while the keyboard
    // collapses is what made closing stutter.
    setIsClosing(true);
    Keyboard.dismiss();
    progress.value = withTiming(0, { duration: CLOSE_MS, easing: EASE_OUT }, (finished) => {
      if (finished) runOnJS(finishClose)();
    });
  }, [progress, finishClose]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      dismiss();
      return true;
    });
    return () => sub.remove();
  }, [dismiss]);

  const clearCategory = () =>
    (navigation as unknown as { setParams: (p: object) => void }).setParams({
      category: undefined,
      categoryName: undefined,
    });

  const toggleFavorite = useToggleFavorite();
  const { addToCart, conflictDialog } = useAddToCartFlow();
  const { getQuantity, changeQuantity } = useCartQuantityControls();

  const hasActiveFilters =
    goalTags.length > 0 ||
    foodTypes.length > 0 ||
    Boolean(priceRange.minPrice || priceRange.maxPrice) ||
    Boolean(minProtein) ||
    Boolean(maxCalories);
  const hasCriteria = debounced.length > 1 || hasActiveFilters || Boolean(params?.category);

  const filters = useMemo(
    () => ({
      q: debounced || undefined,
      goalTags: goalTags.length ? goalTags : undefined,
      foodTypes: foodTypes.length ? foodTypes : undefined,
      category: params?.category,
      sortBy,
      minPrice: priceRange.minPrice,
      maxPrice: priceRange.maxPrice,
      minProtein,
      maxCalories,
    }),
    [debounced, goalTags, foodTypes, params?.category, sortBy, priceRange, minProtein, maxCalories],
  );

  const feedQuery = useMealFeed(filters);
  const meals = flattenPages(feedQuery.data?.pages);

  const kitchenQuery = useKitchenSearch(debounced, debounced.length > 1);
  const kitchens = kitchenQuery.data ?? [];
  const kitchensActive = debounced.length > 1;
  const kitchensLoading = kitchensActive && kitchenQuery.isLoading;
  const showKitchens = kitchensActive && (kitchensLoading || kitchens.length > 0);
  const dishesLoading = feedQuery.isLoading;
  const showDishesHeading = dishesLoading || meals.length > 0;

  const toggleGoal = (tag: GoalTag) =>
    setGoalTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );

  const toggleFoodType = (type: FoodType) =>
    setFoodTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );

  const resetFilters = () => {
    setGoalTags([]);
    setFoodTypes([]);
    setPriceRange({});
    setMinProtein(undefined);
    setMaxCalories(undefined);
    setSortBy('recommended');
  };

  const gutter = theme.layout.screenPadding;
  const restTop = insets.top + theme.spacing.sm;
  const barWidth = windowWidth - gutter * 2;
  const origin = params?.origin;
  const hasOrigin = Boolean(origin);
  // The bar is laid out ONCE at its resting rect; the morph is a pure
  // transform (no per-frame layout), from the Home bar's spot to here.
  const fromDX = origin ? origin.x - gutter : 0;
  const fromDY = origin ? origin.y - restTop : BAR_OFFSET;

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const barStyle = useAnimatedStyle(() => ({
    opacity: hasOrigin ? 1 : progress.value,
    transform: [
      { translateX: (1 - progress.value) * fromDX },
      { translateY: (1 - progress.value) * fromDY },
    ],
  }));
  const barExtrasStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const panelFade = useAnimatedStyle(() => ({ opacity: progress.value }));

  // Frosted-glass wash: the page colour at ~88% so whatever is underneath
  // (header text, cards) reads as soft shapes even where the native blur
  // can't sample the screen behind a transparent modal.
  const pageColor = theme.colors.surface.page;
  const frostColor = /^#[0-9a-f]{6}$/i.test(pageColor) ? `${pageColor}E0` : theme.colors.surface.overlay;

  return (
    <View style={styles.root}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]} pointerEvents="none">
        {!blurFailed && Platform.OS !== 'web' ? (
          <SafeBlur
            blurType={scheme === 'dark' ? 'dark' : 'light'}
            onError={() => setBlurFailed(true)}
          />
        ) : null}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: frostColor }]} />
      </Animated.View>

      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={dismiss}
        accessibilityLabel="Close search"
        accessibilityRole="button"
      />

      <Animated.View
        style={[styles.bar, { top: restTop, left: gutter, width: barWidth }, barStyle]}
      >
        <SearchIcon size={18} color={theme.colors.text.tertiary} strokeWidth={2.2} />
        <TextInput
          ref={inputRef}
          style={[theme.text.body, styles.input]}
          value={query}
          onChangeText={setQuery}
          placeholder={SEARCH_PLACEHOLDER}
          placeholderTextColor={theme.colors.text.tertiary}
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
          selectionColor={theme.colors.primary[600]}
        />
        <Animated.View style={[styles.barActions, barExtrasStyle]}>
          {query ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={theme.layout.hitSlop}
              style={styles.clearBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <X size={14} color={theme.colors.text.tertiary} strokeWidth={2.6} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={dismiss}
            hitSlop={theme.layout.hitSlop}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close search"
          >
            <X size={16} color={theme.colors.text.primary} strokeWidth={2.6} />
          </Pressable>
        </Animated.View>
      </Animated.View>

      <View
        style={[styles.content, { paddingTop: restTop + BAR_HEIGHT + theme.spacing.md }]}
        pointerEvents="box-none"
      >
        {hasCriteria && !isClosing ? (
          <Animated.View style={[styles.panelFade, panelFade]}>
          <Animated.View
            key="results"
            style={styles.panel}
            entering={FadeInDown.duration(OPEN_MS)
              .easing(EASE_OUT)
              .withInitialValues({ opacity: 0, transform: [{ translateY: 16 }] })}
            exiting={FadeOut.duration(140)}
          >
            <FlatList
              data={meals}
              keyExtractor={(meal) => meal.id}
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[styles.list, !meals.length ? styles.listEmpty : null]}
              onEndReachedThreshold={0.4}
              onEndReached={() => {
                if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
                  feedQuery.fetchNextPage();
                }
              }}
              ListHeaderComponent={
                <View>
                  {params?.category ? (
                    <View style={styles.categoryBanner}>
                      <Text style={[theme.text.h4, styles.categoryBannerText]} numberOfLines={1}>
                        {params.categoryName ?? 'Filtered results'}
                      </Text>
                      <Pressable
                        onPress={() => clearCategory()}
                        hitSlop={theme.layout.hitSlop}
                        accessibilityLabel="Clear category filter"
                      >
                        <X size={16} color={theme.colors.primary[700]} strokeWidth={2.4} />
                      </Pressable>
                    </View>
                  ) : null}

                  {showKitchens ? (
                    <View style={styles.section}>
                      <Text style={[theme.text.h4, styles.sectionTitle]}>Kitchens</Text>
                      <SearchKitchenRail
                        kitchens={kitchens}
                        loading={kitchensLoading}
                        onPressKitchen={(kitchen) =>
                          navigation.navigate('KitchenProfile', {
                            kitchenId: kitchen.id,
                            kitchenName: kitchen.name,
                          })
                        }
                      />
                    </View>
                  ) : kitchensActive && kitchenQuery.isError ? (
                    <Pressable
                      onPress={() => kitchenQuery.refetch()}
                      style={styles.inlineRetry}
                      accessibilityRole="button"
                      accessibilityLabel="Retry kitchens"
                    >
                      <Text style={[theme.text.caption, styles.inlineRetryText]}>
                        Could not load kitchens. Tap to retry.
                      </Text>
                    </Pressable>
                  ) : null}

                  {showDishesHeading ? (
                    <>
                      <Text style={[theme.text.h4, styles.sectionTitle, styles.dishesTitle]}>
                        Dishes
                      </Text>
                      <ChipRow style={styles.sortRow}>
                        <Pressable
                          onPress={() => filterSheetRef.current?.open()}
                          accessibilityRole="button"
                          accessibilityLabel="Filter and sort"
                          style={styles.sortIcon}
                        >
                          <SlidersHorizontal
                            size={15}
                            color={theme.colors.text.secondary}
                            strokeWidth={2.2}
                          />
                          {hasActiveFilters ? <View style={styles.filterBadge} /> : null}
                        </Pressable>
                        {SORTS.map((sort) => (
                          <Chip
                            key={sort.key}
                            label={sort.label}
                            selected={sortBy === sort.key}
                            onPress={() => setSortBy(sort.key)}
                          />
                        ))}
                      </ChipRow>
                    </>
                  ) : null}
                </View>
              }
              ListEmptyComponent={
                dishesLoading ? (
                  <View style={styles.loading}>
                    <MealCardSkeleton />
                    <MealCardSkeleton />
                  </View>
                ) : feedQuery.isError ? (
                  <EmptyState
                    icon={<AlertCircle size={34} color={theme.colors.state.error} strokeWidth={1.8} />}
                    title="Could not load results"
                    description="Check your connection and try again."
                    actionLabel="Retry"
                    onAction={() => {
                      feedQuery.refetch();
                      if (kitchensActive) kitchenQuery.refetch();
                    }}
                  />
                ) : showKitchens ? null : (
                  <EmptyState
                    illustration={<EmptySearch size={190} />}
                    title={debounced ? `No results for "${debounced}"` : 'No meals match these filters'}
                    description="Try a different dish or kitchen, or drop one of the filters."
                    actionLabel={hasActiveFilters ? 'Clear filters' : undefined}
                    onAction={resetFilters}
                  />
                )
              }
              ListFooterComponent={feedQuery.isFetchingNextPage ? <MealCardSkeleton /> : null}
              renderItem={({ item }) => (
                <MealCard
                  meal={item}
                  style={styles.card}
                  onPress={() =>
                    navigation.navigate('MealDetail', { mealId: item.id, mealName: item.name })
                  }
                  onAdd={() => addToCart(item)}
                  quantity={getQuantity(item.id)}
                  onChangeQuantity={(next) => changeQuantity(item.id, next)}
                  onToggleFavorite={() => toggleFavorite.mutate(item.id)}
                />
              )}
            />
          </Animated.View>
          </Animated.View>
        ) : null}
      </View>

      <SearchFiltersSheet
        ref={filterSheetRef}
        goalOptions={GOAL_OPTIONS}
        goalTags={goalTags}
        onToggleGoal={toggleGoal}
        foodTypes={foodTypes}
        onToggleFoodType={toggleFoodType}
        sortBy={sortBy}
        onChangeSortBy={setSortBy}
        priceRange={priceRange}
        onChangePriceRange={setPriceRange}
        minProtein={minProtein}
        onChangeMinProtein={setMinProtein}
        maxCalories={maxCalories}
        onChangeMaxCalories={setMaxCalories}
        onReset={resetFilters}
        onApply={() => filterSheetRef.current?.close()}
        resultCount={meals.length}
      />

      {conflictDialog}
    </View>
  );
};

/** BlurView guarded so a missing native module degrades to the scrim alone. */
class SafeBlur extends React.Component<
  { blurType: 'light' | 'dark'; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  componentDidCatch() {
    this.setState({ failed: true });
    this.props.onError();
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return null;
    return (
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType={this.props.blurType}
        blurAmount={16}
        reducedTransparencyFallbackColor="transparent"
      />
    );
  }
}

export default Search;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  bar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    height: BAR_HEIGHT,
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.radius.pill,
    ...theme.elevation.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    color: theme.colors.text.primary,
  },
  panelFade: {
    flex: 1,
  },
  section: {
    paddingTop: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.sm,
  },
  dishesTitle: {
    paddingTop: theme.spacing.lg,
    paddingBottom: 0,
  },
  inlineRetry: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.md,
  },
  inlineRetryText: {
    color: theme.colors.state.error,
  },
  barActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.subtle,
  },
  closeBtn: {
    width: CLOSE_SIZE,
    height: CLOSE_SIZE,
    borderRadius: CLOSE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.subtle,
  },
  panel: {
    flex: 1,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface.page,
    borderTopLeftRadius: theme.radius.card,
    borderTopRightRadius: theme.radius.card,
    overflow: 'hidden',
  },
  categoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: theme.layout.screenPadding,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface.brandWash,
    borderWidth: 1,
    borderColor: theme.colors.borders.brand,
  },
  categoryBannerText: {
    color: theme.colors.primary[700],
    flex: 1,
  },
  sortRow: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  sortIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 2,
  },
  filterBadge: {
    position: 'absolute',
    top: -1,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary[600],
  },
  // The surrounding list already supplies the screen gutter.
  loading: {
    gap: theme.spacing.md,
  },
  list: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl + MINI_CART_BAR_CLEARANCE,
  },
  listEmpty: {
    flexGrow: 1,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
});
