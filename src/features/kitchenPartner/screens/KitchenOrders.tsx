import React, { useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock, Phone } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Badge, Button, Card, Chip, ChipRow, EmptyState, Screen, Skeleton } from '@components/ui';
import { KitchenApiError } from '../api/kitchenClient';
import {
  useAdvanceOrderStatus,
  useKitchenIncomingOrders,
  useKitchenOrderHistory,
} from '../hooks/useKitchenPortal';
import type { KitchenOrderCard, OrderStatus } from '../kitchenPartner.types';

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

type Tab = 'live' | 'history';
type Period = 'today' | 'month' | 'year';

function periodToRange(period: Period): { dateFrom?: string } {
  const now = new Date();
  if (period === 'today') return { dateFrom: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString() };
  if (period === 'month') return { dateFrom: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() };
  return { dateFrom: new Date(now.getFullYear(), 0, 1).toISOString() };
}

const KitchenOrders = () => {
  const [tab, setTab] = useState<Tab>('live');

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Text style={theme.text.h1}>Orders</Text>
        <ChipRow>
          <Chip label="Live" selected={tab === 'live'} onPress={() => setTab('live')} />
          <Chip label="History" selected={tab === 'history'} onPress={() => setTab('history')} />
        </ChipRow>
      </View>

      {tab === 'live' ? <LiveOrders /> : <OrderHistoryList />}
    </Screen>
  );
};

function LiveOrders() {
  const query = useKitchenIncomingOrders();
  const advance = useAdvanceOrderStatus();

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
    <FlatList
      data={query.data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={query.data?.length ? styles.listPadding : styles.emptyPadding}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.colors.primary[600]} />}
      ListEmptyComponent={<EmptyState title="No live orders" description="New orders will show up here the moment they come in." />}
      renderItem={({ item }) => (
        <OrderRow order={item} onAction={(status) => confirmAdvance(item, status)} isBusy={advance.isPending && advance.variables?.id === item.id} />
      )}
    />
  );
}

function OrderRow({
  order,
  onAction,
  isBusy,
}: {
  order: KitchenOrderCard;
  onAction: (status: OrderStatus) => void;
  isBusy: boolean;
}) {
  const forwardAction = order.allowedNextStatuses.find((s) => s !== 'CANCELLED');
  const canCancel = order.allowedNextStatuses.includes('CANCELLED');

  return (
    <Card style={styles.orderCard}>
      <View style={styles.orderTopRow}>
        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        <Badge label={order.status.replace(/_/g, ' ')} tone={STATUS_TONE[order.status] ?? 'neutral'} size="sm" />
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
      <View style={styles.etaRow}>
        <Clock size={11} color={theme.colors.text.tertiary} />
        <Text style={styles.etaText}>ETA {order.etaMinutes} mins</Text>
        <Text style={styles.orderTotal}>{`₹${order.totalAmount}`}</Text>
      </View>
      {forwardAction ? (
        <Button title={ACTION_LABEL[forwardAction] ?? forwardAction} onPress={() => onAction(forwardAction)} loading={isBusy} style={styles.actionButton} />
      ) : null}
      {canCancel ? (
        <TouchableOpacity onPress={() => onAction('CANCELLED')} disabled={isBusy} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel order</Text>
        </TouchableOpacity>
      ) : null}
    </Card>
  );
}

function OrderHistoryList() {
  const [period, setPeriod] = useState<Period>('month');
  const range = useMemo(() => periodToRange(period), [period]);
  const query = useKitchenOrderHistory({ page: 1, ...range });

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
                <Badge label={item.status.replace(/_/g, ' ')} tone={STATUS_TONE[item.status] ?? 'neutral'} size="sm" />
              </View>
              <Text style={styles.customerName}>{item.customer.name}</Text>
              <Text style={styles.itemText} numberOfLines={1}>
                {item.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
              </Text>
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
  orderNumber: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  customerName: { ...theme.text.caption, color: theme.colors.text.secondary, marginBottom: 2 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: theme.spacing.paddings.xs },
  phoneText: { ...theme.text.caption, color: theme.colors.brand.primary, fontWeight: '700' as const },
  itemText: { ...theme.text.caption, color: theme.colors.text.secondary },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: theme.spacing.paddings.xs, marginBottom: theme.spacing.paddings.sm },
  etaText: { ...theme.text.caption, color: theme.colors.text.tertiary, flex: 1 },
  orderTotal: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  actionButton: { width: '100%' },
  cancelButton: { alignItems: 'center', marginTop: theme.spacing.paddings.xs },
  cancelText: { ...theme.text.caption, color: theme.colors.text.tertiary, fontWeight: '700' as const },
  historyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.paddings.xs },
  historyDate: { ...theme.text.caption, color: theme.colors.text.tertiary },
});
