import React from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Clapperboard, Eye, IndianRupee, MousePointerClick, Pause, Play, ShoppingBag, Square, TrendingUp, Users } from 'lucide-react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, Badge, Card, EmptyState, Screen, Skeleton, Text } from '@components/ui';
import type { BadgeTone } from '@components/ui';
import type { KitchenPartnerNavigation, KitchenPartnerStackParamList } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useCampaignDetail, usePauseCampaign, useResumeCampaign, useStopCampaign } from '../hooks/useKitchenPortal';
import type { CampaignStatus } from '../kitchenPartner.types';

type AdsCampaignDetailRoute = RouteProp<KitchenPartnerStackParamList, 'AdsCampaignDetail'>;

const STATUS_TONE: Record<CampaignStatus, BadgeTone> = {
  ACTIVE: 'accent',
  PAUSED: 'warning',
  ENDED: 'neutral',
};

function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

const AdsCampaignDetail = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const route = useRoute<AdsCampaignDetailRoute>();
  const { campaignId } = route.params;

  const query = useCampaignDetail(campaignId);
  const pauseCampaign = usePauseCampaign();
  const resumeCampaign = useResumeCampaign();
  const stopCampaign = useStopCampaign();

  const campaign = query.data;
  const isBusy = pauseCampaign.isPending || resumeCampaign.isPending || stopCampaign.isPending;

  const handlePause = () => {
    if (!campaign) return;
    pauseCampaign.mutate(campaign.id, {
      onError: (error) => Alert.alert('Could not pause campaign', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  const handleResume = () => {
    if (!campaign) return;
    resumeCampaign.mutate(campaign.id, {
      onError: (error) => Alert.alert('Could not resume campaign', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  const handleStop = () => {
    if (!campaign) return;
    Alert.alert('Stop this campaign?', 'This ends promotion for good — you can start a new campaign on this reel later.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Stop campaign',
        style: 'destructive',
        onPress: () =>
          stopCampaign.mutate(campaign.id, {
            onError: (error) => Alert.alert('Could not stop campaign', error instanceof KitchenApiError ? error.message : 'Please try again.'),
          }),
      },
    ]);
  };

  return (
    <Screen background="page">
      <AppBar title="Campaign" onBack={() => navigation.goBack()} />

      {query.isLoading ? (
        <View style={styles.scroll}>
          <Skeleton height={140} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.md }} />
          <Skeleton height={200} radius={theme.radius.card} />
        </View>
      ) : query.isError || !campaign ? (
        <EmptyState title="Something went wrong" description="We couldn't load this campaign." actionLabel="Retry" onAction={() => query.refetch()} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.colors.primary[600]} />}
        >
          <Card style={styles.headerCard}>
            <View style={styles.headerRow}>
              {campaign.reel?.thumbnailUrl ? (
                <Image source={{ uri: campaign.reel.thumbnailUrl }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbFallback]}>
                  <Clapperboard size={22} color={theme.colors.text.tertiary} />
                </View>
              )}
              <View style={styles.headerInfo}>
                <Text variant="bodyMedium" numberOfLines={2}>
                  {campaign.reel?.caption || 'Untitled reel'}
                </Text>
                <Text variant="caption" color="tertiary" style={styles.budgetLine}>
                  {formatRupees(campaign.dailyBudgetRs)}/day
                  {campaign.endDate
                    ? ` · ends ${new Date(campaign.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                    : ' · runs indefinitely'}
                </Text>
              </View>
              <Badge label={campaign.status} tone={STATUS_TONE[campaign.status]} size="sm" />
            </View>

            {campaign.status !== 'ENDED' ? (
              <View style={styles.actionsRow}>
                {campaign.status === 'ACTIVE' ? (
                  <TouchableOpacity onPress={handlePause} disabled={isBusy} style={styles.actionButton}>
                    <Pause size={14} color={theme.colors.text.secondary} />
                    <Text variant="label" color="secondary">
                      Pause
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleResume} disabled={isBusy} style={styles.actionButton}>
                    <Play size={14} color={theme.colors.brand.primary} />
                    <Text variant="label" color="brand">
                      Resume
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleStop} disabled={isBusy} style={styles.actionButton}>
                  <Square size={14} color={theme.colors.state.error} />
                  <Text variant="label" style={styles.stopLabel}>
                    Stop
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </Card>

          <View style={styles.statsGrid}>
            <StatCard icon={<IndianRupee size={16} color={theme.colors.brand.primary} />} label="Total spend" value={formatRupees(campaign.spendRs)} />
            <StatCard icon={<Eye size={16} color={theme.colors.brand.primary} />} label="Impressions" value={campaign.impressions.toLocaleString('en-IN')} />
            <StatCard icon={<MousePointerClick size={16} color={theme.colors.brand.primary} />} label="Clicks" value={campaign.clicks.toLocaleString('en-IN')} />
            <StatCard icon={<TrendingUp size={16} color={theme.colors.brand.primary} />} label="CTR" value={`${campaign.ctr.toFixed(1)}%`} />
            <StatCard icon={<ShoppingBag size={16} color={theme.colors.brand.primary} />} label="Orders" value={campaign.ordersCount} />
            <StatCard icon={<IndianRupee size={16} color={theme.colors.brand.primary} />} label="Revenue" value={formatRupees(campaign.revenueRs)} />
          </View>

          <Card style={styles.roiCard}>
            <View style={styles.roiRow}>
              <View>
                <Text variant="overline" color="tertiary">
                  ROI
                </Text>
                <Text variant="h2">{`${campaign.roi.toFixed(1)}×`}</Text>
              </View>
              <View style={styles.reachInfo}>
                <View style={styles.reachRow}>
                  <Users size={13} color={theme.colors.text.tertiary} />
                  <Text variant="bodySmall" color="secondary">
                    Actual reach: {campaign.actualReach.toLocaleString('en-IN')}
                  </Text>
                </View>
                <Text variant="caption" color="tertiary">
                  Estimated {campaign.estimatedReach.min.toLocaleString('en-IN')}–{campaign.estimatedReach.max.toLocaleString('en-IN')}/day
                </Text>
              </View>
            </View>
          </Card>

          {campaign.dailyStats && campaign.dailyStats.length > 0 ? (
            <Card style={styles.chartCard}>
              <Text variant="overline" color="tertiary" style={styles.chartLabel}>
                DAILY IMPRESSIONS
              </Text>
              <LineChart
                data={campaign.dailyStats.map((stat) => ({
                  value: stat.impressions,
                  label: new Date(stat.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                }))}
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
          ) : null}
        </ScrollView>
      )}
    </Screen>
  );
};

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card style={styles.statCard} padding="md">
      <View style={styles.statIcon}>{icon}</View>
      <Text variant="h4">{value}</Text>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
    </Card>
  );
}

export default AdsCampaignDetail;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.xxl },
  headerCard: { marginBottom: theme.spacing.paddings.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm },
  thumb: { width: 56, height: 56, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.subtle },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  budgetLine: { marginTop: 2 },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.paddings.lg,
    marginTop: theme.spacing.paddings.md,
    paddingTop: theme.spacing.paddings.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stopLabel: { color: theme.colors.state.error },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.paddings.sm, marginBottom: theme.spacing.paddings.md },
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
  roiCard: { marginBottom: theme.spacing.paddings.md },
  roiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reachInfo: { alignItems: 'flex-end', gap: 2 },
  reachRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chartCard: { marginBottom: theme.spacing.paddings.md },
  chartLabel: { marginBottom: theme.spacing.paddings.sm },
  chartAxisLabel: { color: theme.colors.text.tertiary, fontSize: 10 },
});
