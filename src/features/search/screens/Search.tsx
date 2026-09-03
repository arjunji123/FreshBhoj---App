import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Search as SearchIcon, SlidersHorizontal, TrendingUp, X } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import type { GoalTag } from '@api/types';
import {
  Chip,
  ChipRow,
  EmptyState,
  Input,
  MealCardSkeleton,
  Screen,
  VerifiedBadge,
} from '@components/ui';
import MealCard from '@components/MealCard';
import type { MainTabParamList, PrivateNavigation } from '@app/navigation/navigation.types';
import { flattenPages, useMealFeed, useToggleFavorite } from '@features/meals/hooks/useMeals';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import { useSearchSuggestions } from '@features/home/hooks/useHomeFeed';
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

  // Debounced so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 320);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: suggestions } = useSearchSuggestions();
  const toggleFavorite = useToggleFavorite();
  const { addToCart, conflictDialog } = useAddToCartFlow();

  const hasCriteria = debounced.length > 1 || goalTags.length > 0;

  const filters = useMemo(
    () => ({
      q: debounced || undefined,
      goalTags: goalTags.length ? goalTags : undefined,
      category: params?.category,
      sortBy,
    }),
    [debounced, goalTags, params?.category, sortBy],
  );

  const feedQuery = useMealFeed(filters);
  const meals = flattenPages(feedQuery.data?.pages);

  const toggleGoal = (tag: GoalTag) =>
    setGoalTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Input
          value={query}
          onChangeText={setQuery}
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

      <ChipRow style={styles.goalRow}>
        {(suggestions?.goalTags ?? []).map((option) => (
          <Chip
            key={option.key}
            label={option.label}
            selected={goalTags.includes(option.key)}
            onPress={() => toggleGoal(option.key)}
          />
        ))}
      </ChipRow>

      {hasCriteria ? (
        <>
          <ChipRow style={styles.sortRow}>
            <View style={styles.sortIcon}>
              <SlidersHorizontal size={15} color={theme.colors.text.secondary} strokeWidth={2.2} />
            </View>
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
                  description="Try a different dish, or drop one of the goal filters."
                  actionLabel={goalTags.length ? 'Clear filters' : undefined}
                  onAction={() => setGoalTags([])}
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
                  onToggleFavorite={() => toggleFavorite.mutate(item.id)}
                />
              )}
            />
          )}
        </>
      ) : (
        <View style={styles.suggestions}>
          {suggestions?.trendingSearches.length ? (
            <>
              <View style={styles.sectionRow}>
                <TrendingUp size={16} color={theme.colors.primary[600]} strokeWidth={2.4} />
                <Text style={[theme.text.overline, styles.sectionLabel]}>TRENDING SEARCHES</Text>
              </View>
              <View style={styles.tagCloud}>
                {suggestions.trendingSearches.map((term) => (
                  <Pressable
                    key={term}
                    onPress={() => setQuery(term)}
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
                  <View style={styles.kitchenAvatar} />
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
  goalRow: {
    paddingVertical: theme.spacing.lg,
  },
  sortRow: {
    paddingBottom: theme.spacing.md,
  },
  sortIcon: {
    justifyContent: 'center',
    paddingRight: 2,
  },
  loading: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  list: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl,
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
    backgroundColor: theme.colors.primary[50],
  },
  kitchenName: {
    flexShrink: 1,
  },
});
