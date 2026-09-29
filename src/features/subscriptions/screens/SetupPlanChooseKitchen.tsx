import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChefHat, Search as SearchIcon, X } from 'lucide-react-native';
import { theme as staticTheme } from '@app/theme/index';
import { useTheme } from '@app/theme/useTheme';
import { AppBar, EmptyState, Input, KitchenCardSkeleton, Screen } from '@components/ui';
import KitchenCard from '@components/KitchenCard';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { flattenPages } from '@features/meals/hooks/useMeals';
import { useKitchens } from '@features/kitchens/hooks/useKitchens';
import { useSetupPlanStore } from '../store/setupPlanStore';

/**
 * Step 0 of the bespoke Setup Plan wizard — no "browse all kitchens" screen
 * exists anywhere else in this app (Search only covers meals, Home's rail is
 * a 6-item preview), so this is a genuinely new screen built on the
 * already-capable `useKitchens` hook.
 */
const SetupPlanChooseKitchen = () => {
  const theme = useTheme();
  const navigation = useNavigation<PrivateNavigation>();
  const reset = useSetupPlanStore((s) => s.reset);
  const setKitchen = useSetupPlanStore((s) => s.setKitchen);

  // A fresh entry into the wizard's first screen must never leak state from
  // a previous, abandoned attempt.
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 320);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useKitchens({
    q: debounced || undefined,
  });
  const kitchens = useMemo(() => flattenPages(data?.pages), [data]);

  const handleSelect = (kitchenId: string, kitchenName: string) => {
    setKitchen(kitchenId, kitchenName);
    navigation.navigate('SetupPlanDetails');
  };

  return (
    <Screen background="page">
      <AppBar title="Choose a kitchen" subtitle="Set up your own plan" onBack={navigation.goBack} />

      <View style={styles.searchWrap}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search kitchens by name or locality"
          autoCorrect={false}
          returnKeyType="search"
          leftIcon={<SearchIcon size={18} color={theme.colors.text.tertiary} strokeWidth={2.2} />}
          rightIcon={
            query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={staticTheme.layout.hitSlop}>
                <X size={16} color={theme.colors.text.tertiary} strokeWidth={2.2} />
              </Pressable>
            ) : undefined
          }
        />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <KitchenCardSkeleton />
          <KitchenCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={kitchens}
          keyExtractor={(kitchen) => kitchen.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, !kitchens.length ? styles.listEmpty : null]}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          ListEmptyComponent={
            <EmptyState
              icon={<ChefHat size={34} color={staticTheme.colors.primary[600]} strokeWidth={1.8} />}
              title="No kitchens found"
              description="Try a different name or locality."
            />
          }
          renderItem={({ item }) => (
            <KitchenCard
              kitchen={item}
              layout="full"
              style={styles.card}
              onPress={() => handleSelect(item.id, item.name)}
            />
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={staticTheme.colors.primary[600]} />
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
};

export default SetupPlanChooseKitchen;

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: staticTheme.layout.screenPadding,
    paddingBottom: staticTheme.spacing.md,
  },
  loading: {
    padding: staticTheme.layout.screenPadding,
    gap: staticTheme.spacing.md,
  },
  list: {
    padding: staticTheme.layout.screenPadding,
    paddingBottom: staticTheme.spacing.xxxl,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    marginBottom: staticTheme.spacing.md,
  },
  footerLoading: {
    paddingVertical: staticTheme.spacing.lg,
    alignItems: 'center',
  },
});
