import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock, MessageCircle, Phone, StickyNote } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { Badge, Button, Card, Chip, ChipRow, EmptyState, Input, Screen, Sheet, Skeleton } from '@components/ui';
import type { SheetHandle } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import {
  useAdvanceOrderStatus,
  useKitchenIncomingOrders,
  useKitchenOrderHistory,
} from '../hooks/useKitchenPortal';
import type { KitchenOrderCard, KitchenOrderItem, OrderStatus } from '../kitchenPartner.types';
import { callPhone } from '../utils/contact';

/** Chat only makes sense once the kitchen has actually taken the order — a
 * still-`PLACED` order can still be rejected outright, so no thread exists
 * for it server-side either (same rule as the website's order board). */
const CHAT_DISABLED_STATUSES: string[] = ['PLACED', 'PENDING_PAYMENT'];
const canChatFor = (status: OrderStatus) => !CHAT_DISABLED_STATUSES.includes(status);

/** `item.customizations` is typed `unknown` on the wire — the backend populates it as `{ name, priceDelta }[]`. */
function customizationNames(customizations: unknown): string[] {
  if (!Array.isArray(customizations)) return [];
  return customizations
    .map((c) => (c && typeof c === 'object' && 'name' in c ? String((c as { name: unknown }).name) : null))
    .filter((name): name is string => Boolean(name));
}

function itemNote(item: KitchenOrderItem): string | null {
  const parts = [...customizationNames(item.customizations)];
  if (item.specialInstructions) parts.push(item.specialInstructions);
  return parts.length > 0 ? `${item.name}: ${parts.join(', ')}` : null;
}

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  ACCEPTED: 'Accept order',
  PREPARING: 'Start preparing',
  OUT_FOR_DELIVERY: 'Mark out for delivery',
  DELIVERED: 'Mark delivered',
  CANCELLED: 'Cancel order',
};

const STATUS_TONE: Record<string, 'accent' | 'brand' | 'neutral' | 'warning' | 'danger' | 'info'> = {
  PLACED: 'warning',
  ACCEPTED: 'info',
  PREPARING: 'accent',
  OUT_FOR_DELIVERY: 'brand',
  DELIVERED: 'neutral',
  CANCELLED: 'danger',
};

/** Client-side bucketing of the live-orders feed into the 4 order tabs. */
const STATUS_BUCKET: Partial<Record<OrderStatus, OrderTab>> = {
  PLACED: 'new',
  ACCEPTED: 'new',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'outForDelivery',
};

type OrderTab = 'new' | 'preparing' | 'outForDelivery' | 'completed';
type Period = 'today' | 'month' | 'year' | 'custom';

const TAB_LABEL: Record<OrderTab, string> = {
  new: 'New',
  preparing: 'Preparing',
  outForDelivery: 'Out for Delivery',
  completed: 'Completed',
};

/** Parses a `YYYY-MM-DD` value into local date parts; null for anything that isn't a real calendar day. */
function parseDateInput(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(year, month - 1, day);
  if (check.getFullYear() !== year || check.getMonth() !== month - 1 || check.getDate() !== day) return null;
  return { year, month, day };
}

function periodToRange(period: Period, customFrom: string, customTo: string): { dateFrom?: string; dateTo?: string } {
  const now = new Date();
  if (period === 'today') return { dateFrom: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString() };
  if (period === 'month') return { dateFrom: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() };
  if (period === 'year') return { dateFrom: new Date(now.getFullYear(), 0, 1).toISOString() };
  // Built from local date parts (same as the website) so the boundary doesn't shift by the UTC offset.
  const from = parseDateInput(customFrom);
  const to = parseDateInput(customTo);
  return {
    dateFrom: from ? new Date(from.year, from.month - 1, from.day).toISOString() : undefined,
    dateTo: to ? new Date(to.year, to.month - 1, to.day, 23, 59, 59, 999).toISOString() : undefined,
  };
}

const KitchenOrders = () => {
  const [tab, setTab] = useState<OrderTab>('new');

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Text style={theme.text.h1}>Orders</Text>
        <ChipRow>
          {(Object.keys(TAB_LABEL) as OrderTab[]).map((key) => (
            <Chip key={key} label={TAB_LABEL[key]} selected={tab === key} onPress={() => setTab(key)} />
          ))}
        </ChipRow>
      </View>

      {tab === 'completed' ? <OrderHistoryList /> : <LiveOrders bucket={tab} />}
    </Screen>
  );
};

