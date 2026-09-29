import React, { useEffect, useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Coins, Wallet as WalletIcon } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import { ApiError } from '@api';
import type {
  CreateBespokeSubscriptionInput,
  DayOfWeek,
  FoodType,
  MealSlot,
  SubscriptionQuoteInput,
} from '@api/types';
import { Button, Card, Divider, Screen, AppBar, Skeleton, StickyBar, SummaryRow } from '@components/ui';
import PaymentMethodPicker from '@features/cart/components/PaymentMethodPicker';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useAddresses, useDefaultAddress } from '@features/profile/hooks/useProfile';
import { useWalletSummary } from '@features/wallet/hooks/useWallet';
import { useSetupPlanStore } from '../store/setupPlanStore';
import { useCreateBespokeSubscription, useSubscriptionQuote } from '../hooks/useSetupPlan';

const DIET_LABEL: Record<FoodType, string> = { VEG: 'Veg', EGG: 'Egg', NON_VEG: 'Non-Veg', VEGAN: 'Vegan' };
const SLOT_LABEL: Record<MealSlot, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACKS: 'Snacks',
};

function dayCountLabel(days: DayOfWeek[]): string {
  return days.length === 7 ? 'Every day' : `${days.length} day${days.length === 1 ? '' : 's'}/week`;
}

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

