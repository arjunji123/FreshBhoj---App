import React, { useCallback } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Bell, IndianRupee, Package, Star, TrendingUp, Users } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Card, EmptyState, Screen, Skeleton } from '@components/ui';
import AppGradient from '@components/AppGradient';
import { KitchenApiError } from '../api/kitchenClient';
import { useKitchenAuthStore } from '../store/kitchenAuthStore';
import { useKitchenDashboard, useKitchenIncomingOrders, useSetAcceptingOrders } from '../hooks/useKitchenPortal';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const KitchenDashboard = () => {
  const account = useKitchenAuthStore((s) => s.account);
  const dashboard = useKitchenDashboard();
  const incomingOrders = useKitchenIncomingOrders();
  const setAccepting = useSetAcceptingOrders();

  const onRefresh = useCallback(() => {
    dashboard.refetch();
    incomingOrders.refetch();
  }, [dashboard, incomingOrders]);

  const summary = dashboard.data;

  return (
    <Screen background="page">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={dashboard.isRefetching} onRefresh={onRefresh} tintColor={theme.colors.primary[600]} />}
      >
        <AppGradient colors={theme.colors.defaultColor} direction="diagonal" style={styles.banner}>
          <Text style={styles.bannerGreeting}>{greeting()},</Text>
          <Text style={styles.bannerName} numberOfLines={1}>
            {account?.ownerName ?? 'Partner'}
          </Text>
          <Text style={styles.bannerDate}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>

          {summary ? (
            <View style={styles.acceptingRow}>
              <Text style={styles.acceptingLabel}>{summary.isAcceptingOrders ? 'Taking orders' : 'Paused'}</Text>
              <Switch
                value={summary.isAcceptingOrders}
                onValueChange={(value) =>
                  setAccepting.mutate(value, {
                    onError: (error) =>
                      Alert.alert('Could not update status', error instanceof KitchenApiError ? error.message : 'Please try again.'),
                  })
                }
                disabled={setAccepting.isPending}
                trackColor={{ true: 'rgba(255,255,255,0.4)', false: 'rgba(0,0,0,0.25)' }}
                thumbColor={theme.colors.palette.white}
              />
            </View>
          ) : null}
        </AppGradient>

        {summary?.actionNeeded ? (
          <Card style={styles.actionCard} padding="md">
            <Bell size={16} color={theme.colors.amber[600]} />
            <Text style={styles.actionText}>{summary.actionNeeded}</Text>
          </Card>
        ) : null}

        {dashboard.isError ? (
          <EmptyState
            icon={<Bell size={28} color={theme.colors.text.tertiary} />}
            title="Something went wrong"
            description="We couldn't load your dashboard."
            actionLabel="Retry"
            onAction={() => dashboard.refetch()}
          />
        ) : dashboard.isLoading || !summary ? (
          <View style={styles.statsGrid}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={96} radius={theme.radius.card} style={styles.statSkeleton} />
            ))}
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <StatCard icon={<Package size={16} color={theme.colors.brand.primary} />} label="Orders today" value={summary.today.orderCount} />
            <StatCard icon={<TrendingUp size={16} color={theme.colors.brand.primary} />} label="Active now" value={summary.today.activeOrderCount} />
            <StatCard
              icon={<IndianRupee size={16} color={theme.colors.brand.primary} />}
              label="Revenue today"
              value={`₹${summary.today.revenue.toLocaleString('en-IN')}`}
            />
            <StatCard
              icon={<Star size={16} color={theme.colors.brand.primary} />}
              label="Rating"
              value={summary.allTime.rating ? summary.allTime.rating.toFixed(1) : '—'}
            />
          </View>
        )}

        {summary ? (
          <Card style={styles.allTimeCard}>
            <Text style={styles.sectionLabel}>ALL-TIME</Text>
            <View style={styles.allTimeGrid}>
              <View style={styles.allTimeItem}>
                <Text style={styles.allTimeValue}>{summary.allTime.orderCount}</Text>
                <Text style={styles.allTimeSub}>orders</Text>
              </View>
              <View style={styles.allTimeItem}>
                <Text style={styles.allTimeValue}>{`₹${summary.allTime.revenue.toLocaleString('en-IN')}`}</Text>
                <Text style={styles.allTimeSub}>revenue</Text>
              </View>
              <View style={styles.allTimeItem}>
                <View style={styles.allTimeIconRow}>
                  <Users size={13} color={theme.colors.text.secondary} />
                  <Text style={styles.allTimeValue}>{summary.allTime.followerCount}</Text>
                </View>
                <Text style={styles.allTimeSub}>followers</Text>
              </View>
              <View style={styles.allTimeItem}>
                <Text style={styles.allTimeValue}>{summary.allTime.activeMealCount}</Text>
                <Text style={styles.allTimeSub}>dishes live</Text>
              </View>
            </View>
          </Card>
        ) : null}

        {incomingOrders.data && incomingOrders.data.length > 0 ? (
          <Card style={styles.liveOrdersCard}>
            <Text style={styles.sectionLabel}>LIVE ORDERS</Text>
            {incomingOrders.data.slice(0, 4).map((order) => (
              <View key={order.id} style={styles.liveOrderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.liveOrderNumber}>#{order.orderNumber}</Text>
                  <Text style={styles.liveOrderItems} numberOfLines={1}>
                    {order.customer.name} · {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                  </Text>
                </View>
                <Text style={styles.liveOrderTotal}>{`₹${order.totalAmount}`}</Text>
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
};

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card style={styles.statCard} padding="md">
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

export default KitchenDashboard;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl, paddingTop: theme.spacing.paddings.sm },
  banner: { borderRadius: theme.radius.card, padding: theme.spacing.paddings.lg, marginBottom: theme.spacing.paddings.md },
  bannerGreeting: { ...theme.text.bodySmall, color: 'rgba(255,255,255,0.85)' },
  bannerName: { ...theme.text.h2, color: theme.colors.palette.white, marginTop: 2 },
  bannerDate: { ...theme.text.bodySmall, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  acceptingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.paddings.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.paddings.md,
    paddingVertical: theme.spacing.paddings.xs,
  },
  acceptingLabel: { ...theme.text.bodyMedium, color: theme.colors.palette.white, fontWeight: '700' as const },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.paddings.sm,
    backgroundColor: theme.colors.amber[50],
    marginBottom: theme.spacing.paddings.md,
  },
  actionText: { ...theme.text.bodySmall, color: theme.colors.amber[700], flex: 1, fontWeight: '600' as const },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.paddings.sm, marginBottom: theme.spacing.paddings.md },
  statSkeleton: { width: '47%' },
  statCard: { width: '47%' },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.brand.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.paddings.xs,
  },
  statValue: { ...theme.text.h3, color: theme.colors.text.primary },
  statLabel: { ...theme.text.caption, color: theme.colors.text.secondary, marginTop: 2 },
  allTimeCard: { marginBottom: theme.spacing.paddings.md },
  sectionLabel: { ...theme.text.overline, color: theme.colors.text.tertiary, marginBottom: theme.spacing.paddings.sm },
  allTimeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.paddings.md },
  allTimeItem: { width: '40%' },
  allTimeIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  allTimeValue: { ...theme.text.h4, color: theme.colors.text.primary },
  allTimeSub: { ...theme.text.caption, color: theme.colors.text.tertiary },
  liveOrdersCard: { marginBottom: theme.spacing.paddings.md },
  liveOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.paddings.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  liveOrderNumber: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  liveOrderItems: { ...theme.text.caption, color: theme.colors.text.secondary, marginTop: 2 },
  liveOrderTotal: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
});
