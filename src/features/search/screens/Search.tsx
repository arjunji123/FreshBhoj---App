import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Clock, Search as SearchIcon, SlidersHorizontal, TrendingUp, X } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import type { FoodType, GoalTag } from '@api/types';
import {
  Chip,
  ChipRow,
  EmptyState,
  Input,
  MealCardSkeleton,
  Screen,
  VerifiedBadge,
  type SheetHandle,
} from '@components/ui';
import MealCard from '@components/MealCard';
import type { MainTabParamList, PrivateNavigation } from '@app/navigation/navigation.types';
import { flattenPages, useMealFeed, useToggleFavorite } from '@features/meals/hooks/useMeals';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import { useCartQuantityControls } from '@features/cart/hooks/useCart';
import { useSearchSuggestions } from '@features/home/hooks/useHomeFeed';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { MINI_CART_BAR_CLEARANCE } from '@components/MiniCartBar';
import SearchFiltersSheet, { type PriceRange } from '../components/SearchFiltersSheet';
import type { MealSortBy } from '@api/endpoints/meals.api';

type Route = RouteProp<MainTabParamList, 'Search'>;

const SORTS: Array<{ key: MealSortBy; label: string }> = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'protein_high', label: 'Most protein' },
  { key: 'calories_low', label: 'Fewest calories' },
  { key: 'price_low', label: 'Price: low to high' },
  { key: 'rating', label: 'Top rated' },
];

/**
 * Search. Before a query is typed it shows trending searches and popular
 * kitchens; once typed it becomes the same infinite meal feed as Home, with
 * nutrition-first sorting options that a generic food app doesn't offer.
 */