/** Step 3 of 3 — real, server-quoted price; "Confirm & Pay" is the only place this wizard actually writes anything. */
const SetupPlanReview = () => {
  const navigation = useNavigation<PrivateNavigation>();

  const kitchenId = useSetupPlanStore((s) => s.kitchenId);
  const kitchenName = useSetupPlanStore((s) => s.kitchenName);
  const foodType = useSetupPlanStore((s) => s.foodType);
  const mealsPerDay = useSetupPlanStore((s) => s.mealsPerDay);
  const deliveryDays = useSetupPlanStore((s) => s.deliveryDays);
  const deliveryTime = useSetupPlanStore((s) => s.deliveryTime);
  const billingCycle = useSetupPlanStore((s) => s.billingCycle);
  const addressId = useSetupPlanStore((s) => s.addressId);
  const startDate = useSetupPlanStore((s) => s.startDate);
  const specialInstructions = useSetupPlanStore((s) => s.specialInstructions);
  const paymentMethod = useSetupPlanStore((s) => s.paymentMethod);
  const requestedCoins = useSetupPlanStore((s) => s.requestedCoins);
  const setPaymentMethod = useSetupPlanStore((s) => s.setPaymentMethod);
  const setRequestedCoins = useSetupPlanStore((s) => s.setRequestedCoins);

  // Missing any prerequisite (shouldn't happen through the normal flow, but
  // defends against a stale/incomplete store) — bounce back rather than
  // submit something the backend would 400 on anyway.
  useEffect(() => {
    if (!kitchenId || !foodType || !deliveryTime || !billingCycle) navigation.goBack();
  }, [kitchenId, foodType, deliveryTime, billingCycle, navigation]);

  // Coins are only ever evaluated for WALLET — leaving a stale redemption
  // selected while parked on another method would be misleading once the
  // customer switches back.
  useEffect(() => {
    if (paymentMethod !== 'WALLET' && requestedCoins > 0) setRequestedCoins(0);
  }, [paymentMethod, requestedCoins, setRequestedCoins]);

  const { data: addresses } = useAddresses();
  const { data: defaultAddress } = useDefaultAddress();
  const selectedAddress = useMemo(
    () => addresses?.find((address) => address.id === addressId) ?? defaultAddress ?? null,
    [addresses, addressId, defaultAddress],
  );

  const quoteInput: SubscriptionQuoteInput = useMemo(
    () => ({
      kitchenId: kitchenId ?? '',
      mealsPerDay,
      deliveryDays,
      billingCycle: billingCycle ?? undefined,
      paymentMethod,
      requestedCoins: paymentMethod === 'WALLET' ? requestedCoins : undefined,
    }),
    [kitchenId, mealsPerDay, deliveryDays, billingCycle, paymentMethod, requestedCoins],
  );
  const quote = useSubscriptionQuote(quoteInput, Boolean(kitchenId && billingCycle && deliveryDays.length > 0));

  const walletSummary = useWalletSummary();
  const walletBalance = walletSummary.data?.balanceRs ?? 0;
  const firstCycleAmount = quote.data?.firstCycleAmount ?? 0;
  const insufficientWalletBalance =
    paymentMethod === 'WALLET' && Boolean(quote.data) && walletBalance < firstCycleAmount;

  const showCoinsToggle =
    paymentMethod === 'WALLET' && Boolean(quote.data?.coinsEligible) && (quote.data?.coinsBalance ?? 0) > 0;
  const coinsOn = requestedCoins > 0;

  const handleToggleCoins = (value: boolean) => {
    setRequestedCoins(value ? quote.data?.maxRedeemableCoins ?? 0 : 0);
  };

  const createSubscription = useCreateBespokeSubscription();

  const handleConfirm = () => {
    if (!kitchenId || !foodType || !deliveryTime || !billingCycle || !addressId) {
      Alert.alert('Almost there', 'Add a delivery address before confirming.');
      return;
    }

    const input: CreateBespokeSubscriptionInput = {
      kitchenId,
      planName: `Custom Plan · ${DIET_LABEL[foodType]}`,
      foodType,
      mealsPerDay,
      deliveryDays,
      deliveryTime,
      billingCycle,
      specialInstructions: specialInstructions.trim() || undefined,
      startDate: startDate ?? undefined,
      addressId,
      paymentMethod,
      requestedCoins: paymentMethod === 'WALLET' && requestedCoins > 0 ? requestedCoins : undefined,
    };

    createSubscription.mutate(input, {
      onSuccess: () => {
        Alert.alert('Request sent', 'The kitchen will confirm your subscription shortly.', [
          { text: 'OK', onPress: () => navigation.popToTop() },
        ]);
      },
      onError: (error) => {
        Alert.alert(
          'Could not create your subscription',
          error instanceof ApiError ? error.message : 'Please try again.',
        );
      },
    });
  };

  const canConfirm =
    Boolean(quote.data) && Boolean(addressId) && !insufficientWalletBalance && !createSubscription.isPending;

  return (
    <Screen background="page">
      <AppBar title="Review & Pay" subtitle="Step 3 of 3" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[theme.text.h3, styles.title]}>Plan summary</Text>
        <Card padding="md" elevation="xs">
          <SummaryRow label="Kitchen" value={kitchenName ?? '—'} />
          <SummaryRow label="Diet" value={foodType ? DIET_LABEL[foodType] : '—'} />
          <SummaryRow label="Meals per day" value={String(mealsPerDay)} />
          <SummaryRow label="Delivery days" value={dayCountLabel(deliveryDays)} />
          <SummaryRow label="Delivery slot" value={deliveryTime ? SLOT_LABEL[deliveryTime] : '—'} />
          <SummaryRow label="Billing" value={billingCycle === 'WEEKLY' ? 'Weekly' : 'Monthly'} />
        </Card>

        <Text style={[theme.text.h3, styles.title]}>Delivering to</Text>
        <Card padding="md" elevation="xs" onPress={navigation.goBack} style={styles.addressCard}>
          {selectedAddress ? (
            <>
              <Text style={theme.text.h4}>
                {selectedAddress.customLabel ?? titleCase(selectedAddress.label)}
              </Text>
              <Text style={[theme.text.bodySmall, styles.addressLine]}>
                {[selectedAddress.line1, selectedAddress.locality, selectedAddress.city]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </>
          ) : (
            <Text style={[theme.text.h4, styles.link]}>Add a delivery address</Text>
          )}
          {specialInstructions.trim() ? (
            <Text style={[theme.text.caption, styles.instructionsNote]} numberOfLines={2}>
              Note: {specialInstructions.trim()}
            </Text>
          ) : null}
        </Card>

        <Text style={[theme.text.h3, styles.title]}>Payment method</Text>
        <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />

        {paymentMethod === 'WALLET' ? (
          <View style={styles.walletHint}>
            <WalletIcon size={14} color={theme.colors.text.secondary} strokeWidth={2.2} />
            <Text style={[theme.text.bodySmall, styles.walletHintText]}>
              FreshBhoj balance: {walletSummary.isLoading ? '…' : formatCurrency(walletBalance)}
            </Text>
          </View>
        ) : null}

        {insufficientWalletBalance ? (
          <Text style={[theme.text.caption, styles.insufficientText]}>
            Not enough wallet balance for the first cycle — add money to your wallet or choose another payment
            method.
          </Text>
        ) : null}

        <Text style={[theme.text.h3, styles.title]}>Price details</Text>
        {quote.isLoading ? (
          <Skeleton height={140} radius={theme.radius.card} />
        ) : quote.isError || !quote.data ? (
          <Card padding="md" elevation="xs">
            <Text style={[theme.text.bodySmall, styles.quoteError]}>
              Could not load pricing. Pull to refresh or go back and try again.
            </Text>
          </Card>
        ) : (
          <Card padding="md" elevation="xs">
            <SummaryRow label="Price per cycle" value={quote.data.pricePerCycle} />

            {showCoinsToggle ? (
              <View style={styles.coinsToggleRow}>
                <View style={styles.coinsToggleText}>
                  <Text style={theme.text.body}>Redeem FreshBhoj Coins</Text>
                  <Text style={[theme.text.caption, styles.coinsToggleHint]}>
                    You have {quote.data.coinsBalance} coins · up to {quote.data.maxRedeemableCoins} today
                  </Text>
                </View>
                <Switch
                  value={coinsOn}
                  onValueChange={handleToggleCoins}
                  trackColor={{ false: theme.colors.neutral[200], true: theme.colors.accent[400] }}
                  thumbColor={theme.colors.surface.base}
                />
              </View>
            ) : null}

            {quote.data.coinsDiscount > 0 ? (
              <SummaryRow
                label="FreshBhoj Coins"
                value={quote.data.coinsDiscount}
                tone="discount"
                icon={<Coins size={13} color={theme.colors.accent[600]} strokeWidth={2.2} />}
              />
            ) : null}

            <Divider dashed spacing={theme.spacing.sm} />

            <SummaryRow label="Total for first cycle" value={quote.data.firstCycleAmount} tone="total" />

            {quote.data.coinsDiscount > 0 ? (
              <Text style={[theme.text.caption, styles.renewalNote]}>
                Renews at {formatCurrency(quote.data.pricePerCycle)} every{' '}
                {billingCycle === 'WEEKLY' ? 'week' : 'month'} after the first cycle.
              </Text>
            ) : null}
          </Card>
        )}

        <Text style={[theme.text.caption, styles.approvalHint]}>
          The kitchen still needs to confirm this — you&apos;ll see it as pending until they approve it.
        </Text>
      </ScrollView>

      <StickyBar>
        <View style={styles.stickyRow}>
          <View>
            <Text style={[theme.text.caption, styles.stickyLabel]}>DUE NOW</Text>
            <Text style={theme.text.h2}>{quote.data ? formatCurrency(quote.data.firstCycleAmount) : '—'}</Text>
          </View>
          <Button
            title={createSubscription.isPending ? 'Sending…' : 'Confirm & Pay'}
            onPress={handleConfirm}
            loading={createSubscription.isPending}
            disabled={!canConfirm}
            fullWidth={false}
            style={styles.confirmButton}
          />
        </View>
      </StickyBar>
    </Screen>
  );
};

export default SetupPlanReview;

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  addressCard: {
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  addressLine: {
    color: theme.colors.text.secondary,
    marginTop: 3,
  },
  link: {
    color: theme.colors.primary[600],
  },
  instructionsNote: {
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
  },
  walletHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: theme.spacing.md,
  },
  walletHintText: {
    color: theme.colors.text.secondary,
  },
  insufficientText: {
    color: theme.colors.state.error,
    marginTop: theme.spacing.sm,
  },
  quoteError: {
    color: theme.colors.text.secondary,
  },
  coinsToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  coinsToggleText: {
    flex: 1,
  },
  coinsToggleHint: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  renewalNote: {
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
  },
  approvalHint: {
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  stickyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  stickyLabel: {
    color: theme.colors.text.tertiary,
  },
  confirmButton: {
    flex: 1,
    maxWidth: 190,
  },
});
