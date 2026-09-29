import React, { useRef, useState, useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '@utils/format';
import { ApiError } from '@api';
import type { CreateSubscriptionFromPlanInput, FoodType, MealSlot, SubscriptionPlan } from '@api/types';
import { Badge, Button, Card, Chip, ChipRow, Sheet, SummaryRow } from '@components/ui';
import type { SheetHandle } from '@components/ui';
import { useSubscribeToPlan } from '../hooks/useKitchens';
import { useTheme } from "@app/theme/useTheme";

const DIET_LABEL: Record<FoodType, string> = { VEG: 'Veg', EGG: 'Egg', NON_VEG: 'Non-Veg', VEGAN: 'Vegan' };
const SLOT_LABEL: Record<MealSlot, string> = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner', SNACKS: 'Snacks' };
const JAIN_KEY = 'JAIN';

function dayCountLabel(days: string[]): string {
  return days.length === 7 ? 'Every day' : `${days.length} day${days.length === 1 ? '' : 's'}/week`;
}

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  kitchenId: string;
}

/**
 * A browsable plan template on the kitchen profile's Subscriptions tab.
 *
 * The diet row doubles as the Jain decision: when `plan.jainAvailable`, a
 * "Jain" chip joins the plan's own diet options as one more mutually
 * exclusive choice — picking it is both the diet pick and an explicit "yes"
 * to Jain-style, picking any other diet chip is an explicit "no". That keeps
 * this to one piece of local state instead of two, while still satisfying
 * "disabled until a diet option is picked, and until Jain is explicitly
 * decided when the plan offers it".
 */
const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({ plan, kitchenId }) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const [dietKey, setDietKey] = useState<FoodType | typeof JAIN_KEY | null>(null);
  const [slot, setSlot] = useState<MealSlot | null>(null);
  const sheetRef = useRef<SheetHandle>(null);
  const subscribe = useSubscribeToPlan();

  const canSubscribe = Boolean(dietKey) && Boolean(slot);
  const isJainPick = dietKey === JAIN_KEY;

  const resolveFoodType = (): FoodType => {
    if (!isJainPick) return dietKey as FoodType;
    // Jain-style is a veg-family preference — fall back through the plan's
    // own diet options for whichever veg-ish type it actually offers.
    if (plan.dietOptions.includes('VEG')) return 'VEG';
    if (plan.dietOptions.includes('VEGAN')) return 'VEGAN';
    return plan.dietOptions[0];
  };

  const handleOpenSummary = () => {
    if (!canSubscribe) return;
    sheetRef.current?.open();
  };

  const handleConfirm = () => {
    if (!slot || !dietKey) return;

    const input: CreateSubscriptionFromPlanInput = {
      kitchenId,
      planId: plan.id,
      foodType: resolveFoodType(),
      deliveryTime: slot,
      ...(plan.jainAvailable ? { jainRequested: isJainPick } : {}),
    };

    subscribe.mutate(input, {
      onSuccess: () => {
        sheetRef.current?.close();
        Alert.alert('Request sent', 'The kitchen will confirm your subscription shortly.');
      },
      onError: (error) => {
        Alert.alert('Could not subscribe', error instanceof ApiError ? error.message : 'Please try again.');
      },
    });
  };

  return (
    <Card style={styles.card}>
      {plan.isPopular ? <Badge label="POPULAR" tone="brand" variant="solid" size="sm" style={styles.popularBadge} /> : null}

      <Text style={[theme.text.h3, styles.name]} numberOfLines={2}>
        {plan.name}
      </Text>

      <View style={styles.priceRow}>
        <Text style={[theme.text.h2, styles.price]}>{formatCurrency(plan.priceRs)}</Text>
        {plan.originalPriceRs && plan.originalPriceRs > plan.priceRs ? (
          <Text style={[theme.text.bodySmall, styles.mrp]}>{formatCurrency(plan.originalPriceRs)}</Text>
        ) : null}
        <Text style={[theme.text.bodySmall, styles.cycleSuffix]}>/{plan.billingCycle === 'WEEKLY' ? 'week' : 'month'}</Text>
      </View>

      <Text style={[theme.text.bodySmall, styles.metaLine]}>
        {dayCountLabel(plan.deliveryDays)} · {plan.mealsPerDay}× daily
      </Text>

      <Text style={[theme.text.label, styles.sectionLabel]}>Diet preference</Text>
      <ChipRow style={styles.chipRow}>
        {plan.dietOptions.map((diet) => (
          <Chip key={diet} label={DIET_LABEL[diet]} selected={dietKey === diet} onPress={() => setDietKey(diet)} />
        ))}
        {plan.jainAvailable ? <Chip label="Jain" selected={isJainPick} onPress={() => setDietKey(JAIN_KEY)} /> : null}
      </ChipRow>

      <Text style={[theme.text.label, styles.sectionLabel]}>Delivery slot</Text>
      <ChipRow style={styles.chipRow}>
        {plan.slotOptions.map((option) => (
          <Chip key={option} label={SLOT_LABEL[option]} selected={slot === option} onPress={() => setSlot(option)} />
        ))}
      </ChipRow>

      <Text style={[theme.text.bodySmall, styles.description]}>{plan.includesDescription}</Text>

      <Button title="Subscribe Now" onPress={handleOpenSummary} disabled={!canSubscribe} style={styles.subscribeButton} />

      <Sheet ref={sheetRef} title="Confirm your subscription" eyebrow={plan.name} heightRatio={0.6}>
        <View style={styles.sheetBody}>
          <SummaryRow label="Diet" value={isJainPick ? 'Jain' : dietKey ? DIET_LABEL[dietKey as FoodType] : '—'} />
          <SummaryRow label="Delivery slot" value={slot ? SLOT_LABEL[slot] : '—'} />
          <SummaryRow label="Meals per day" value={String(plan.mealsPerDay)} />
          <SummaryRow label="Billing" value={`${formatCurrency(plan.priceRs)} / ${plan.billingCycle === 'WEEKLY' ? 'week' : 'month'}`} tone="total" />

          <Text style={[theme.text.bodySmall, styles.sheetHint]}>
            The kitchen still needs to confirm this — you&apos;ll see it as pending until they approve it.
          </Text>

          <Button
            title={subscribe.isPending ? 'Sending…' : 'Request Subscription'}
            onPress={handleConfirm}
            loading={subscribe.isPending}
            style={styles.sheetSubmit}
          />
        </View>
      </Sheet>
    </Card>
  );
};

export default SubscriptionPlanCard;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  popularBadge: {
    marginBottom: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  name: {
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    color: theme.colors.text.primary,
  },
  mrp: {
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  cycleSuffix: {
    color: theme.colors.text.tertiary,
  },
  metaLine: {
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  sectionLabel: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  chipRow: {
    paddingHorizontal: 0,
  },
  description: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
  },
  subscribeButton: {
    marginTop: theme.spacing.lg,
  },
  sheetBody: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.sm,
  },
  sheetHint: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sheetSubmit: {
    marginBottom: theme.spacing.md,
  },
});
