import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, RefreshControl, StyleSheet, Switch, Text, View } from 'react-native';
import { Flame, Plus, Sparkles, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { Badge, Button, Card, Chip, ChipRow, EmptyState, FoodTypeDot, Screen, Skeleton } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useDeleteMeal, useKitchenMenu, useSetMealAvailability } from '../hooks/useKitchenPortal';
import type { MealDetail } from '../kitchenPartner.types';

const ALL_CATEGORY = 'ALL';

const KitchenMenu = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const query = useKitchenMenu();
  const setAvailability = useSetMealAvailability();
  const deleteMeal = useDeleteMeal();
  const [categorySlug, setCategorySlug] = useState<string>(ALL_CATEGORY);

  const categories = useMemo(() => {
    const bySlug = new Map<string, string>();
    (query.data ?? []).forEach((meal) => {
      if (meal.category) bySlug.set(meal.category.slug, meal.category.name);
    });
    return Array.from(bySlug.entries()).map(([slug, name]) => ({ slug, name }));
  }, [query.data]);

  const confirmDelete = (meal: MealDetail) => {
    Alert.alert('Remove this dish?', `"${meal.name}" will be removed permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          deleteMeal.mutate(meal.id, {
            onError: (error) =>
              Alert.alert('Could not remove dish', error instanceof KitchenApiError ? error.message : 'Please try again.'),
          }),
      },
    ]);
  };

  const meals = useMemo(() => {
    if (categorySlug === ALL_CATEGORY) return query.data ?? [];
    return (query.data ?? []).filter((meal) => meal.category?.slug === categorySlug);
  }, [query.data, categorySlug]);

  return (
    <Screen background="page">
      <View style={styles.header}>
        <View>
          <Text style={theme.text.h1}>Menu</Text>
          {query.data ? <Text style={styles.subtitle}>{`${query.data.length} dish${query.data.length === 1 ? '' : 'es'}`}</Text> : null}
        </View>
        <Button title="Add dish" leftIcon={<Plus size={16} color={theme.colors.palette.white} />} size="sm" fullWidth={false} onPress={() => navigation.navigate('KitchenMealForm')} />
      </View>

      {categories.length > 0 ? (
        <ChipRow style={styles.categoryRow}>
          <Chip label="All" selected={categorySlug === ALL_CATEGORY} onPress={() => setCategorySlug(ALL_CATEGORY)} />
          {categories.map((category) => (
            <Chip
              key={category.slug}
              label={category.name}
              selected={categorySlug === category.slug}
              onPress={() => setCategorySlug(category.slug)}
            />
          ))}
        </ChipRow>
      ) : null}

      {query.isError ? (
        <View style={styles.emptyPadding}>
          <EmptyState title="Something went wrong" description="We couldn't load your menu." actionLabel="Retry" onAction={() => query.refetch()} />
        </View>
      ) : query.isLoading ? (
        <View style={styles.listPadding}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={104} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.sm }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={meals.length ? styles.listPadding : styles.emptyPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.colors.primary[600]} />}
          ListEmptyComponent={
            categorySlug !== ALL_CATEGORY ? (
              <EmptyState title="No dishes in this category" description="Try a different category, or add a new dish here." actionLabel="Add a dish" onAction={() => navigation.navigate('KitchenMealForm')} />
            ) : (
              <EmptyState
                icon={<Sparkles size={28} color={theme.colors.text.tertiary} />}
                title="No dishes yet"
                description="Add your first dish and let AI estimate its nutrition for you."
                actionLabel="Add a dish"
                onAction={() => navigation.navigate('KitchenMealForm')}
              />
            )
          }
          renderItem={({ item }) => (
            <MealRow
              meal={item}
              onToggle={(value) =>
                setAvailability.mutate(
                  { id: item.id, isAvailable: value },
                  {
                    onError: (error) =>
                      Alert.alert('Could not update dish', error instanceof KitchenApiError ? error.message : 'Please try again.'),
                  },
                )
              }
              onPress={() => navigation.navigate('KitchenMealForm', { mealId: item.id })}
              onDelete={() => confirmDelete(item)}
              isBusy={(deleteMeal.isPending && deleteMeal.variables === item.id) || (setAvailability.isPending && setAvailability.variables?.id === item.id)}
            />
          )}
        />
      )}
    </Screen>
  );
};

function MealRow({
  meal,
  onToggle,
  onPress,
  onDelete,
  isBusy,
}: {
  meal: MealDetail;
  onToggle: (value: boolean) => void;
  onPress: () => void;
  onDelete: () => void;
  isBusy: boolean;
}) {
  return (
    <Card style={styles.mealCard} onPress={onPress}>
      <View style={styles.mealRow}>
        {meal.image ? (
          <Image source={{ uri: meal.image }} style={styles.mealImage} />
        ) : (
          <View style={[styles.mealImage, styles.mealImagePlaceholder]} />
        )}
        <View style={styles.mealInfo}>
          <View style={styles.mealNameRow}>
            <FoodTypeDot type={meal.foodType} size={12} />
            <Text style={styles.mealName} numberOfLines={1}>
              {meal.name}
            </Text>
          </View>
          {meal.category ? <Text style={styles.mealCategory}>{meal.category.name}</Text> : null}
          <Text style={styles.mealPrice}>{`₹${meal.price}`}</Text>
          <View style={styles.mealMetaRow}>
            <Flame size={11} color={theme.colors.text.tertiary} />
            <Text style={styles.mealMeta}>{`${meal.nutrition.calories ?? 0} kcal · ${meal.nutrition.proteinG ?? 0}g protein`}</Text>
          </View>
          <View style={styles.mealBadges}>
            <Badge label={meal.isAvailable ? 'Live' : 'Draft'} tone={meal.isAvailable ? 'accent' : 'neutral'} size="sm" />
            {meal.isBestseller ? <Badge label="Bestseller" tone="warning" size="sm" /> : null}
          </View>
        </View>
        <View style={styles.mealActions}>
          <Switch
            value={meal.isAvailable}
            onValueChange={onToggle}
            disabled={isBusy}
            accessibilityLabel={meal.isAvailable ? `Pause ${meal.name}` : `Publish ${meal.name}`}
            trackColor={{ true: theme.colors.brand.primary }}
          />
          <Pressable
            onPress={onDelete}
            disabled={isBusy}
            hitSlop={theme.layout.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${meal.name}`}
            style={styles.deleteButton}
          >
            <Trash2 size={16} color={theme.colors.text.danger} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

export default KitchenMenu;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.paddings.sm,
    paddingBottom: theme.spacing.paddings.md,
  },
  categoryRow: { marginBottom: theme.spacing.paddings.sm },
  listPadding: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl },
  emptyPadding: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.layout.screenPadding },
  mealCard: { marginBottom: theme.spacing.paddings.sm, padding: theme.spacing.paddings.sm },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm },
  mealImage: { width: 56, height: 56, borderRadius: theme.radius.md },
  mealImagePlaceholder: { backgroundColor: theme.colors.surface.subtle },
  mealInfo: { flex: 1 },
  mealNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mealName: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const, flexShrink: 1 },
  mealPrice: { ...theme.text.caption, color: theme.colors.text.secondary, marginTop: 2 },
  mealBadges: { flexDirection: 'row', gap: 4, marginTop: 4 },
  subtitle: { ...theme.text.caption, color: theme.colors.text.tertiary },
  mealCategory: { ...theme.text.caption, color: theme.colors.text.tertiary },
  mealMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  mealMeta: { ...theme.text.caption, color: theme.colors.text.tertiary },
  mealActions: { alignItems: 'center', gap: 2 },
  deleteButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
