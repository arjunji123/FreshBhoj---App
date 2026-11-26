import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle, ArrowLeft } from 'lucide-react-native';
import AppGradient from '@components/AppGradient';
import MealCard from '@components/MealCard';
import EmptyPhoto from '@components/EmptyPhoto';
import { MINI_CART_BAR_CLEARANCE } from '@components/MiniCartBar';
import PressableScale from '@animations/PressableScale';
import { Chip, ChipRow, EmptyState, MealCardSkeleton, Text } from '@components/ui';
import type { MealSortBy } from '@api/endpoints/meals.api';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import { useCartQuantityControls } from '@features/cart/hooks/useCart';
import { useTheme } from '@app/theme/useTheme';
import { flattenPages, useMealFeed, useToggleFavorite } from '../hooks/useMeals';

type Route = RouteProp<PrivateStackParamList, 'CategoryMeals'>;

const SORTS: Array<{ key: MealSortBy; label: string }> = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'rating', label: 'Top rated' },
  { key: 'protein_high', label: 'Most protein' },
  { key: 'calories_low', label: 'Fewest calories' },
  { key: 'price_low', label: 'Price: low to high' },
];


/** One meal category (Breakfast, Lunch, …): a slim green header, sort chips, then its dishes. */
const CategoryMeals = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();

  const [sortBy, setSortBy] = useState<MealSortBy>('recommended');
  const filters = useMemo(() => ({ category: params.slug, sortBy }), [params.slug, sortBy]);
  const feed = useMealFeed(filters);
  const meals = flattenPages(feed.data?.pages);

  const toggleFavorite = useToggleFavorite();
  const { addToCart, conflictDialog } = useAddToCartFlow();
  const { getQuantity, changeQuantity } = useCartQuantityControls();

  return (
    <View style={styles.screen}>
      {/* One-row header in the same brand green as the Home header. */}
      <AppGradient
        colors={theme.colors.gradients.brand}
        locations={theme.colors.gradients.brandLocations}
        style={[styles.hero, { paddingTop: insets.top + theme.spacing.sm }]}
      >
        <View pointerEvents="none" style={styles.orbLarge} />
        <View pointerEvents="none" style={styles.orbSmall} />
        <PressableScale
          onPress={navigation.goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.back}
        >
          <ArrowLeft size={20} color={theme.colors.text.primary} strokeWidth={2.4} />
        </PressableScale>
        <Text style={styles.heroTitle} numberOfLines={1}>
          {params.name}
        </Text>
      </AppGradient>

      <View>
        <ChipRow style={styles.sortRow}>
          {SORTS.map((sort) => (
            <Chip
              key={sort.key}
              label={sort.label}
              selected={sortBy === sort.key}
              onPress={() => setSortBy(sort.key)}
            />
          ))}
        </ChipRow>
      </View>

      <FlatList
        data={meals}
        keyExtractor={(meal) => meal.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.xxxl + MINI_CART_BAR_CLEARANCE }}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
        }}
        ListEmptyComponent={
          feed.isLoading ? (
            <View style={styles.loading}>
              <MealCardSkeleton />
              <MealCardSkeleton />
            </View>
          ) : feed.isError ? (
            <EmptyState
              icon={<AlertCircle size={34} color={theme.colors.state.error} strokeWidth={1.8} />}
              title="Could not load dishes"
              description="Check your connection and try again."
              actionLabel="Retry"
              onAction={() => feed.refetch()}
            />
          ) : (
            <EmptyState
              illustration={<EmptyPhoto kind="search" size={170} />}
              title={`No ${params.name.toLowerCase()} dishes yet`}
              description="Check back soon, kitchens add new dishes often."
            />
          )
        }
        ListFooterComponent={
          feed.isFetchingNextPage ? (
            <View style={styles.loading}>
              <MealCardSkeleton />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <MealCard
            meal={item}
            style={styles.card}
            onPress={() => navigation.navigate('MealDetail', { mealId: item.id, mealName: item.name })}
            onAdd={() => addToCart(item)}
            quantity={getQuantity(item.id)}
            onChangeQuantity={(next) => changeQuantity(item.id, next)}
            onToggleFavorite={() => toggleFavorite.mutate(item.id)}
          />
        )}
      />

      {conflictDialog}
    </View>
  );
};

export default CategoryMeals;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.surface.page },
    hero: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingHorizontal: theme.layout.screenPadding,
      paddingBottom: theme.spacing.md,
      overflow: 'hidden',
      borderBottomLeftRadius: theme.radius.xl,
      borderBottomRightRadius: theme.radius.xl,
    },
    orbLarge: {
      position: 'absolute',
      width: 160,
      height: 160,
      borderRadius: 80,
      right: -40,
      top: -60,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    orbSmall: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      right: 90,
      bottom: -48,
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    heroTitle: { ...theme.text.h2, flex: 1, color: theme.colors.palette.white },
    back: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.raised,
    },
    sortRow: { paddingVertical: theme.spacing.md },
    loading: { paddingHorizontal: theme.layout.screenPadding, gap: theme.spacing.md },
    card: { marginHorizontal: theme.layout.screenPadding, marginBottom: theme.spacing.lg },
  });
