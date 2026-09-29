import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { ApiError } from '@api';
import type { MealSortBy } from '@api/endpoints/meals.api';
import type { MealCard } from '@api/types';
import { Button, Chip, ChipRow, EmptyState, Sheet, Skeleton } from '@components/ui';
import type { SheetHandle } from '@components/ui';
import { flattenPages, useMealFeed } from '@features/meals/hooks/useMeals';
import { useSwapDeliveryMeal } from '../hooks/useSubscriptions';

const SORT_FILTERS: Array<{ key: MealSortBy; label: string }> = [
  { key: 'prep_time_low', label: 'Fastest' },
  { key: 'calories_low', label: 'Low Calorie' },
  { key: 'protein_high', label: 'High Protein' },
];

interface SwapMealSheetProps {
  sheetRef: React.RefObject<SheetHandle | null>;
  subscriptionId: string;
  kitchenId: string;
  /** `YYYY-MM-DD` — the delivery this swap targets. */
  date: string;
  /** Pre-selects a dish (e.g. tapped from the "Swap with Favourites" row) — the customer still confirms it below. */
  initialMealId?: string | null;
}

/**
 * Lets the customer pick a different dish for one upcoming delivery, browsing
 * only their own kitchen's menu. Mirrors `SubscriptionPlanCard`'s
 * `Sheet`/`SheetHandle` usage — the parent screen owns the ref and decides
 * when to open it.
 */
const SwapMealSheet: React.FC<SwapMealSheetProps> = ({
  sheetRef,
  subscriptionId,
  kitchenId,
  date,
  initialMealId,
}) => {
  const [sortBy, setSortBy] = useState<MealSortBy | undefined>(undefined);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(initialMealId ?? null);
  const swapMeal = useSwapDeliveryMeal();

  useEffect(() => {
    setSelectedMealId(initialMealId ?? null);
  }, [initialMealId]);

  const query = useMealFeed({ kitchenId, sortBy, limit: 20 });
  const meals = flattenPages(query.data?.pages);

  const reset = () => {
    setSortBy(undefined);
    swapMeal.reset();
  };

  const handleConfirm = () => {
    if (!selectedMealId) return;
    swapMeal.mutate(
      { subscriptionId, date, mealId: selectedMealId },
      { onSuccess: () => sheetRef.current?.close() },
    );
  };

  return (
    <Sheet
      ref={sheetRef}
      title="Swap this delivery's dish"
      eyebrow="Change of plan?"
      heightRatio={0.82}
      onClose={reset}
    >
      <View style={styles.filterWrap}>
        <ChipRow>
          {SORT_FILTERS.map((filter) => (
            <Chip
              key={filter.key}
              label={filter.label}
              selected={sortBy === filter.key}
              onPress={() => setSortBy((current) => (current === filter.key ? undefined : filter.key))}
            />
          ))}
        </ChipRow>
      </View>

      {query.isLoading ? (
        <View style={styles.loading}>
          <Skeleton height={72} radius={theme.radius.card} />
          <Skeleton height={72} radius={theme.radius.card} />
          <Skeleton height={72} radius={theme.radius.card} />
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(meal) => meal.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
          }}
          ListEmptyComponent={
            <EmptyState
              title="No dishes available"
              description="This kitchen doesn't have anything on the menu right now."
            />
          }
          renderItem={({ item }) => (
            <MealRow meal={item} selected={item.id === selectedMealId} onPress={() => setSelectedMealId(item.id)} />
          )}
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <ActivityIndicator color={theme.colors.primary[600]} style={styles.footerLoader} />
            ) : null
          }
        />
      )}

      <View style={styles.footer}>
        {swapMeal.isError ? (
          <Text style={[theme.text.bodySmall, styles.errorText]}>
            {swapMeal.error instanceof ApiError ? swapMeal.error.message : 'Could not swap the dish. Please try again.'}
          </Text>
        ) : null}
        <Button
          title={swapMeal.isPending ? 'Swapping…' : 'Confirm Swap'}
          onPress={handleConfirm}
          loading={swapMeal.isPending}
          disabled={!selectedMealId || swapMeal.isPending}
        />
      </View>
    </Sheet>
  );
};

const MealRow: React.FC<{ meal: MealCard; selected: boolean; onPress: () => void }> = ({
  meal,
  selected,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    style={[styles.row, selected ? styles.rowSelected : null]}
  >
    {meal.image ? (
      <Image source={{ uri: meal.image }} style={styles.rowImage} resizeMode="cover" />
    ) : (
      <View style={[styles.rowImage, styles.rowImageFallback]} />
    )}
    <View style={styles.rowText}>
      <Text style={[theme.text.bodyMedium, styles.rowName]} numberOfLines={1}>
        {meal.name}
      </Text>
      <Text style={[theme.text.caption, styles.rowMeta]} numberOfLines={1}>
        {[
          meal.nutrition.calories ? `${meal.nutrition.calories} kcal` : null,
          meal.nutrition.proteinG ? `${meal.nutrition.proteinG}g protein` : null,
          meal.prepTimeMins ? `${meal.prepTimeMins} min` : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>
    </View>
    {selected ? (
      <View style={styles.checkCircle}>
        <Check size={14} color={theme.colors.text.inverse} strokeWidth={3} />
      </View>
    ) : null}
  </Pressable>
);

export default SwapMealSheet;

const styles = StyleSheet.create({
  filterWrap: {
    paddingBottom: theme.spacing.md,
  },
  loading: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.sm,
  },
  list: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.sm,
    flexGrow: 1,
  },
  footerLoader: {
    marginVertical: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.card,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.surface.base,
  },
  rowSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.surface.brandWash,
  },
  rowImage: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
  },
  rowImageFallback: {
    backgroundColor: theme.colors.neutral[100],
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    color: theme.colors.text.primary,
  },
  rowMeta: {
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.state.error,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
});
