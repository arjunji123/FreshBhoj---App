import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { CalendarClock, CircleAlert, CircleCheckBig, IndianRupee, Plus, TrendingDown, Wallet as WalletIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, Badge, Button, Card, Chip, EmptyState, Input, Screen, Sheet, Skeleton, Text } from '@components/ui';
import type { SheetHandle } from '@components/ui';
import type { BadgeTone } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useTopupWallet, useWalletSummary, useWalletTransactions } from '../hooks/useKitchenPortal';
import type { WalletTransaction, WalletTransactionReason } from '../kitchenPartner.types';

const REASON_LABEL: Record<WalletTransactionReason, string> = {
  TOPUP: 'Wallet top-up',
  AD_BOOST: 'Reel boost',
  PREMIUM_PLAN: 'Premium plan',
};

const REASON_TONE: Record<WalletTransactionReason, BadgeTone> = {
  TOPUP: 'accent',
  AD_BOOST: 'brand',
  PREMIUM_PLAN: 'warning',
};

const PRESET_AMOUNTS = [200, 500, 1000, 2000];

function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

const Wallet = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const summary = useWalletSummary();

  const [page, setPage] = useState(1);
  const [pagesMap, setPagesMap] = useState<Record<number, WalletTransaction[]>>({});
  const transactions = useWalletTransactions({ page });

  useEffect(() => {
    if (!transactions.data) return;
    setPagesMap((prev) => ({ ...prev, [page]: transactions.data!.items }));
  }, [transactions.data, page]);

  const items = useMemo(() => {
    const pageNumbers = Object.keys(pagesMap)
      .map(Number)
      .sort((a, b) => a - b);
    return pageNumbers.flatMap((p) => pagesMap[p] ?? []);
  }, [pagesMap]);

  const addMoneySheetRef = React.useRef<SheetHandle>(null);

  const data = summary.data;

  return (
    <Screen background="page">
      <AppBar title="Wallet" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={summary.isRefetching}
            onRefresh={() => {
              summary.refetch();
              transactions.refetch();
            }}
            tintColor={theme.colors.primary[600]}
          />
        }
      >
        {summary.isError ? (
          <EmptyState title="Something went wrong" description="We couldn't load your wallet." actionLabel="Retry" onAction={() => summary.refetch()} />
        ) : summary.isLoading || !data ? (
          <>
            <View style={styles.statsRow}>
              <Skeleton height={96} radius={theme.radius.card} style={styles.statSkeleton} />
              <Skeleton height={96} radius={theme.radius.card} style={styles.statSkeleton} />
            </View>
            <View style={styles.statsRow}>
              <Skeleton height={96} radius={theme.radius.card} style={styles.statSkeleton} />
              <Skeleton height={96} radius={theme.radius.card} style={styles.statSkeleton} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.statsRow}>
              <Card style={styles.statCard} padding="md">
                <View style={styles.statIcon}>
                  <WalletIcon size={16} color={theme.colors.brand.primary} />
                </View>
                <Text variant="h3">{formatRupees(data.balanceRs)}</Text>
                <Text variant="caption" color="secondary">
                  Current balance
                </Text>
              </Card>
              <Card style={styles.statCard} padding="md">
                <View style={styles.statIcon}>
                  <IndianRupee size={16} color={theme.colors.brand.primary} />
                </View>
                <Text variant="h3">{formatRupees(data.totalCreditsRs)}</Text>
                <Text variant="caption" color="secondary">
                  Total credits
                </Text>
              </Card>
            </View>
            <View style={styles.statsRow}>
              <Card style={styles.statCard} padding="md">
                <View style={styles.statIcon}>
                  <TrendingDown size={16} color={theme.colors.brand.primary} />
                </View>
                <Text variant="h3">{formatRupees(data.thisMonthSpentRs)}</Text>
                <Text variant="caption" color="secondary">
                  This month spent
                </Text>
              </Card>
              <Card style={styles.statCard} padding="md">
                <View style={styles.statIcon}>
                  <CalendarClock size={16} color={theme.colors.brand.primary} />
                </View>
                <Text variant="h3">{data.nextBillingAt ? new Date(data.nextBillingAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</Text>
                <Text variant="caption" color="secondary">
                  Next billing
                </Text>
              </Card>
            </View>

            <Button
              title="Add Money"
              leftIcon={<Plus size={16} color={theme.colors.palette.white} />}
              onPress={() => addMoneySheetRef.current?.open()}
              style={styles.addButton}
            />
          </>
        )}

        <Text variant="overline" color="tertiary" style={styles.sectionLabel}>
          RECENT TRANSACTIONS
        </Text>

        {transactions.isError ? (
          <EmptyState title="Couldn't load transactions" actionLabel="Retry" onAction={() => transactions.refetch()} />
        ) : transactions.isLoading && page === 1 ? (
          <>
            <Skeleton height={56} radius={theme.radius.card} style={styles.txSkeleton} />
            <Skeleton height={56} radius={theme.radius.card} style={styles.txSkeleton} />
          </>
        ) : items.length === 0 ? (
          <EmptyState title="No transactions yet" description="Top-ups, boosts and premium purchases will show up here." />
        ) : (
          <>
            {items.map((item) => (
              <Card key={item.id} style={styles.txRow} padding="md">
                <View style={styles.txTextWrap}>
                  <Text variant="bodyMedium" numberOfLines={1}>
                    {item.description || REASON_LABEL[item.reason]}
                  </Text>
                  <View style={styles.txMetaRow}>
                    <Badge label={REASON_LABEL[item.reason]} tone={REASON_TONE[item.reason]} size="sm" />
                    <Text variant="caption" color="tertiary">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
                <Text variant="bodyMedium" style={item.type === 'CREDIT' ? styles.txAmountPositive : styles.txAmountNegative}>
                  {item.type === 'CREDIT' ? '+' : '−'}
                  {formatRupees(item.amountRs)}
                </Text>
              </Card>
            ))}
            {transactions.data?.meta.hasNextPage ? (
              <View style={styles.loadMoreWrap}>
                {transactions.isFetching && page > 1 ? (
                  <ActivityIndicator color={theme.colors.brand.primary} />
                ) : (
                  <Button title="Load more" variant="outline" size="sm" fullWidth={false} onPress={() => setPage((p) => p + 1)} />
                )}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <AddMoneySheet sheetRef={addMoneySheetRef} />
    </Screen>
  );
};

function AddMoneySheet({ sheetRef }: { sheetRef: React.RefObject<SheetHandle | null> }) {
  const topup = useTopupWallet();
  const [amountInput, setAmountInput] = useState('');

  const reset = () => {
    setAmountInput('');
    topup.reset();
  };

  const handleSubmit = () => {
    const amountRs = Number(amountInput);
    if (!Number.isFinite(amountRs) || amountRs <= 0) {
      Alert.alert('Enter an amount', 'Enter an amount greater than ₹0.');
      return;
    }
    topup.mutate(amountRs);
  };

  return (
    <Sheet ref={sheetRef} title="Add Money" heightRatio={0.55} onClose={reset}>
      <View style={styles.sheetContent}>
        {topup.isSuccess && topup.data ? (
          <View style={styles.resultWrap}>
            <View style={[styles.resultIcon, styles.resultIconSuccess]}>
              <CircleCheckBig size={30} color={theme.colors.accent[600]} />
            </View>
            <Text variant="h3" align="center">
              {formatRupees(topup.data.transaction.amountRs)} added
            </Text>
            <Text variant="bodySmall" color="secondary" align="center" style={styles.resultSub}>
              New balance: {formatRupees(topup.data.wallet.balanceRs)}
            </Text>
            <Button title="Done" onPress={() => sheetRef.current?.close()} style={styles.resultButton} />
          </View>
        ) : topup.isError ? (
          <View style={styles.resultWrap}>
            <View style={[styles.resultIcon, styles.resultIconError]}>
              <CircleAlert size={30} color={theme.colors.state.error} />
            </View>
            <Text variant="h3" align="center">
              Could not add money
            </Text>
            <Text variant="bodySmall" color="secondary" align="center" style={styles.resultSub}>
              {topup.error instanceof KitchenApiError ? topup.error.message : 'Please try again.'}
            </Text>
            <Button title="Try again" onPress={() => topup.reset()} style={styles.resultButton} />
          </View>
        ) : (
          <>
            <Text variant="overline" color="tertiary" style={styles.sheetLabel}>
              AMOUNT
            </Text>
            <Input value={amountInput} onChangeText={(value) => setAmountInput(value.replace(/\D/g, '').slice(0, 7))} placeholder="e.g. 500" keyboardType="number-pad" prefix="₹" autoFocus />
            <View style={styles.presetRow}>
              {PRESET_AMOUNTS.map((amt) => (
                <Chip key={amt} label={`₹${amt}`} selected={amountInput === String(amt)} onPress={() => setAmountInput(String(amt))} />
              ))}
            </View>
            <Button
              title={topup.isPending ? 'Adding…' : 'Add Money'}
              onPress={handleSubmit}
              loading={topup.isPending}
              disabled={topup.isPending || !amountInput}
              style={styles.sheetSubmit}
            />
          </>
        )}
      </View>
    </Sheet>
  );
}

export default Wallet;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.xxl },
  statsRow: { flexDirection: 'row', gap: theme.spacing.paddings.sm, marginBottom: theme.spacing.paddings.sm },
  statSkeleton: { flex: 1 },
  statCard: { flex: 1 },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.brand.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.paddings.xs,
  },
  addButton: { marginTop: theme.spacing.paddings.xs, marginBottom: theme.spacing.paddings.md },
  sectionLabel: { marginBottom: theme.spacing.paddings.sm, marginTop: theme.spacing.paddings.xs },
  txSkeleton: { marginBottom: theme.spacing.paddings.sm },
  txRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.paddings.sm },
  txTextWrap: { flex: 1, marginRight: theme.spacing.paddings.sm },
  txMetaRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.xs, marginTop: 4 },
  txAmountPositive: { color: theme.colors.accent[600] },
  txAmountNegative: { color: theme.colors.text.primary },
  loadMoreWrap: { alignItems: 'center', paddingVertical: theme.spacing.paddings.lg },
  sheetContent: { paddingHorizontal: theme.layout.screenPadding },
  sheetLabel: { marginBottom: theme.spacing.paddings.sm },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.paddings.xs, marginTop: theme.spacing.paddings.md },
  sheetSubmit: { marginTop: theme.spacing.paddings.xl },
  resultWrap: { alignItems: 'center', paddingTop: theme.spacing.paddings.xl },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.paddings.md,
  },
  resultIconSuccess: { backgroundColor: theme.colors.accent[50] },
  resultIconError: { backgroundColor: theme.colors.state.errorBg },
  resultSub: { marginTop: theme.spacing.paddings.xs },
  resultButton: { marginTop: theme.spacing.paddings.xl, alignSelf: 'stretch' },
});
