import React, { useCallback } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import {
  Bell,
  Clapperboard,
  IndianRupee,
  Megaphone,
  MessageCircle,
  Package,
  Plus,
  Star,
  TrendingUp,
  UtensilsCrossed,
  Users,
  Wallet,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-gifted-charts';
import { theme } from '@app/theme/index';
import { Badge, Card, EmptyState, Screen, Skeleton } from '@components/ui';
import AppGradient from '@components/AppGradient';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useKitchenAuthStore } from '../store/kitchenAuthStore';
import {
  useKitchenDashboard,
  useKitchenIncomingOrders,
  useKitchenUnreadNotificationCount,
  useSetAcceptingOrders,
} from '../hooks/useKitchenPortal';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const KitchenDashboard = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const account = useKitchenAuthStore((s) => s.account);
  const dashboard = useKitchenDashboard();
  const incomingOrders = useKitchenIncomingOrders();
  const setAccepting = useSetAcceptingOrders();
  const unreadCount = useKitchenUnreadNotificationCount();

  const onRefresh = useCallback(() => {
    dashboard.refetch();
    incomingOrders.refetch();
  }, [dashboard, incomingOrders]);

  const summary = dashboard.data;
  const isLive = !!summary && summary.isAcceptingOrders && summary.accountStatus === 'ACTIVE';

  return (
    <Screen background="page">
      <View style={styles.topBar}>
        <Text style={theme.text.h2}>Dashboard</Text>
        <View style={styles.topBarActions}>
          <Pressable
            onPress={() => navigation.navigate('BhojAiChat')}
            hitSlop={theme.layout.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="BhojAI Assistant"
            style={({ pressed }) => [styles.topBarButton, pressed ? styles.topBarButtonPressed : null]}
          >
            <MessageCircle size={20} color={theme.colors.text.primary} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            hitSlop={theme.layout.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={({ pressed }) => [styles.topBarButton, pressed ? styles.topBarButtonPressed : null]}
          >
            <Bell size={20} color={theme.colors.text.primary} />
            {unreadCount.data ? <View style={styles.unreadDot} /> : null}
          </Pressable>
        </View>
      </View>

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
            <View style={styles.statusBadgeRow}>
              {isLive ? <Badge label="LIVE" tone="accent" variant="solid" size="sm" /> : null}
              <Badge
                label={`Status: ${summary.accountStatus === 'ACTIVE' ? 'Active' : summary.accountStatus}`}
                tone="accent"
                variant="solid"
                size="sm"
              />
              <Badge
                label={`Visibility: ${summary.isAcceptingOrders ? 'Public' : 'Paused'}`}
                tone={summary.isAcceptingOrders ? 'accent' : 'neutral'}
                variant="solid"
                size="sm"
              />
            </View>
          ) : null}

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

        <View style={styles.quickActionsRow}>
          <QuickAction
            icon={<Plus size={20} color={theme.colors.brand.primary} />}
            label="Add Dish"
            onPress={() => navigation.navigate('KitchenMealForm')}
          />
          <QuickAction
            icon={<Clapperboard size={20} color={theme.colors.brand.primary} />}
            label="Create Reel"
            onPress={() => navigation.navigate('KitchenTabs', { screen: 'KitchenReels' })}
          />
          <QuickAction
            icon={<UtensilsCrossed size={20} color={theme.colors.brand.primary} />}
            label="Manage Menu"
            onPress={() => navigation.navigate('KitchenTabs', { screen: 'KitchenMenu' })}
          />
          <QuickAction
            icon={<Megaphone size={20} color={theme.colors.brand.primary} />}
            label="Promote a Reel"
            onPress={() => navigation.navigate('AdsCampaigns')}
          />
          <QuickAction
            icon={<Users size={20} color={theme.colors.brand.primary} />}
            label="Subscribers"
            onPress={() => navigation.navigate('Subscribers')}
          />
          <QuickAction
            icon={<Wallet size={20} color={theme.colors.brand.primary} />}
            label="Wallet"
            onPress={() => navigation.navigate('Wallet')}
          />
        </View>

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
              onPress={() => navigation.navigate('Payouts')}
            />
            <StatCard
              icon={<Star size={16} color={theme.colors.brand.primary} />}
              label="Rating"
              value={summary.allTime.rating ? summary.allTime.rating.toFixed(1) : '—'}
            />
          </View>
        )}

        {summary?.weeklyRevenue?.length ? <WeeklyRevenueChart data={summary.weeklyRevenue} /> : null}

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

