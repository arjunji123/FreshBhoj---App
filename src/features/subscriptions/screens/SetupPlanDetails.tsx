import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, Button, Chip, ChipRow, QuantityStepper, Screen, StickyBar } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import type { BillingCycle, DayOfWeek, FoodType, MealSlot } from '@api/types';
import { useSetupPlanStore } from '../store/setupPlanStore';

// Same labels/order as `SubscriptionPlanCard.tsx` — the two flows should feel related.
const DIET_LABEL: Record<FoodType, string> = { VEG: 'Veg', EGG: 'Egg', NON_VEG: 'Non-Veg', VEGAN: 'Vegan' };
const FOOD_TYPES: FoodType[] = ['VEG', 'EGG', 'NON_VEG', 'VEGAN'];

const SLOT_LABEL: Record<MealSlot, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACKS: 'Snacks',
};
const SLOTS: MealSlot[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'];

const DAY_LABEL: Record<DayOfWeek, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};
const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const CYCLES: Array<{ key: BillingCycle; label: string }> = [
  { key: 'WEEKLY', label: 'Weekly' },
  { key: 'MONTHLY', label: 'Monthly' },
];

/** Step 1 of 3 — every term here is freely chosen by the customer, unlike the kitchen-authored plan flow. */
const SetupPlanDetails = () => {
  const navigation = useNavigation<PrivateNavigation>();

  const kitchenId = useSetupPlanStore((s) => s.kitchenId);
  const kitchenName = useSetupPlanStore((s) => s.kitchenName);
  const foodType = useSetupPlanStore((s) => s.foodType);
  const mealsPerDay = useSetupPlanStore((s) => s.mealsPerDay);
  const deliveryDays = useSetupPlanStore((s) => s.deliveryDays);
  const deliveryTime = useSetupPlanStore((s) => s.deliveryTime);
  const billingCycle = useSetupPlanStore((s) => s.billingCycle);
  const setPlanDetails = useSetupPlanStore((s) => s.setPlanDetails);

  // No kitchen chosen — this screen has nothing to build a plan against.
  useEffect(() => {
    if (!kitchenId) navigation.goBack();
  }, [kitchenId, navigation]);

  const toggleDay = (day: DayOfWeek) => {
    const next = deliveryDays.includes(day)
      ? deliveryDays.filter((d) => d !== day)
      : [...deliveryDays, day];
    setPlanDetails({ deliveryDays: next });
  };

  const canContinue = Boolean(foodType) && deliveryDays.length > 0 && Boolean(deliveryTime) && Boolean(billingCycle);

  return (
    <Screen background="page">
      <AppBar title="Plan details" subtitle="Step 1 of 3" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {kitchenName ? (
          <Text style={[theme.text.bodySmall, styles.kitchenLine]}>For {kitchenName}</Text>
        ) : null}

        <Text style={[theme.text.label, styles.sectionLabel]}>Diet preference</Text>
        <ChipRow style={styles.chipRow}>
          {FOOD_TYPES.map((diet) => (
            <Chip
              key={diet}
              label={DIET_LABEL[diet]}
              selected={foodType === diet}
              onPress={() => setPlanDetails({ foodType: diet })}
            />
          ))}
        </ChipRow>

        <Text style={[theme.text.label, styles.sectionLabel]}>Meals per day</Text>
        <QuantityStepper
          value={mealsPerDay}
          onChange={(next) => setPlanDetails({ mealsPerDay: next })}
          min={1}
          max={3}
          style={styles.stepper}
        />

        <Text style={[theme.text.label, styles.sectionLabel]}>Delivery days</Text>
        <ChipRow style={styles.chipRow}>
          {DAYS.map((day) => (
            <Chip key={day} label={DAY_LABEL[day]} selected={deliveryDays.includes(day)} onPress={() => toggleDay(day)} />
          ))}
        </ChipRow>

        <Text style={[theme.text.label, styles.sectionLabel]}>Delivery slot</Text>
        <ChipRow style={styles.chipRow}>
          {SLOTS.map((slot) => (
            <Chip
              key={slot}
              label={SLOT_LABEL[slot]}
              selected={deliveryTime === slot}
              onPress={() => setPlanDetails({ deliveryTime: slot })}
            />
          ))}
        </ChipRow>

        <Text style={[theme.text.label, styles.sectionLabel]}>Billing cycle</Text>
        <View style={styles.cycleRow}>
          {CYCLES.map(({ key, label }) => (
            <Chip
              key={key}
              label={label}
              selected={billingCycle === key}
              onPress={() => setPlanDetails({ billingCycle: key })}
              style={styles.cycleChip}
            />
          ))}
        </View>
      </ScrollView>

      <StickyBar>
        <Button
          title="Continue"
          onPress={() => navigation.navigate('SetupPlanDelivery')}
          disabled={!canContinue}
        />
      </StickyBar>
    </Screen>
  );
};

export default SetupPlanDetails;

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxl,
  },
  kitchenLine: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  sectionLabel: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  chipRow: {
    paddingHorizontal: 0,
  },
  stepper: {
    marginTop: theme.spacing.xs,
  },
  cycleRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  cycleChip: {
    flex: 1,
    justifyContent: 'center',
  },
});
