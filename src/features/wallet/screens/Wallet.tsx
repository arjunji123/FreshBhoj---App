import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowDownToLine, CircleAlert, CircleCheckBig, Clock, Plus, Wallet as WalletIcon } from 'lucide-react-native';
import { formatCurrency, formatDateTime } from '@utils/format';
import { ApiError } from '@api';
import {
  AppBar,
  Badge,
  Button,
  Card,
  Chip,
  ChipRow,
  Divider,
  EmptyState,
  Input,
  Screen,
  Sheet,
  Skeleton,
} from '@components/ui';
import type { BadgeTone, SheetHandle } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { flattenPages } from '@features/meals/hooks/useMeals';
import type { WalletTransactionReason } from '@api/types';
import { useRequestWithdrawal, useTopUpWallet, useWalletSummary, useWalletTransactions, useWalletWithdrawals } from '../hooks/useWallet';
import { useTheme } from "@app/theme/useTheme";

const PRESET_AMOUNTS = [200, 500, 1000, 2000];

type FilterTab = 'ALL' | 'PAYMENTS' | 'TOPUPS';

const TABS: Array<{ key: FilterTab; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'PAYMENTS', label: 'Payments' },
  { key: 'TOPUPS', label: 'Top-ups' },
];

const REASON_LABEL: Record<WalletTransactionReason, string> = {
  TOPUP: 'Wallet top-up',
  ORDER_PAYMENT: 'Order payment',
  SUBSCRIPTION_PAYMENT: 'Subscription payment',
  WITHDRAWAL: 'Withdrawal',
  REFUND: 'Refund',
};

const REASON_TONE: Record<WalletTransactionReason, BadgeTone> = {
  TOPUP: 'accent',
  ORDER_PAYMENT: 'brand',
  SUBSCRIPTION_PAYMENT: 'brand',
  WITHDRAWAL: 'neutral',
  REFUND: 'warning',
};

function matchesTab(tab: FilterTab, reason: WalletTransactionReason): boolean {
  if (tab === 'ALL') return true;
  if (tab === 'TOPUPS') return reason === 'TOPUP';
  return reason === 'ORDER_PAYMENT' || reason === 'SUBSCRIPTION_PAYMENT';
}

/**
 * Customer prepaid wallet — balance, Add Money (instant), Withdraw (genuinely
 * pending on ops), and a transaction list. Deliberately not merged with the
 * separate FreshBhoj Coins ledger, which stays `ReferralScreen`'s territory.
 */
