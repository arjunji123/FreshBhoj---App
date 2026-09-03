import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heart } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { AppBar, EmptyState, MealCardSkeleton } from '@components/ui';
import MealCard from '@components/MealCard';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useFavorites, useToggleFavorite } from '@features/meals/hooks/useMeals';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';

const Favorites = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { data, isLoading } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const { addToCart, conflictDialog } = useAddToCartFlow();

  return (
    <View style={styles.screen}>
      <AppBar title="Favourite meals" onBack={navigation.goBack} />

      {isLoading ? (
        <View style={styles.loading}>
          <MealCardSkeleton />
          <MealCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
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

const styles = StyleSheet.create({
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
    paddingBottom: theme.spacing.xxxl,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    marginBottom: theme.spacing.md,
  },
});