function LiveOrders({ bucket }: { bucket: Exclude<OrderTab, 'completed'> }) {
  const query = useKitchenIncomingOrders();
  const advance = useAdvanceOrderStatus();

  const rejectSheetRef = useRef<SheetHandle>(null);
  const [rejectTarget, setRejectTarget] = useState<KitchenOrderCard | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const bucketed = useMemo(() => (query.data ?? []).filter((order) => STATUS_BUCKET[order.status] === bucket), [query.data, bucket]);

  const confirmAdvance = (order: KitchenOrderCard, status: OrderStatus) => {
    const label = ACTION_LABEL[status] ?? 'Update order';
    Alert.alert(
      `${label}?`,
      status === 'CANCELLED'
        ? 'This cannot be undone — the customer will be notified their order was cancelled.'
        : 'The customer sees this update immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: label,
          style: status === 'CANCELLED' ? 'destructive' : 'default',
          onPress: () =>
            advance.mutate(
              { id: order.id, status },
              {
                onError: (error) =>
                  Alert.alert('Could not update order', error instanceof KitchenApiError ? error.message : 'Please try again.'),
              },
            ),
        },
      ],
    );
  };

  const openReject = (order: KitchenOrderCard) => {
    setRejectTarget(order);
    setRejectReason('');
    rejectSheetRef.current?.open();
  };

  const submitReject = () => {
    if (!rejectTarget) return;
    advance.mutate(
      { id: rejectTarget.id, status: 'CANCELLED', note: rejectReason.trim() || undefined },
      {
        onSuccess: () => rejectSheetRef.current?.close(),
        onError: (error) =>
          Alert.alert('Could not reject order', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  if (query.isLoading) {
    return (
      <View style={styles.listPadding}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={140} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.sm }} />
        ))}
      </View>
    );
  }

  if (query.isError) {
    return (
      <View style={styles.emptyPadding}>
        <EmptyState title="Something went wrong" description="We couldn't load your orders." actionLabel="Retry" onAction={() => query.refetch()} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={bucketed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={bucketed.length ? styles.listPadding : styles.emptyPadding}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.colors.primary[600]} />}
        ListEmptyComponent={
          <EmptyState
            title={`No ${TAB_LABEL[bucket].toLowerCase()} orders`}
            description={bucket === 'new' ? 'New orders will show up here the moment they come in.' : 'Nothing here right now.'}
          />
        }
        renderItem={({ item }) => (
          <OrderRow
            order={item}
            showReject={bucket === 'new'}
            onAction={(status) => confirmAdvance(item, status)}
            onReject={() => openReject(item)}
            isBusy={advance.isPending && advance.variables?.id === item.id}
          />
        )}
      />

      <Sheet ref={rejectSheetRef} title="Reject order" eyebrow={rejectTarget ? `#${rejectTarget.orderNumber}` : undefined}>
        <View style={styles.rejectSheetBody}>
          <Text style={styles.rejectSheetHint}>Let the customer know why — this is shown to them along with the cancellation.</Text>
          <Input
            label="Reason (optional)"
            value={rejectReason}
            onChangeText={setRejectReason}
            placeholder="e.g. Out of stock, kitchen too busy"
            multiline
            containerStyle={styles.rejectInput}
          />
          <Button
            title={advance.isPending ? 'Rejecting…' : 'Reject order'}
            variant="danger"
            onPress={submitReject}
            loading={advance.isPending}
          />
        </View>
      </Sheet>
    </>
  );
}

