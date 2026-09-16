import React from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Switch, Text, View } from 'react-native';
import { Plus, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { Badge, Button, Card, EmptyState, Screen, Skeleton } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { useKitchenMenu, useSetMealAvailability } from '../hooks/useKitchenPortal';
import type { MealDetail } from '../kitchenPartner.types';

const KitchenMenu = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const query = useKitchenMenu();
  const setAvailability = useSetMealAvailability();

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Text style={theme.text.h1}>Menu</Text>
        <Button title="Add dish" leftIcon={<Plus size={16} color={theme.colors.palette.white} />} size="sm" fullWidth={false} onPress={() => navigation.navigate('KitchenMealForm')} />
      </View>

      {query.isLoading ? (
        <View style={styles.listPadding}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={104} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.sm }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={query.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={query.data?.length ? styles.listPadding : styles.emptyPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.colors.primary[600]} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Sparkles size={28} color={theme.colors.text.tertiary} />}
              title="No dishes yet"
              description="Add your first dish and let AI estimate its nutrition for you."
              actionLabel="Add a dish"
              onAction={() => navigation.navigate('KitchenMealForm')}
            />
          }
          renderItem={({ item }) => (
            <MealRow
              meal={item}
              onToggle={(value) => setAvailability.mutate({ id: item.id, isAvailable: value })}
              onPress={() => navigation.navigate('KitchenMealForm', { mealId: item.id })}
            />
          )}
        />
      )}
    </Screen>
  );
};

function MealRow({ meal, onToggle, onPress }: { meal: MealDetail; onToggle: (value: boolean) => void; onPress: () => void }) {
  return (
    <Card style={styles.mealCard} onPress={onPress}>
      <View style={styles.mealRow}>
        {meal.image ? (
          <Image source={{ uri: meal.image }} style={styles.mealImage} />
        ) : (
          <View style={[styles.mealImage, styles.mealImagePlaceholder]} />
        )}
        <View style={styles.mealInfo}>
          <Text style={styles.mealName} numberOfLines={1}>
            {meal.name}
          </Text>
          <Text style={styles.mealPrice}>{`₹${meal.price}`}</Text>
          <View style={styles.mealBadges}>
            <Badge label={meal.foodType.replace('_', ' ')} tone="neutral" size="sm" />
            {meal.isBestseller ? <Badge label="Bestseller" tone="warning" size="sm" /> : null}
          </View>
        </View>
        <Switch value={meal.isAvailable} onValueChange={onToggle} trackColor={{ true: theme.colors.brand.primary }} />
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
  listPadding: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl },
  emptyPadding: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.layout.screenPadding },
  mealCard: { marginBottom: theme.spacing.paddings.sm, padding: theme.spacing.paddings.sm },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm },
  mealImage: { width: 56, height: 56, borderRadius: theme.radius.md },
  mealImagePlaceholder: { backgroundColor: theme.colors.surface.subtle },
  mealInfo: { flex: 1 },
  mealName: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  mealPrice: { ...theme.text.caption, color: theme.colors.text.secondary, marginTop: 2 },
  mealBadges: { flexDirection: 'row', gap: 4, marginTop: 4 },
});
