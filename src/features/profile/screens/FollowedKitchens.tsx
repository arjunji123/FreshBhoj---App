import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChefHat, Search as SearchIcon, X } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { AppBar, EmptyState, Input, KitchenCardSkeleton } from '@components/ui';
import KitchenCard from '@components/KitchenCard';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useFollowedKitchens } from '@features/kitchens/hooks/useKitchens';

const FollowedKitchens = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { data, isLoading } = useFollowedKitchens();
  const [query, setQuery] = useState('');

  const kitchens = useMemo(() => data?.items ?? [], [data?.items]);

  // The followed list is small enough to filter client-side — no new endpoint needed.
  const filteredKitchens = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return kitchens;
    return kitchens.filter((kitchen) => kitchen.name.toLowerCase().includes(term));
  }, [kitchens, query]);

  const hasSearch = query.trim().length > 0;

  return (
    <View style={styles.screen}>
      <AppBar title="Kitchens you follow" onBack={navigation.goBack} />

      {!isLoading && kitchens.length > 0 ? (
        <View style={styles.searchWrap}>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Search followed kitchens..."
            autoCorrect={false}
            autoCapitalize="none"
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
      ) : null}

      {isLoading ? (
        <View style={styles.loading}>
          <KitchenCardSkeleton />
          <KitchenCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredKitchens}
          keyExtractor={(kitchen) => kitchen.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.list, !filteredKitchens.length ? styles.listEmpty : null]}
          ListEmptyComponent={
            hasSearch ? (
              <EmptyState
                icon={<SearchIcon size={34} color={theme.colors.primary[600]} strokeWidth={1.8} />}
                title={`No matches for "${query.trim()}"`}
                description="Try a different kitchen name."
              />
            ) : (
              <EmptyState
                icon={<ChefHat size={34} color={theme.colors.primary[600]} strokeWidth={1.8} />}
                title="Not following anyone yet"
                description="Follow a kitchen and their new dishes and reels show up in your feed."
                actionLabel="Discover kitchens"
                onAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
              />
            )
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
  searchWrap: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
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
