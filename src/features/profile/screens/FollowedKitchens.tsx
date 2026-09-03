import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChefHat } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { AppBar, EmptyState, KitchenCardSkeleton } from '@components/ui';
import KitchenCard from '@components/KitchenCard';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useFollowedKitchens } from '@features/kitchens/hooks/useKitchens';

const FollowedKitchens = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { data, isLoading } = useFollowedKitchens();

  return (
    <View style={styles.screen}>
      <AppBar title="Kitchens you follow" onBack={navigation.goBack} />

      {isLoading ? (
        <View style={styles.loading}>
          <KitchenCardSkeleton />
          <KitchenCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(kitchen) => kitchen.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, !data?.items.length ? styles.listEmpty : null]}
          ListEmptyComponent={
            <EmptyState
              icon={<ChefHat size={34} color={theme.colors.primary[600]} strokeWidth={1.8} />}
              title="Not following anyone yet"
              description="Follow a kitchen and their new dishes and reels show up in your feed."
              actionLabel="Discover kitchens"
              onAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            />
          }
          renderItem={({ item }) => (
            <KitchenCard
              kitchen={item}
              layout="full"
              style={styles.card}
              onPress={() =>
                navigation.navigate('KitchenProfile', {
                  kitchenId: item.id,
                  kitchenName: item.name,
                })
              }
            />
          )}
        />
      )}
    </View>
  );
};

export default FollowedKitchens;

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
