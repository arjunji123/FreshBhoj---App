import React, { useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { ListChecks, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, AppBarAction, Badge, Button, Card, Chip, ChipRow, EmptyState, Input, Screen, Sheet, Skeleton, Text } from '@components/ui';
import type { SheetHandle } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useCreatePlan, useSubscriptionPlans, useUpdatePlan } from '../hooks/useKitchenPortal';
import type {
  BillingCycle,
  CreateSubscriptionPlanInput,
  DayOfWeek,
  FoodType,
  SubscriptionDeliveryTime,
  SubscriptionPlan,
} from '../kitchenPartner.types';

const DAY_OPTIONS: { key: DayOfWeek; label: string }[] = [
  { key: 'MONDAY', label: 'Mon' },
  { key: 'TUESDAY', label: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wed' },
  { key: 'THURSDAY', label: 'Thu' },
  { key: 'FRIDAY', label: 'Fri' },
  { key: 'SATURDAY', label: 'Sat' },
  { key: 'SUNDAY', label: 'Sun' },
];

const DIET_OPTIONS: { key: FoodType; label: string }[] = [
  { key: 'VEG', label: 'Veg' },
  { key: 'EGG', label: 'Egg' },
  { key: 'NON_VEG', label: 'Non-Veg' },
  { key: 'VEGAN', label: 'Vegan' },
];

const SLOT_OPTIONS: { key: SubscriptionDeliveryTime; label: string }[] = [
  { key: 'BREAKFAST', label: 'Breakfast' },
  { key: 'LUNCH', label: 'Lunch' },
  { key: 'DINNER', label: 'Dinner' },
  { key: 'SNACKS', label: 'Snacks' },
];

const DIET_LABEL: Record<FoodType, string> = Object.fromEntries(DIET_OPTIONS.map((d) => [d.key, d.label])) as Record<FoodType, string>;
const SLOT_LABEL: Record<SubscriptionDeliveryTime, string> = Object.fromEntries(SLOT_OPTIONS.map((s) => [s.key, s.label])) as Record<
  SubscriptionDeliveryTime,
  string
>;

const MEALS_PER_DAY_OPTIONS = [1, 2, 3];

function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function dayCountLabel(days: DayOfWeek[]): string {
  return days.length === 7 ? 'Every day' : `${days.length} day${days.length === 1 ? '' : 's'}/week`;
}

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * Reusable subscription plan templates a kitchen authors once — customers
 * browse and subscribe to them from the public kitchen profile (Part 2 of
 * this feature, in `@features/kitchens`). Separate from the bespoke
 * customer-request subscription flow (`Subscribers.tsx`), which is untouched.
 */
const ManagePlans = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const query = useSubscriptionPlans();
  const updatePlan = useUpdatePlan();

  const sheetRef = useRef<SheetHandle>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formNonce, setFormNonce] = useState(0);

  const openCreate = () => {
    setEditingPlan(null);
    setFormNonce((n) => n + 1);
    sheetRef.current?.open();
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormNonce((n) => n + 1);
    sheetRef.current?.open();
  };

  const handleToggleActive = (plan: SubscriptionPlan) => {
    updatePlan.mutate(
      { id: plan.id, input: { isActive: !plan.isActive } },
      { onError: (error) => Alert.alert('Could not update', error instanceof KitchenApiError ? error.message : 'Please try again.') },
    );
  };

  return (
    <Screen background="page">
      <AppBar
        title="Manage Plans"
        onBack={() => navigation.goBack()}
        right={
          <AppBarAction accessibilityLabel="Create plan" onPress={openCreate}>
            <Plus size={20} color={theme.colors.text.primary} strokeWidth={2.4} />
          </AppBarAction>
        }
      />

      {query.isLoading ? (
        <View style={styles.listPadding}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={180} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.sm }} />
          ))}
        </View>
      ) : query.isError ? (
        <View style={styles.emptyPadding}>
          <EmptyState title="Something went wrong" description="We couldn't load your subscription plans." actionLabel="Retry" onAction={() => query.refetch()} />
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
              icon={<ListChecks size={28} color={theme.colors.text.tertiary} />}
              title="No subscription plans yet"
              description="Create a reusable plan customers can browse and subscribe to from your kitchen profile."
              actionLabel="Create a Plan"
              onAction={openCreate}
            />
          }
          renderItem={({ item }) => (
            <PlanCard
              plan={item}
              onPress={() => openEdit(item)}
              onToggleActive={() => handleToggleActive(item)}
              isTogglingActive={updatePlan.isPending && updatePlan.variables?.id === item.id}
            />
          )}
        />
      )}

      <Sheet ref={sheetRef} title={editingPlan ? 'Edit Plan' : 'Create Plan'} heightRatio={0.94}>
        <PlanForm key={`${editingPlan?.id ?? 'new'}-${formNonce}`} plan={editingPlan} onDone={() => sheetRef.current?.close()} />
      </Sheet>
    </Screen>
  );
};

