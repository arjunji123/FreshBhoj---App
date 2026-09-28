import React, { useMemo, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import type { KitchenOrderCard, OrderStatus } from '../kitchenPartner.types';

/** There's no order-detail screen yet and chat only makes sense once the
 * kitchen has actually taken the order — a still-`PLACED` order can still be
 * rejected outright, so no thread exists for it server-side either. */
const CHAT_ENABLED_STATUSES: OrderStatus[] = ['ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  ACCEPTED: 'Accept order',
  PREPARING: 'Start preparing',
  OUT_FOR_DELIVERY: 'Mark out for delivery',
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
type Period = 'today' | 'month' | 'year';

const TAB_LABEL: Record<OrderTab, string> = {
  new: 'New',
  preparing: 'Preparing',
  outForDelivery: 'Out for Delivery',
  completed: 'Completed',
};

function periodToRange(period: Period): { dateFrom?: string } {
  const now = new Date();
  if (period === 'today') return { dateFrom: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString() };
  if (period === 'month') return { dateFrom: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() };
  return { dateFrom: new Date(now.getFullYear(), 0, 1).toISOString() };
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
  const canChat = CHAT_ENABLED_STATUSES.includes(order.status);

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
      <View style={styles.phoneRow}>
        <Phone size={11} color={theme.colors.brand.primary} />
        <Text style={styles.phoneText}>{order.customer.phone}</Text>
      </View>
      {order.items.map((item, i) => (
        <Text key={i} style={styles.itemText}>
          {item.quantity}× {item.name}
        </Text>
      ))}
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
          <TouchableOpacity onPress={onReject} disabled={isBusy} style={styles.cancelButton}>
            <Text style={styles.rejectText}>Reject order</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => onAction('CANCELLED')} disabled={isBusy} style={styles.cancelButton}>
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
  const range = useMemo(() => periodToRange(period), [period]);
  const query = useKitchenOrderHistory({ page: 1, ...range, status: ['DELIVERED', 'CANCELLED'] });

  return (
    <View style={{ flex: 1 }}>
      <ChipRow style={styles.periodRow}>
        <Chip label="Today" selected={period === 'today'} onPress={() => setPeriod('today')} />
        <Chip label="This month" selected={period === 'month'} onPress={() => setPeriod('month')} />
        <Chip label="This year" selected={period === 'year'} onPress={() => setPeriod('year')} />
      </ChipRow>

      {query.isLoading ? (
        <View style={styles.listPadding}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={80} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.sm }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={query.data?.items ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={query.data?.items.length ? styles.listPadding : styles.emptyPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState title="No orders in this range" description="Try a different period." />}
          renderItem={({ item }) => (
            <Card style={styles.historyCard}>
              <View style={styles.orderTopRow}>
                <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
                <View style={styles.orderTopRowActions}>
                  {CHAT_ENABLED_STATUSES.includes(item.status) ? (
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
  periodRow: { marginBottom: theme.spacing.paddings.sm },
  orderCard: { marginBottom: theme.spacing.paddings.sm },
  historyCard: { marginBottom: theme.spacing.paddings.sm },
  orderTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  orderTopRowActions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.xs },
  chatButton: {
    width: 26,
    height: 26,
    borderRadius: theme.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.primarySubtle,
  },
  orderNumber: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  customerName: { ...theme.text.caption, color: theme.colors.text.secondary, marginBottom: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: theme.spacing.paddings.xs },
  phoneText: { ...theme.text.caption, color: theme.colors.brand.primary, fontWeight: '700' as const },
  itemText: { ...theme.text.caption, color: theme.colors.text.secondary },
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
  cancelButton: { alignItems: 'center', marginTop: theme.spacing.paddings.xs },
  cancelText: { ...theme.text.caption, color: theme.colors.text.tertiary, fontWeight: '700' as const },
  rejectText: { ...theme.text.caption, color: theme.colors.state.error, fontWeight: '700' as const },
  historyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.paddings.xs },
  historyDate: { ...theme.text.caption, color: theme.colors.text.tertiary },
  rejectSheetBody: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  rejectSheetHint: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginBottom: theme.spacing.paddings.md },
  rejectInput: { marginBottom: theme.spacing.paddings.lg },
});