function OrderRow({
  order,
  showReject,
  onAction,
  onReject,
  isBusy,
}: {
  order: KitchenOrderCard;
  showReject: boolean;
  onAction: (status: OrderStatus) => void;
  onReject: () => void;
  isBusy: boolean;
}) {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const forwardAction = order.allowedNextStatuses.find((s) => s !== 'CANCELLED');
  const canCancel = order.allowedNextStatuses.includes('CANCELLED');
  const canChat = canChatFor(order.status);

  return (
    <Card style={styles.orderCard}>
      <View style={styles.orderTopRow}>
        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        <View style={styles.orderTopRowActions}>
          {canChat ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('OrderChat', { orderId: order.id, orderNumber: order.orderNumber })}
              hitSlop={theme.layout.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Chat with customer"
              style={styles.chatButton}
            >
              <MessageCircle size={16} color={theme.colors.brand.primary} />
            </TouchableOpacity>
          ) : null}
          <Badge label={order.status.replace(/_/g, ' ')} tone={STATUS_TONE[order.status] ?? 'neutral'} size="sm" />
        </View>
      </View>
      <Text style={styles.customerName}>{order.customer.name}</Text>
      <TouchableOpacity
        style={styles.phoneRow}
        onPress={() => callPhone(order.customer.phone)}
        accessibilityRole="button"
        accessibilityLabel={`Call ${order.customer.name}`}
        hitSlop={theme.layout.hitSlop}
      >
        <Phone size={11} color={theme.colors.brand.primary} />
        <Text style={styles.phoneText}>{order.customer.phone}</Text>
      </TouchableOpacity>
      {order.items.map((item, i) => {
        const names = customizationNames(item.customizations);
        return (
          <View key={i}>
            <Text style={styles.itemText}>
              {item.quantity}× {item.name}
            </Text>
            {names.length > 0 ? <Text style={styles.itemExtra}>{names.join(', ')}</Text> : null}
            {item.specialInstructions ? <Text style={styles.itemInstruction}>{`"${item.specialInstructions}"`}</Text> : null}
          </View>
        );
      })}
      {order.orderNotes ? (
        <View style={styles.notesRow}>
          <StickyNote size={11} color={theme.colors.text.tertiary} />
          <Text style={styles.notesText} numberOfLines={3}>
            {order.orderNotes}
          </Text>
        </View>
      ) : null}
      <View style={styles.etaRow}>
        <Clock size={11} color={theme.colors.text.tertiary} />
        <Text style={styles.etaText}>ETA {order.etaMinutes} mins</Text>
        <Text style={styles.orderTotal}>{`₹${order.totalAmount}`}</Text>
      </View>
      {forwardAction ? (
        <Button title={ACTION_LABEL[forwardAction] ?? forwardAction} onPress={() => onAction(forwardAction)} loading={isBusy} style={styles.actionButton} />
      ) : null}
      {canCancel ? (
        showReject ? (
          <TouchableOpacity onPress={onReject} disabled={isBusy} style={styles.cancelButton} accessibilityRole="button">
            <Text style={styles.rejectText}>Reject order</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => onAction('CANCELLED')} disabled={isBusy} style={styles.cancelButton} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel order</Text>
          </TouchableOpacity>
        )
      ) : null}
    </Card>
  );
}