function PlanCard({
  plan,
  onPress,
  onToggleActive,
  isTogglingActive,
}: {
  plan: SubscriptionPlan;
  onPress: () => void;
  onToggleActive: () => void;
  isTogglingActive: boolean;
}) {
  return (
    <Card style={styles.planCard} onPress={onPress}>
      <View style={styles.planTopRow}>
        <View style={styles.planNameWrap}>
          {plan.isPopular ? <Badge label="POPULAR" tone="brand" variant="solid" size="sm" style={styles.popularBadge} /> : null}
          <Text variant="h4" numberOfLines={1}>
            {plan.name}
          </Text>
        </View>
        <Switch value={plan.isActive} onValueChange={onToggleActive} disabled={isTogglingActive} trackColor={{ true: theme.colors.brand.primary }} />
      </View>

      <View style={styles.priceWrap}>
        <Text variant="h3">{formatRupees(plan.priceRs)}</Text>
        {plan.originalPriceRs && plan.originalPriceRs > plan.priceRs ? <Text style={styles.mrp}>{formatRupees(plan.originalPriceRs)}</Text> : null}
      </View>

      <Text variant="caption" color="tertiary">
        {plan.billingCycle === 'WEEKLY' ? 'Weekly' : 'Monthly'} · {dayCountLabel(plan.deliveryDays)} · {plan.mealsPerDay}× daily
      </Text>

      <View style={styles.pillRow}>
        {plan.dietOptions.map((diet) => (
          <Badge key={diet} label={DIET_LABEL[diet]} tone="accent" size="sm" />
        ))}
        {plan.jainAvailable ? <Badge label="Jain" tone="neutral" size="sm" /> : null}
        {plan.slotOptions.map((slot) => (
          <Badge key={slot} label={SLOT_LABEL[slot]} tone="neutral" size="sm" />
        ))}
      </View>

      <Text variant="caption" color="tertiary" style={styles.subscriberCount}>
        {plan.subscriberCount} subscriber{plan.subscriberCount === 1 ? '' : 's'}
      </Text>
    </Card>
  );
}

