import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Banknote, Building2, IndianRupee, Landmark, ShieldCheck, Wallet } from 'lucide-react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, Badge, Button, Card, EmptyState, Screen, Skeleton, Text } from '@components/ui';
import type { BadgeTone } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { usePayoutSummary, usePayoutTransactions, useRequestPayout } from '../hooks/useKitchenPortal';
import type { PayoutTransaction } from '../kitchenPartner.types';

function statusTone(status: string): BadgeTone {
  const s = status.toUpperCase();
  if (['PAID', 'COMPLETED', 'SUCCESS'].includes(s)) return 'accent';
  if (['FAILED', 'CANCELLED', 'REJECTED'].includes(s)) return 'danger';
  if (['PENDING', 'PROCESSING', 'INITIATED'].includes(s)) return 'warning';
  return 'neutral';
}

function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

const Payouts = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const summary = usePayoutSummary();
  const requestPayout = useRequestPayout();

  const [page, setPage] = useState(1);
  const [pagesMap, setPagesMap] = useState<Record<number, PayoutTransaction[]>>({});
  const transactions = usePayoutTransactions({ page });

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

  const chartData = useMemo(
    () =>
      items
        .filter((item) => item.type === 'ORDER')
        .slice(0, 7)
        .reverse()
        .map((item) => ({ value: item.amount, label: new Date(item.occurredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) })),
    [items],
  );

  const handleRequestPayout = () => {
    requestPayout.mutate(undefined, {
      onError: (error) =>
        Alert.alert('Could not request payout', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  const data = summary.data;
  const canRequest = !!data && data.availableForPayout > 0;

  return (
    <Screen background="page">
      <AppBar title="Payouts" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {summary.isError ? (
          <EmptyState title="Something went wrong" description="We couldn't load your payouts." actionLabel="Retry" onAction={() => summary.refetch()} />
        ) : summary.isLoading || !data ? (
          <View style={styles.statsRow}>
            <Skeleton height={100} radius={theme.radius.card} style={styles.statSkeleton} />
            <Skeleton height={100} radius={theme.radius.card} style={styles.statSkeleton} />
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <Card style={styles.statCard} padding="md">
                <View style={styles.statIcon}>
                  <IndianRupee size={16} color={theme.colors.brand.primary} />
                </View>
                <Text variant="h3">{formatRupees(data.totalEarnings)}</Text>
                <Text variant="caption" color="secondary">
                  Total earnings
                </Text>
              </Card>
              <Card style={styles.statCard} padding="md">
                <View style={styles.statIcon}>
                  <Wallet size={16} color={theme.colors.brand.primary} />
                </View>
                <Text variant="h3">{formatRupees(data.availableForPayout)}</Text>
                <Text variant="caption" color="secondary">
                  Available for payout
                </Text>
              </Card>
            </View>

            <Button
              title={requestPayout.isPending ? 'Requesting…' : 'Request Payout'}
              onPress={handleRequestPayout}
              loading={requestPayout.isPending}
              disabled={!canRequest || requestPayout.isPending}
              style={styles.requestButton}
            />

            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text variant="label" color="secondary">
                  Last payout
                </Text>
                <Text variant="bodyMedium">
                  {data.lastPayout
                    ? `${data.lastPayout.amount != null ? formatRupees(data.lastPayout.amount) : '—'}${
                        data.lastPayout.occurredAt
                          ? ` · ${new Date(data.lastPayout.occurredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                          : ''
                      }`
                    : 'No payouts yet'}
                </Text>
              </View>
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text variant="label" color="secondary">
                  Next scheduled
                </Text>
                <Text variant="bodyMedium" color="secondary">
                  {data.nextScheduledAt ? new Date(data.nextScheduledAt).toLocaleDateString('en-IN') : 'Not scheduled yet'}
                </Text>
              </View>
            </Card>

            <Card style={styles.bankCard}>
              <View style={styles.bankHeaderRow}>
                <Landmark size={16} color={theme.colors.text.secondary} />
                <Text variant="overline" color="tertiary">
                  BANK ACCOUNT
                </Text>
              </View>
              {data.bankAccount ? (
                <>
                  <View style={styles.bankRow}>
                    <Building2 size={14} color={theme.colors.text.tertiary} />
                    <Text variant="bodySmall" color="secondary">
                      {data.bankAccount.bankName || 'Bank'} · {data.bankAccount.accountNumberMasked}
                    </Text>
                  </View>
                  <View style={styles.bankRow}>
                    <Banknote size={14} color={theme.colors.text.tertiary} />
                    <Text variant="bodySmall" color="secondary">
                      {data.bankAccount.accountHolderName}
                    </Text>
                  </View>
                  {data.bankAccount.isVerified ? (
                    <Badge label="Verified" tone="accent" size="sm" icon={<ShieldCheck size={12} color={theme.colors.accent[600]} />} style={styles.bankBadge} />
                  ) : (
                    <Badge label="Pending verification" tone="warning" size="sm" style={styles.bankBadge} />
                  )}
                </>
              ) : (
                <Text variant="bodySmall" color="secondary">
                  No bank account on file yet — add one during onboarding to receive payouts.
                </Text>
              )}
            </Card>

            {chartData.length >= 2 ? (
              <Card style={styles.chartCard}>
                <Text variant="overline" color="tertiary" style={styles.chartLabel}>
                  RECENT ORDER EARNINGS
                </Text>
                <LineChart
                  data={chartData}
                  height={110}
                  thickness={3}
                  color={theme.colors.brand.primary}
                  dataPointsColor={theme.colors.brand.primary}
                  startFillColor={theme.colors.gradients.brand[0]}
                  endFillColor={theme.colors.gradients.brand[2]}
                  startOpacity={0.2}
                  endOpacity={0.02}
                  areaChart
                  curved
                  hideRules
                  hideYAxisText
                  xAxisColor={theme.colors.borders.subtle}
                  noOfSections={3}
                  spacing={40}
                  initialSpacing={12}
                  endSpacing={8}
                  adjustToWidth
                />
              </Card>
            ) : null}
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
          <EmptyState title="No transactions yet" description="Orders and payouts will show up here." />
        ) : (
          <>
            {items.map((item) => (
              <Card key={item.id} style={styles.txRow} padding="md">
                <View style={styles.txTextWrap}>
                  <Text variant="bodyMedium">{item.label}</Text>
                  <Text variant="caption" color="tertiary">
                    {new Date(item.occurredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.txRight}>
                  <Text variant="bodyMedium" style={item.sign > 0 ? styles.txAmountPositive : styles.txAmountNegative}>
                    {item.sign > 0 ? '+' : '−'}
                    {formatRupees(Math.abs(item.amount))}
                  </Text>
                  <Badge label={item.status} tone={statusTone(item.status)} size="sm" style={styles.txBadge} />
                </View>
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
    </Screen>
  );
};

export default Payouts;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.xxl },
  statsRow: { flexDirection: 'row', gap: theme.spacing.paddings.sm, marginBottom: theme.spacing.paddings.md },
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
  requestButton: { marginBottom: theme.spacing.paddings.md },
  infoCard: { marginBottom: theme.spacing.paddings.md },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.paddings.sm,
    marginBottom: theme.spacing.paddings.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borders.subtle,
  },
  infoRowLast: { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
  bankCard: { marginBottom: theme.spacing.paddings.md },
  bankHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: theme.spacing.paddings.sm },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  bankBadge: { marginTop: theme.spacing.paddings.xs },
  chartCard: { marginBottom: theme.spacing.paddings.md },
  chartLabel: { marginBottom: theme.spacing.paddings.sm },
  sectionLabel: { marginBottom: theme.spacing.paddings.sm, marginTop: theme.spacing.paddings.xs },
  txSkeleton: { marginBottom: theme.spacing.paddings.sm },
  txRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.paddings.sm },
  txTextWrap: { flex: 1 },
  txRight: { alignItems: 'flex-end' },
  txBadge: { marginTop: 4 },
  txAmountPositive: { color: theme.colors.accent[600] },
  txAmountNegative: { color: theme.colors.state.error },
  loadMoreWrap: { alignItems: 'center', paddingVertical: theme.spacing.paddings.lg },
});