function QuickAction({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Card style={styles.quickActionCard} padding="md" onPress={onPress}>
      <View style={styles.quickActionIcon}>{icon}</View>
      <Text style={styles.quickActionLabel} numberOfLines={1}>
        {label}
      </Text>
    </Card>
  );
}

function StatCard({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  onPress?: () => void;
}) {
  return (
    <Card style={styles.statCard} padding="md" onPress={onPress}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

/** Fed by `DashboardSummary.weeklyRevenue` — 7 entries, oldest to newest. */
function WeeklyRevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  const chartData = data.map((entry) => ({
    value: entry.revenue,
    label: new Date(entry.date).toLocaleDateString('en-IN', { weekday: 'short' }),
  }));
  const totalRevenue = data.reduce((sum, entry) => sum + entry.revenue, 0);

  return (
    <Card style={styles.chartCard}>
      <View style={styles.chartHeaderRow}>
        <Text style={styles.sectionLabel}>WEEKLY REVENUE</Text>
        <Text style={styles.chartTotal}>{`₹${totalRevenue.toLocaleString('en-IN')}`}</Text>
      </View>
      <LineChart
        data={chartData}
        height={140}
        thickness={3}
        color={theme.colors.brand.primary}
        dataPointsColor={theme.colors.brand.primary}
        startFillColor={theme.colors.gradients.brand[0]}
        endFillColor={theme.colors.gradients.brand[2]}
        startOpacity={0.22}
        endOpacity={0.02}
        areaChart
        curved
        hideRules
        hideYAxisText
        xAxisColor={theme.colors.borders.subtle}
        xAxisLabelTextStyle={styles.chartAxisLabel}
        noOfSections={3}
        spacing={40}
        initialSpacing={12}
        endSpacing={8}
        adjustToWidth
      />
    </Card>
  );
}

export default KitchenDashboard;

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.paddings.sm,
  },
  topBarActions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.xs },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral[100],
  },
  topBarButtonPressed: { opacity: 0.75 },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.state.error,
    borderWidth: 1.5,
    borderColor: theme.colors.surface.base,
  },
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl, paddingTop: theme.spacing.paddings.sm },
  banner: { borderRadius: theme.radius.card, padding: theme.spacing.paddings.lg, marginBottom: theme.spacing.paddings.md },
  bannerGreeting: { ...theme.text.bodySmall, color: 'rgba(255,255,255,0.85)' },
  bannerName: { ...theme.text.h2, color: theme.colors.palette.white, marginTop: 2 },
  bannerDate: { ...theme.text.bodySmall, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  statusBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.paddings.xs, marginTop: theme.spacing.paddings.sm },
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
  quickActionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.paddings.sm, marginBottom: theme.spacing.paddings.md },
  quickActionCard: { width: '31%', alignItems: 'center' },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.brand.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.paddings.xs,
  },
  quickActionLabel: { ...theme.text.caption, color: theme.colors.text.primary, fontWeight: '700' as const, textAlign: 'center' },
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
  chartCard: { marginBottom: theme.spacing.paddings.md },
  chartHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.paddings.sm },
  chartTotal: { ...theme.text.h4, color: theme.colors.text.primary },
  chartAxisLabel: { color: theme.colors.text.tertiary, fontSize: 10 },
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