const Search = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();

  const [query, setQuery] = useState(params?.query ?? '');
  const [debounced, setDebounced] = useState(query);
  const [goalTags, setGoalTags] = useState<GoalTag[]>(params?.goalTag ? [params.goalTag] : []);
  const [sortBy, setSortBy] = useState<MealSortBy>('recommended');
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>({});
  const [minProtein, setMinProtein] = useState<number | undefined>();
  const [maxCalories, setMaxCalories] = useState<number | undefined>();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const filterSheetRef = useRef<SheetHandle>(null);

  // Debounced so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 320);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: suggestions } = useSearchSuggestions();
  const toggleFavorite = useToggleFavorite();
  const { addToCart, conflictDialog } = useAddToCartFlow();
  const { getQuantity, changeQuantity } = useCartQuantityControls();
  const { history, addTerm, removeTerm, clearAll } = useSearchHistory();

  const hasActiveFilters =
    goalTags.length > 0 ||
    foodTypes.length > 0 ||
    Boolean(priceRange.minPrice || priceRange.maxPrice) ||
    Boolean(minProtein) ||
    Boolean(maxCalories);
  const hasCriteria = debounced.length > 1 || hasActiveFilters || Boolean(params?.category);
  const showHistory = isInputFocused && query.trim().length === 0 && history.length > 0;

  // Records a term once it actually drove a search, not on every keystroke.
  useEffect(() => {
    if (debounced.length > 1) addTerm(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const runSearch = (term: string) => {
    setQuery(term);
    setIsInputFocused(false);
  };

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

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Input
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onSubmitEditing={() => addTerm(query)}
          placeholder="Search healthy meals..."
          autoCorrect={false}
          returnKeyType="search"
          leftIcon={<SearchIcon size={18} color={theme.colors.text.tertiary} strokeWidth={2.2} />}
          rightIcon={
            query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={theme.layout.hitSlop}>
                <X size={17} color={theme.colors.text.tertiary} strokeWidth={2.4} />
              </Pressable>
            ) : undefined
          }
        />
      </View>

      {params?.category ? (
        <View style={styles.categoryBanner}>
          <Text style={[theme.text.h4, styles.categoryBannerText]} numberOfLines={1}>
            {params.categoryName ?? 'Filtered results'}
          </Text>
          <Pressable
            onPress={() => navigation.setParams({ category: undefined, categoryName: undefined })}
            hitSlop={theme.layout.hitSlop}
            accessibilityLabel="Clear category filter"
          >
            <X size={16} color={theme.colors.primary[700]} strokeWidth={2.4} />
          </Pressable>
        </View>
      ) : null}

      {hasCriteria ? (
        <>
          <ChipRow style={styles.sortRow}>
            <Pressable
              onPress={() => filterSheetRef.current?.open()}
              accessibilityRole="button"
              accessibilityLabel="Filter and sort"
              style={styles.sortIcon}
            >
              <SlidersHorizontal size={15} color={theme.colors.text.secondary} strokeWidth={2.2} />
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

          {feedQuery.isLoading ? (
            <View style={styles.loading}>
              <MealCardSkeleton />
              <MealCardSkeleton />
              <MealCardSkeleton />
            </View>
          ) : (
            <FlatList
              data={meals}
              keyExtractor={(meal) => meal.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.list, !meals.length ? styles.listEmpty : null]}
              onEndReachedThreshold={0.4}
              onEndReached={() => {
                if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
                  feedQuery.fetchNextPage();
                }
              }}
              ListEmptyComponent={
                <EmptyState
                  icon={
                    <SearchIcon size={34} color={theme.colors.primary[600]} strokeWidth={1.8} />
                  }
                  title={`No results for "${debounced}"`}
                  description="Try a different dish, or drop one of the filters."
                  actionLabel={hasActiveFilters ? 'Clear filters' : undefined}
                  onAction={resetFilters}
                />
              }
              ListFooterComponent={
                feedQuery.isFetchingNextPage ? <MealCardSkeleton /> : null
              }
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
          )}
        </>
      ) : (
        <View style={styles.suggestions}>
          {showHistory ? (
            <>
              <View style={styles.sectionRow}>
                <Clock size={16} color={theme.colors.primary[600]} strokeWidth={2.4} />
                <Text style={[theme.text.overline, styles.sectionLabel, styles.sectionLabelFlex]}>
                  RECENT SEARCHES
                </Text>
                <Pressable onPress={clearAll} hitSlop={theme.layout.hitSlop}>
                  <Text style={[theme.text.label, styles.clearAll]}>Clear all</Text>
                </Pressable>
              </View>
              <View style={styles.historyList}>
                {history.map((term) => (
                  <Pressable
                    key={term}
                    onPress={() => runSearch(term)}
                    style={({ pressed }) => [styles.historyRow, pressed ? styles.pressed : null]}
                  >
                    <Clock size={15} color={theme.colors.text.tertiary} strokeWidth={2.2} />
                    <Text style={[theme.text.body, styles.historyText]} numberOfLines={1}>
                      {term}
                    </Text>
                    <Pressable
                      onPress={() => removeTerm(term)}
                      hitSlop={theme.layout.hitSlop}
                      accessibilityLabel={`Remove ${term} from history`}
                    >
                      <X size={16} color={theme.colors.text.tertiary} strokeWidth={2.2} />
                    </Pressable>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {suggestions?.trendingSearches.length ? (
            <>
              <View style={styles.sectionRow}>
                <TrendingUp size={16} color={theme.colors.primary[600]} strokeWidth={2.4} />
                <Text style={[theme.text.overline, styles.sectionLabel]}>TRENDING SEARCHES</Text>
              </View>
              <View style={styles.tagCloud}>
                {suggestions.trendingSearches.map((term, index) => (
                  <Pressable
                    key={`${term}-${index}`}
                    onPress={() => runSearch(term)}
                    style={({ pressed }) => [styles.tag, pressed ? styles.pressed : null]}
                  >
                    <Text style={[theme.text.label, styles.tagText]} numberOfLines={1}>
                      {term}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {suggestions?.popularKitchens.length ? (
            <>
              <View style={styles.sectionRow}>
                <Text style={[theme.text.overline, styles.sectionLabel]}>POPULAR KITCHENS</Text>
              </View>
              {suggestions.popularKitchens.map((kitchen) => (
                <Pressable
                  key={kitchen.id}
                  onPress={() =>
                    navigation.navigate('KitchenProfile', {
                      kitchenId: kitchen.id,
                      kitchenName: kitchen.name,
                    })
                  }
                  style={({ pressed }) => [styles.kitchenRow, pressed ? styles.pressed : null]}
                >
                  {kitchen.logoUrl ? (
                    <Image source={{ uri: kitchen.logoUrl }} style={styles.kitchenAvatar} />
                  ) : (
                    <View style={[styles.kitchenAvatar, styles.kitchenAvatarFallback]} />
                  )}
                  <Text style={[theme.text.h4, styles.kitchenName]} numberOfLines={1}>
                    {kitchen.name}
                  </Text>
                  {kitchen.isVerified ? <VerifiedBadge /> : null}
                </Pressable>
              ))}
            </>
          ) : null}
        </View>
      )}

      <SearchFiltersSheet
        ref={filterSheetRef}
        goalOptions={suggestions?.goalTags ?? []}
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
    </Screen>
  );
};

export default Search;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.md,
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
    paddingTop: theme.spacing.lg,
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
  loading: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  list: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl + MINI_CART_BAR_CLEARANCE,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  suggestions: {
    paddingHorizontal: theme.layout.screenPadding,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    color: theme.colors.text.tertiary,
  },
  sectionLabelFlex: {
    flex: 1,
  },
  clearAll: {
    color: theme.colors.primary[600],
  },
  historyList: {
    marginBottom: theme.spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  historyText: {
    flex: 1,
    color: theme.colors.text.primary,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.raised,
    borderWidth: 1,
    borderColor: theme.colors.borders.subtle,
    maxWidth: 220,
  },
  tagText: {
    color: theme.colors.text.secondary,
  },
  pressed: {
    opacity: 0.75,
  },
  kitchenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  kitchenAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  kitchenAvatarFallback: {
    backgroundColor: theme.colors.primary[50],
  },
  kitchenName: {
    flexShrink: 1,
  },
});