function OrderHistoryList() {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const [period, setPeriod] = useState<Period>('month');
  const [page, setPage] = useState(1);
  const [pagesMap, setPagesMap] = useState<Record<number, KitchenOrderCard[]>>({});
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const range = useMemo(() => periodToRange(period, customFrom, customTo), [period, customFrom, customTo]);
  const query = useKitchenOrderHistory({ page, ...range, status: ['DELIVERED', 'CANCELLED'] });

  useEffect(() => {
    setPage(1);
    setPagesMap({});
  }, [period, customFrom, customTo]);

  useEffect(() => {
    if (!query.data) return;
    setPagesMap((prev) => ({ ...prev, [page]: query.data!.items }));
  }, [query.data, page]);

  const items = useMemo(() => {
    const pageNumbers = Object.keys(pagesMap).map(Number).sort((a, b) => a - b);
    return pageNumbers.flatMap((p) => pagesMap[p] ?? []);
  }, [pagesMap]);

  const handleRefresh = () => {
    if (page === 1) {
      query.refetch();
    } else {
      setPage(1);
      setPagesMap({});
    }
  };

  return (
    <View style={styles.historyWrap}>
      <ChipRow style={styles.periodRow}>
        <Chip label="Today" selected={period === 'today'} onPress={() => setPeriod('today')} />
        <Chip label="This month" selected={period === 'month'} onPress={() => setPeriod('month')} />
        <Chip label="This year" selected={period === 'year'} onPress={() => setPeriod('year')} />
        <Chip label="Custom range" selected={period === 'custom'} onPress={() => setPeriod('custom')} />
      </ChipRow>

      {period === 'custom' ? (
        <View style={styles.customRangeRow}>
          <Input
            label="From"
            value={customFrom}
            onChangeText={setCustomFrom}
            placeholder="YYYY-MM-DD"
            maxLength={10}
            size="md"
            keyboardType="numbers-and-punctuation"
            containerStyle={styles.customRangeField}
          />
          <Input
            label="To"
            value={customTo}
            onChangeText={setCustomTo}
            placeholder="YYYY-MM-DD"
            maxLength={10}
            size="md"
            keyboardType="numbers-and-punctuation"
            containerStyle={styles.customRangeField}
          />
        </View>
      ) : null}

      {query.isError && items.length === 0 ? (
        <View style={styles.emptyPadding}>
          <EmptyState title="Something went wrong" description="We couldn't load your past orders." actionLabel="Retry" onAction={() => query.refetch()} />
        </View>
      ) : query.isLoading && page === 1 && items.length === 0 ? (
        <View style={styles.listPadding}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={80} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.sm }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={items.length ? styles.listPadding : styles.emptyPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={query.isRefetching && page === 1} onRefresh={handleRefresh} tintColor={theme.colors.primary[600]} />}
          ListEmptyComponent={<EmptyState title="No orders in this range" description="Try a different period." />}
          ListFooterComponent={
            query.data?.meta.hasNextPage ? (
              <View style={styles.loadMoreWrap}>
                {query.isFetching && page > 1 ? (
                  <ActivityIndicator color={theme.colors.brand.primary} />
                ) : (
                  <Button title="Load more" variant="outline" size="sm" fullWidth={false} onPress={() => setPage((p) => p + 1)} />
                )}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Card style={styles.historyCard}>
              <View style={styles.orderTopRow}>
                <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
                <View style={styles.orderTopRowActions}>
                  {canChatFor(item.status) ? (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('OrderChat', { orderId: item.id, orderNumber: item.orderNumber })}
                      hitSlop={theme.layout.hitSlop}
                      accessibilityRole="button"
                      accessibilityLabel="Chat with customer"
                      style={styles.chatButton}
                    >
                      <MessageCircle size={16} color={theme.colors.brand.primary} />
                    </TouchableOpacity>
                  ) : null}
                  <Badge label={item.status.replace(/_/g, ' ')} tone={STATUS_TONE[item.status] ?? 'neutral'} size="sm" />
                </View>
              </View>
              <Text style={styles.customerName}>{item.customer.name}</Text>
              <Text style={styles.itemText} numberOfLines={1}>
                {item.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
              </Text>
              {item.orderNotes ? (
                <View style={styles.notesRow}>
                  <StickyNote size={11} color={theme.colors.text.tertiary} />
                  <Text style={styles.notesText} numberOfLines={2}>
                    {item.orderNotes}
                  </Text>
                </View>
              ) : null}
              {item.items.map(itemNote).filter((n): n is string => Boolean(n)).map((note) => (
                <Text key={note} style={styles.itemExtra} numberOfLines={2}>
                  {note}
                </Text>
              ))}
              <View style={styles.historyFooter}>
                <Text style={styles.historyDate}>{new Date(item.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                <Text style={styles.orderTotal}>{`₹${item.totalAmount}`}</Text>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

export default KitchenOrders;

const styles = StyleSheet.create({
  header: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.sm, gap: theme.spacing.paddings.sm },
  listPadding: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl },
  emptyPadding: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.layout.screenPadding },
  historyWrap: { flex: 1 },
  loadMoreWrap: { alignItems: 'center', paddingVertical: theme.spacing.paddings.lg },
  periodRow: { marginBottom: theme.spacing.paddings.sm },
  orderCard: { marginBottom: theme.spacing.paddings.sm },
  historyCard: { marginBottom: theme.spacing.paddings.sm },
  orderTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  orderTopRowActions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.xs },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.primarySubtle,
  },
  orderNumber: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  customerName: { ...theme.text.caption, color: theme.colors.text.secondary, marginBottom: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, minHeight: 28, marginBottom: theme.spacing.paddings.xs },
  phoneText: { ...theme.text.caption, color: theme.colors.brand.primary, fontWeight: '700' as const },
  itemText: { ...theme.text.caption, color: theme.colors.text.secondary },
  itemExtra: { ...theme.text.caption, color: theme.colors.text.tertiary, marginLeft: theme.spacing.paddings.sm },
  itemInstruction: { ...theme.text.caption, color: theme.colors.text.secondary, fontStyle: 'italic' as const, marginLeft: theme.spacing.paddings.sm },
  customRangeRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm, paddingHorizontal: theme.layout.screenPadding, marginBottom: theme.spacing.paddings.sm },
  customRangeField: { flex: 1 },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: theme.spacing.paddings.xs,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.radius.sm,
    padding: theme.spacing.paddings.xs,
  },
  notesText: { ...theme.text.caption, color: theme.colors.text.secondary, flex: 1 },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: theme.spacing.paddings.xs, marginBottom: theme.spacing.paddings.sm },
  etaText: { ...theme.text.caption, color: theme.colors.text.tertiary, flex: 1 },
  orderTotal: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  actionButton: { width: '100%' },
  cancelButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, marginTop: theme.spacing.paddings.xs },
  cancelText: { ...theme.text.caption, color: theme.colors.text.tertiary, fontWeight: '700' as const },
  rejectText: { ...theme.text.caption, color: theme.colors.state.error, fontWeight: '700' as const },
  historyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.paddings.xs },
  historyDate: { ...theme.text.caption, color: theme.colors.text.tertiary },
  rejectSheetBody: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  rejectSheetHint: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginBottom: theme.spacing.paddings.md },
  rejectInput: { marginBottom: theme.spacing.paddings.lg },
});
