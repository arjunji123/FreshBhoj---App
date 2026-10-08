import React, { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AlertCircle, Heart } from 'lucide-react-native';
import { AppBar, EmptyState, MealCardSkeleton } from '@components/ui';
import MealCard from '@components/MealCard';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useFavorites, useToggleFavorite } from '@features/meals/hooks/useMeals';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import { useCartQuantityControls } from '@features/cart/hooks/useCart';
import { MINI_CART_BAR_CLEARANCE } from '@components/MiniCartBar';
import { useTheme } from "@app/theme/useTheme";

const Favorites = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const { data, isLoading, isError, isRefetching, refetch } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const { addToCart, conflictDialog } = useAddToCartFlow();
  const { getQuantity, changeQuantity } = useCartQuantityControls();

  return (
    <View style={styles.screen}>
      <AppBar title="Favourite meals" onBack={navigation.goBack} />

      {isLoading ? (
        <View style={styles.loading}>
          <MealCardSkeleton />
          <MealCardSkeleton />
        </View>
      ) : isError && !data ? (
        <EmptyState
          icon={<AlertCircle size={34} color={theme.colors.state.error} strokeWidth={1.8} />}
          title="Could not load your favourites"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : (
        <FlatList
          data={data?.items ?? []}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={theme.colors.primary[600]}
            />
          }
          keyExtractor={(meal) => meal.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            !data?.items.length ? styles.listEmpty : null,
          ]}
          ListEmptyComponent={
            <EmptyState
              icon={<Heart size={34} color={theme.colors.primary[600]} strokeWidth={1.8} />}
              title="No favourites yet"
              description="Tap the heart on any meal and it lands here for next time."
              actionLabel="Browse meals"
              onAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            />
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

      {conflictDialog}
    </View>
  );
};

export default Favorites;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  loading: {
    padding: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  list: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl + MINI_CART_BAR_CLEARANCE,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    marginBottom: theme.spacing.md,
  },
});