const Wallet = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const summary = useWalletSummary();
  const transactions = useWalletTransactions();
  const withdrawals = useWalletWithdrawals();

  const [tab, setTab] = useState<FilterTab>('ALL');
  const addMoneySheetRef = useRef<SheetHandle>(null);
  const withdrawSheetRef = useRef<SheetHandle>(null);

  const items = useMemo(() => flattenPages(transactions.data?.pages), [transactions.data]);
  const filteredItems = useMemo(() => items.filter((item) => matchesTab(tab, item.reason)), [items, tab]);

  const pendingWithdrawals = useMemo(
    () =>
      flattenPages(withdrawals.data?.pages).filter(
        (w) => w.status === 'REQUESTED' || w.status === 'PROCESSING',
      ),
    [withdrawals.data],
  );

  return (
    <Screen background="page">
      <AppBar title="Wallet" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {summary.isLoading || !summary.data ? (
          <Skeleton height={140} radius={theme.radius.card} />
        ) : (
          <Card padding="lg" elevation="sm" style={styles.balanceCard}>
            <View style={styles.balanceIcon}>
              <WalletIcon size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />
            </View>
            <Text style={[theme.text.caption, styles.balanceLabel]}>FRESHBHOJ BALANCE</Text>
            <Text style={theme.text.h1}>{formatCurrency(summary.data.balanceRs)}</Text>

            <View style={styles.balanceActions}>
              <Button
                title="Add Money"
                leftIcon={<Plus size={16} color={theme.colors.text.inverse} strokeWidth={2.4} />}
                onPress={() => addMoneySheetRef.current?.open()}
                fullWidth={false}
                style={styles.balanceButton}
              />
              <Button
                title="Withdraw"
                variant="outline"
                leftIcon={<ArrowDownToLine size={16} color={theme.colors.text.primary} strokeWidth={2.4} />}
                onPress={() => withdrawSheetRef.current?.open()}
                fullWidth={false}
                style={styles.balanceButton}
              />
            </View>
          </Card>
        )}

        {summary.data ? (
          <View style={styles.statsRow}>
            <Card padding="md" elevation="xs" style={styles.statCard}>
              <Text style={theme.text.h3}>{formatCurrency(summary.data.totalCreditsRs)}</Text>
              <Text style={[theme.text.caption, styles.statLabel]}>Total credits</Text>
            </Card>
            <Card padding="md" elevation="xs" style={styles.statCard}>
              <Text style={theme.text.h3}>{formatCurrency(summary.data.thisMonthSpentRs)}</Text>
              <Text style={[theme.text.caption, styles.statLabel]}>This month spent</Text>
            </Card>
          </View>
        ) : null}

        {pendingWithdrawals.length > 0 ? (
          <Card padding="md" elevation="xs" style={styles.pendingCard}>
            <View style={styles.pendingHeader}>
              <Clock size={15} color={theme.colors.amber[600]} strokeWidth={2.2} />
              <Text style={[theme.text.label, styles.pendingTitle]}>Withdrawal in progress</Text>
            </View>
            {pendingWithdrawals.map((w) => (
              <View key={w.id} style={styles.pendingRow}>
                <Text style={theme.text.bodySmall}>{formatCurrency(w.amountRs)}</Text>
                <Badge label={w.status === 'PROCESSING' ? 'Processing' : 'Requested'} tone="warning" size="sm" />
              </View>
            ))}
          </Card>
        ) : null}

        <Text style={[theme.text.overline, styles.sectionLabel]}>TRANSACTIONS</Text>

        <ChipRow style={styles.tabRow}>
          {TABS.map(({ key, label }) => (
            <Chip key={key} label={label} selected={tab === key} onPress={() => setTab(key)} />
          ))}
        </ChipRow>

        {transactions.isError ? (
          <EmptyState title="Couldn't load transactions" actionLabel="Retry" onAction={() => transactions.refetch()} />
        ) : transactions.isLoading ? (
          <View style={styles.txSkeletonWrap}>
            <Skeleton height={64} radius={theme.radius.card} />
            <Skeleton height={64} radius={theme.radius.card} />
          </View>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<WalletIcon size={32} color={theme.colors.primary[600]} strokeWidth={1.8} />}
            title="No transactions yet"
            description="Top-ups and payments will show up here."
          />
        ) : (
          <>
            {filteredItems.map((item, index) => (
              <View key={item.id}>
                {index > 0 ? <Divider spacing={theme.spacing.sm} /> : null}
                <View style={styles.txRow}>
                  <View style={styles.txText}>
                    <Text style={theme.text.bodyMedium} numberOfLines={1}>
                      {item.description || REASON_LABEL[item.reason]}
                    </Text>
                    <View style={styles.txMetaRow}>
                      <Badge label={REASON_LABEL[item.reason]} tone={REASON_TONE[item.reason]} size="sm" />
                      <Text style={[theme.text.caption, styles.txDate]}>{formatDateTime(item.createdAt)}</Text>
                    </View>
                  </View>
                  <Text
                    style={[theme.text.bodyMedium, item.type === 'CREDIT' ? styles.txPositive : styles.txNegative]}
                  >
                    {item.type === 'CREDIT' ? '+' : '−'}
                    {formatCurrency(item.amountRs)}
                  </Text>
                </View>
              </View>
            ))}

            {transactions.hasNextPage ? (
              <View style={styles.loadMoreWrap}>
                {transactions.isFetchingNextPage ? (
                  <ActivityIndicator color={theme.colors.primary[600]} />
                ) : (
                  <Button
                    title="Load more"
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    onPress={() => transactions.fetchNextPage()}
                  />
                )}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <AddMoneySheet sheetRef={addMoneySheetRef} />
      <WithdrawSheet sheetRef={withdrawSheetRef} balanceRs={summary.data?.balanceRs ?? 0} />
    </Screen>
  );
};

function AddMoneySheet({ sheetRef }: { sheetRef: React.RefObject<SheetHandle | null> }) {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const topUp = useTopUpWallet();
  const [amountInput, setAmountInput] = useState('');

  const reset = () => {
    setAmountInput('');
    topUp.reset();
  };

  const handleSubmit = () => {
    const amountRs = Number(amountInput);
    if (!Number.isFinite(amountRs) || amountRs <= 0) {
      Alert.alert('Enter an amount', 'Enter an amount greater than ₹0.');
      return;
    }
    topUp.mutate(amountRs);
  };

  return (
    <Sheet ref={sheetRef} title="Add Money" heightRatio={0.55} onClose={reset}>
      <View style={styles.sheetContent}>
        {topUp.isSuccess && topUp.data ? (
          <View style={styles.resultWrap}>
            <View style={[styles.resultIcon, styles.resultIconSuccess]}>
              <CircleCheckBig size={30} color={theme.colors.accent[600]} strokeWidth={2} />
            </View>
            <Text style={[theme.text.h3, styles.resultTitle]}>{formatCurrency(topUp.data.transaction.amountRs)} added</Text>
            <Text style={[theme.text.bodySmall, styles.resultSub]}>
              New balance: {formatCurrency(topUp.data.wallet.balanceRs)}
            </Text>
            <Button title="Done" onPress={() => sheetRef.current?.close()} style={styles.resultButton} />
          </View>
        ) : topUp.isError ? (
          <View style={styles.resultWrap}>
            <View style={[styles.resultIcon, styles.resultIconError]}>
              <CircleAlert size={30} color={theme.colors.state.error} strokeWidth={2} />
            </View>
            <Text style={[theme.text.h3, styles.resultTitle]}>Could not add money</Text>
            <Text style={[theme.text.bodySmall, styles.resultSub]}>
              {topUp.error instanceof ApiError ? topUp.error.message : 'Please try again.'}
            </Text>
            <Button title="Try again" onPress={() => topUp.reset()} style={styles.resultButton} />
          </View>
        ) : (
          <>
            <Text style={[theme.text.label, styles.sheetLabel]}>AMOUNT</Text>
            <Input value={amountInput} onChangeText={setAmountInput} placeholder="e.g. 500" keyboardType="number-pad" prefix="₹" autoFocus />
            <View style={styles.presetRow}>
              {PRESET_AMOUNTS.map((amt) => (
                <Chip key={amt} label={`₹${amt}`} selected={amountInput === String(amt)} onPress={() => setAmountInput(String(amt))} />
              ))}
            </View>
            <Button
              title={topUp.isPending ? 'Adding…' : 'Add Money'}
              onPress={handleSubmit}
              loading={topUp.isPending}
              disabled={topUp.isPending || !amountInput}
              style={styles.sheetSubmit}
            />
          </>
        )}
      </View>
    </Sheet>
  );
}

function WithdrawSheet({
  sheetRef,
  balanceRs,
}: {
  sheetRef: React.RefObject<SheetHandle | null>;
  balanceRs: number;
}) {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const withdraw = useRequestWithdrawal();
  const [amountInput, setAmountInput] = useState('');
  const [upiId, setUpiId] = useState('');

  const reset = () => {
    setAmountInput('');
    setUpiId('');
    withdraw.reset();
  };

  const handleSubmit = () => {
    const amountRs = Number(amountInput);
    if (!Number.isFinite(amountRs) || amountRs <= 0) {
      Alert.alert('Enter an amount', 'Enter an amount greater than ₹0.');
      return;
    }
    if (amountRs > balanceRs) {
      Alert.alert('Not enough balance', `You can withdraw up to ${formatCurrency(balanceRs)}.`);
      return;
    }
    if (!upiId.trim()) {
      Alert.alert('Enter a UPI ID', 'We need somewhere to send the money.');
      return;
    }
    withdraw.mutate({ amountRs, destination: { upiId: upiId.trim() } });
  };

  return (
    <Sheet ref={sheetRef} title="Withdraw" heightRatio={0.6} onClose={reset}>
      <View style={styles.sheetContent}>
        {withdraw.isSuccess && withdraw.data ? (
          <View style={styles.resultWrap}>
            <View style={[styles.resultIcon, styles.resultIconPending]}>
              <Clock size={30} color={theme.colors.amber[600]} strokeWidth={2} />
            </View>
            <Text style={[theme.text.h3, styles.resultTitle]}>Withdrawal requested</Text>
            <Text style={[theme.text.bodySmall, styles.resultSub]}>
              {formatCurrency(withdraw.data.amountRs)} will be sent to your UPI ID once our team processes it —
              usually within 2-3 business days.
            </Text>
            <Button title="Done" onPress={() => sheetRef.current?.close()} style={styles.resultButton} />
          </View>
        ) : withdraw.isError ? (
          <View style={styles.resultWrap}>
            <View style={[styles.resultIcon, styles.resultIconError]}>
              <CircleAlert size={30} color={theme.colors.state.error} strokeWidth={2} />
            </View>
            <Text style={[theme.text.h3, styles.resultTitle]}>Could not request withdrawal</Text>
            <Text style={[theme.text.bodySmall, styles.resultSub]}>
              {withdraw.error instanceof ApiError ? withdraw.error.message : 'Please try again.'}
            </Text>
            <Button title="Try again" onPress={() => withdraw.reset()} style={styles.resultButton} />
          </View>
        ) : (
          <>
            <Text style={[theme.text.label, styles.sheetLabel]}>AMOUNT</Text>
            <Input
              value={amountInput}
              onChangeText={setAmountInput}
              placeholder={`Up to ${formatCurrency(balanceRs)}`}
              keyboardType="number-pad"
              prefix="₹"
              containerStyle={styles.sheetField}
            />
            <Text style={[theme.text.label, styles.sheetLabel]}>UPI ID</Text>
            <Input
              value={upiId}
              onChangeText={setUpiId}
              placeholder="yourname@upi"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button
              title={withdraw.isPending ? 'Requesting…' : 'Request Withdrawal'}
              onPress={handleSubmit}
              loading={withdraw.isPending}
              disabled={withdraw.isPending || !amountInput || !upiId}
              style={styles.sheetSubmit}
            />
          </>
        )}
      </View>
    </Sheet>
  );
}

export default Wallet;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  scroll: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxxl,
  },
  balanceCard: {
    alignItems: 'center',
  },
  balanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  balanceLabel: {
    color: theme.colors.text.tertiary,
    marginBottom: 4,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  balanceButton: {
    minWidth: 140,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  pendingCard: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.amber[50],
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.sm,
  },
  pendingTitle: {
    color: theme.colors.amber[700],
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sectionLabel: {
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  tabRow: {
    paddingHorizontal: 0,
    marginBottom: theme.spacing.md,
  },
  txSkeletonWrap: {
    gap: theme.spacing.sm,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  txText: {
    flex: 1,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: 4,
  },
  txDate: {
    color: theme.colors.text.tertiary,
  },
  txPositive: {
    color: theme.colors.accent[600],
  },
  txNegative: {
    color: theme.colors.state.error,
  },
  loadMoreWrap: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  sheetContent: {
    paddingHorizontal: theme.layout.screenPadding,
  },
  sheetLabel: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  sheetField: {
    marginBottom: theme.spacing.lg,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  sheetSubmit: {
    marginTop: theme.spacing.xl,
  },
  resultWrap: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
  },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  resultIconSuccess: {
    backgroundColor: theme.colors.accent[50],
  },
  resultIconError: {
    backgroundColor: theme.colors.state.errorBg,
  },
  resultIconPending: {
    backgroundColor: theme.colors.amber[50],
  },
  resultTitle: {
    textAlign: 'center',
  },
  resultSub: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
  },
  resultButton: {
    marginTop: theme.spacing.xl,
    alignSelf: 'stretch',
  },
});