function PlanForm({ plan, onDone }: { plan: SubscriptionPlan | null; onDone: () => void }) {
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const isSaving = createPlan.isPending || updatePlan.isPending;

  const [name, setName] = useState(plan?.name ?? '');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(plan?.billingCycle ?? 'WEEKLY');
  const [deliveryDays, setDeliveryDays] = useState<DayOfWeek[]>(plan?.deliveryDays ?? []);
  const [mealsPerDay, setMealsPerDay] = useState<number>(plan?.mealsPerDay ?? 1);
  const [priceRs, setPriceRs] = useState(plan ? String(plan.priceRs) : '');
  const [originalPriceRs, setOriginalPriceRs] = useState(plan?.originalPriceRs ? String(plan.originalPriceRs) : '');
  const [dietOptions, setDietOptions] = useState<FoodType[]>(plan?.dietOptions ?? []);
  const [jainAvailable, setJainAvailable] = useState(plan?.jainAvailable ?? false);
  const [slotOptions, setSlotOptions] = useState<SubscriptionDeliveryTime[]>(plan?.slotOptions ?? []);
  const [includesDescription, setIncludesDescription] = useState(plan?.includesDescription ?? '');
  const [isPopular, setIsPopular] = useState(plan?.isPopular ?? false);

  const handleSubmit = () => {
    if (!name.trim()) return Alert.alert('Missing name', 'Give this plan a name.');
    if (deliveryDays.length === 0) return Alert.alert('Pick delivery days', 'Select at least one delivery day.');
    if (dietOptions.length === 0) return Alert.alert('Pick diet options', 'Select at least one diet option this plan offers.');
    if (slotOptions.length === 0) return Alert.alert('Pick delivery slots', 'Select at least one delivery slot this plan offers.');

    const price = Number(priceRs);
    if (!price || price <= 0) return Alert.alert('Enter a price', 'Enter a valid price for this plan.');

    const originalPrice = originalPriceRs.trim() ? Number(originalPriceRs) : undefined;
    if (originalPrice !== undefined && (Number.isNaN(originalPrice) || originalPrice <= price)) {
      return Alert.alert('Check the original price', 'The original price must be higher than the plan price to show a discount.');
    }

    if (!includesDescription.trim()) return Alert.alert('Add a description', "Describe what's included in this plan.");

    const input: CreateSubscriptionPlanInput = {
      name: name.trim(),
      billingCycle,
      deliveryDays,
      mealsPerDay,
      priceRs: price,
      originalPriceRs: originalPrice,
      dietOptions,
      jainAvailable,
      slotOptions,
      includesDescription: includesDescription.trim(),
      isPopular,
    };

    const onError = (error: unknown) =>
      Alert.alert(plan ? 'Could not update plan' : 'Could not create plan', error instanceof KitchenApiError ? error.message : 'Please try again.');

    if (plan) {
      updatePlan.mutate({ id: plan.id, input }, { onSuccess: onDone, onError });
    } else {
      createPlan.mutate(input, { onSuccess: onDone, onError });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Input label="Plan name" value={name} onChangeText={setName} placeholder="e.g. Weekday Lunch Combo" containerStyle={styles.field} />

      <Text variant="overline" color="tertiary" style={styles.sheetLabel}>
        BILLING CYCLE
      </Text>
      <ChipRow>
        {(['WEEKLY', 'MONTHLY'] as BillingCycle[]).map((cycle) => (
          <Chip key={cycle} label={cycle === 'WEEKLY' ? 'Weekly' : 'Monthly'} selected={billingCycle === cycle} onPress={() => setBillingCycle(cycle)} />
        ))}
      </ChipRow>

      <Text variant="overline" color="tertiary" style={[styles.sheetLabel, styles.sheetSectionGap]}>
        DELIVERY DAYS
      </Text>
      <ChipRow>
        {DAY_OPTIONS.map((day) => (
          <Chip
            key={day.key}
            label={day.label}
            selected={deliveryDays.includes(day.key)}
            onPress={() => setDeliveryDays((prev) => toggleIn(prev, day.key))}
          />
        ))}
      </ChipRow>

      <Text variant="overline" color="tertiary" style={[styles.sheetLabel, styles.sheetSectionGap]}>
        MEALS PER DAY
      </Text>
      <ChipRow>
        {MEALS_PER_DAY_OPTIONS.map((n) => (
          <Chip key={n} label={String(n)} selected={mealsPerDay === n} onPress={() => setMealsPerDay(n)} />
        ))}
      </ChipRow>

      <View style={[styles.priceRow, styles.sheetSectionGap]}>
        <Input
          label="Price (₹)"
          value={priceRs}
          onChangeText={setPriceRs}
          keyboardType="number-pad"
          placeholder="e.g. 1499"
          containerStyle={styles.priceField}
        />
        <Input
          label="Original price (optional)"
          value={originalPriceRs}
          onChangeText={setOriginalPriceRs}
          keyboardType="number-pad"
          placeholder="e.g. 1799"
          containerStyle={styles.priceField}
        />
      </View>

      <Text variant="overline" color="tertiary" style={[styles.sheetLabel, styles.sheetSectionGap]}>
        DIET OPTIONS
      </Text>
      <ChipRow>
        {DIET_OPTIONS.map((diet) => (
          <Chip
            key={diet.key}
            label={diet.label}
            selected={dietOptions.includes(diet.key)}
            onPress={() => setDietOptions((prev) => toggleIn(prev, diet.key))}
          />
        ))}
      </ChipRow>

      <Text variant="overline" color="tertiary" style={[styles.sheetLabel, styles.sheetSectionGap]}>
        DELIVERY SLOTS
      </Text>
      <ChipRow>
        {SLOT_OPTIONS.map((slot) => (
          <Chip
            key={slot.key}
            label={slot.label}
            selected={slotOptions.includes(slot.key)}
            onPress={() => setSlotOptions((prev) => toggleIn(prev, slot.key))}
          />
        ))}
      </ChipRow>

      <Input
        label="What's included"
        value={includesDescription}
        onChangeText={setIncludesDescription}
        placeholder="e.g. 1 roti basket, dal, sabzi, rice, salad daily"
        multiline
        containerStyle={[styles.field, styles.sheetSectionGap]}
      />

      <View style={[styles.switchRow, styles.sheetSectionGap]}>
        <Text variant="bodyMedium">Offer a Jain-style option</Text>
        <Switch value={jainAvailable} onValueChange={setJainAvailable} trackColor={{ true: theme.colors.brand.primary }} />
      </View>

      <View style={styles.switchRow}>
        <Text variant="bodyMedium">Mark as Popular</Text>
        <Switch value={isPopular} onValueChange={setIsPopular} trackColor={{ true: theme.colors.brand.primary }} />
      </View>

      <Button
        title={isSaving ? 'Saving…' : plan ? 'Save Changes' : 'Create Plan'}
        onPress={handleSubmit}
        loading={isSaving}
        disabled={isSaving}
        style={styles.sheetSubmit}
      />
    </ScrollView>
  );
}

export default ManagePlans;

const styles = StyleSheet.create({
  listPadding: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.xxl },
  emptyPadding: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.layout.screenPadding },
  planCard: { marginBottom: theme.spacing.paddings.sm },
  planTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.paddings.sm },
  planNameWrap: { flex: 1 },
  popularBadge: { marginBottom: theme.spacing.paddings.xs, alignSelf: 'flex-start' },
  priceWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: theme.spacing.paddings.xs },
  mrp: { ...theme.text.bodySmall, color: theme.colors.text.tertiary, textDecorationLine: 'line-through' },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.paddings.xs,
    marginTop: theme.spacing.paddings.sm,
    paddingTop: theme.spacing.paddings.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  subscriberCount: { marginTop: theme.spacing.paddings.sm },
  sheetContent: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl },
  sheetLabel: { marginBottom: theme.spacing.paddings.sm },
  sheetSectionGap: { marginTop: theme.spacing.paddings.lg },
  field: { marginBottom: 0 },
  priceRow: { flexDirection: 'row', gap: theme.spacing.paddings.sm },
  priceField: { flex: 1, marginBottom: 0 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetSubmit: { marginTop: theme.spacing.paddings.xl },
});
