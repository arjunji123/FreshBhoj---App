import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Clapperboard,
  Eye,
  IndianRupee,
  Megaphone,
  MousePointerClick,
  Pause,
  Play,
  Square,
  TrendingUp,
  TriangleAlert,
  Wallet,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, Badge, Button, Card, Chip, ChipRow, EmptyState, Screen, Sheet, Skeleton, Text } from '@components/ui';
import type { SheetHandle } from '@components/ui';
import type { BadgeTone } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import {
  useCampaignEstimate,
  useCampaigns,
  useCreateCampaign,
  useKitchenReels,
  usePauseCampaign,
  useResumeCampaign,
  useStopCampaign,
  useWalletSummary,
} from '../hooks/useKitchenPortal';
import type { Campaign, CampaignStatus, KitchenReel } from '../kitchenPartner.types';

const MIN_DAILY_BUDGET_RS = 50;
const MAX_DAILY_BUDGET_RS = 2000;
const DEFAULT_DAILY_BUDGET_RS = 200;
const MIN_DURATION_DAYS = 1;
const MAX_DURATION_DAYS = 30;
const DEFAULT_DURATION_DAYS = 7;

type FilterTab = 'ALL' | CampaignStatus;

const FILTER_LABEL: Record<FilterTab, string> = {
  ALL: 'All',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  ENDED: 'Ended',
};

const STATUS_TONE: Record<CampaignStatus, BadgeTone> = {
  ACTIVE: 'accent',
  PAUSED: 'warning',
  ENDED: 'neutral',
};

function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

const AdsCampaigns = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const [tab, setTab] = useState<FilterTab>('ALL');
  const query = useCampaigns(tab === 'ALL' ? undefined : tab);
  const pauseCampaign = usePauseCampaign();
  const resumeCampaign = useResumeCampaign();
  const stopCampaign = useStopCampaign();

  const createSheetRef = useRef<SheetHandle>(null);

  const handlePause = (campaign: Campaign) => {
    pauseCampaign.mutate(campaign.id, {
      onError: (error) => Alert.alert('Could not pause campaign', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  const handleResume = (campaign: Campaign) => {
    resumeCampaign.mutate(campaign.id, {
      onError: (error) => Alert.alert('Could not resume campaign', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  const handleStop = (campaign: Campaign) => {
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
      <AppBar title="Promote Reels" onBack={() => navigation.goBack()} />

      <View style={styles.header}>
        <Button
          title="Promote a Reel"
          leftIcon={<Megaphone size={16} color={theme.colors.palette.white} />}
          size="sm"
          fullWidth={false}
          onPress={() => createSheetRef.current?.open()}
        />
      </View>

      <ChipRow style={styles.tabRow}>
        {(Object.keys(FILTER_LABEL) as FilterTab[]).map((key) => (
          <Chip key={key} label={FILTER_LABEL[key]} selected={tab === key} onPress={() => setTab(key)} />
        ))}
      </ChipRow>

      {query.isLoading ? (
        <View style={styles.listPadding}>
          {[0, 1].map((i) => (
            <Skeleton key={i} height={170} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.sm }} />
          ))}
        </View>
      ) : query.isError ? (
        <View style={styles.emptyPadding}>
          <EmptyState title="Something went wrong" description="We couldn't load your campaigns." actionLabel="Retry" onAction={() => query.refetch()} />
        </View>
      ) : (
        <FlatList
          data={query.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={query.data?.length ? styles.listPadding : styles.emptyPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.colors.primary[600]} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Megaphone size={28} color={theme.colors.text.tertiary} />}
              title="No campaigns yet"
              description="Promote a published reel to reach more customers nearby."
              actionLabel="Promote a Reel"
              onAction={() => createSheetRef.current?.open()}
            />
          }
          renderItem={({ item }) => (
            <CampaignRow
              campaign={item}
              onPress={() => navigation.navigate('AdsCampaignDetail', { campaignId: item.id })}
              onPause={() => handlePause(item)}
              onResume={() => handleResume(item)}
              onStop={() => handleStop(item)}
              isBusy={
                (pauseCampaign.isPending && pauseCampaign.variables === item.id) ||
                (resumeCampaign.isPending && resumeCampaign.variables === item.id) ||
                (stopCampaign.isPending && stopCampaign.variables === item.id)
              }
            />
          )}
        />
      )}

      <CreateCampaignSheet sheetRef={createSheetRef} />
    </Screen>
  );
};

function CampaignRow({
  campaign,
  onPress,
  onPause,
  onResume,
  onStop,
  isBusy,
}: {
  campaign: Campaign;
  onPress: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  isBusy: boolean;
}) {
  return (
    <Card style={styles.campaignCard} onPress={onPress}>
      <View style={styles.campaignTopRow}>
        {campaign.reel?.thumbnailUrl ? (
          <Image source={{ uri: campaign.reel.thumbnailUrl }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <Clapperboard size={20} color={theme.colors.text.tertiary} />
          </View>
        )}
        <View style={styles.campaignInfo}>
          <Text variant="bodyMedium" numberOfLines={2}>
            {campaign.reel?.caption || 'Untitled reel'}
          </Text>
          <Text variant="caption" color="tertiary" style={styles.budgetLine}>
            {formatRupees(campaign.dailyBudgetRs)}/day{campaign.endDate ? ` · ends ${new Date(campaign.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ' · runs indefinitely'}
          </Text>
        </View>
        <Badge label={campaign.status} tone={STATUS_TONE[campaign.status]} size="sm" />
      </View>

      <View style={styles.statsRow}>
        <StatChip icon={<IndianRupee size={12} color={theme.colors.text.tertiary} />} label="Spend" value={formatRupees(campaign.spendRs)} />
        <StatChip icon={<Eye size={12} color={theme.colors.text.tertiary} />} label="Impressions" value={campaign.impressions.toLocaleString('en-IN')} />
        <StatChip icon={<MousePointerClick size={12} color={theme.colors.text.tertiary} />} label="CTR" value={`${campaign.ctr.toFixed(1)}%`} />
        <StatChip icon={<TrendingUp size={12} color={theme.colors.text.tertiary} />} label="ROI" value={`${campaign.roi.toFixed(1)}×`} />
      </View>

      {campaign.status !== 'ENDED' ? (
        <View style={styles.actionsRow}>
          {campaign.status === 'ACTIVE' ? (
            <TouchableOpacity onPress={onPause} disabled={isBusy} style={styles.actionButton}>
              <Pause size={13} color={theme.colors.text.secondary} />
              <Text variant="caption" color="secondary" style={styles.actionLabel}>
                Pause
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onResume} disabled={isBusy} style={styles.actionButton}>
              <Play size={13} color={theme.colors.brand.primary} />
              <Text variant="caption" color="brand" style={styles.actionLabel}>
                Resume
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onStop} disabled={isBusy} style={styles.actionButton}>
            <Square size={13} color={theme.colors.state.error} />
            <Text variant="caption" style={[styles.actionLabel, { color: theme.colors.state.error }]}>
              Stop
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </Card>
  );
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.statChip}>
      <View style={styles.statChipHeader}>
        {icon}
        <Text variant="caption" color="tertiary">
          {label}
        </Text>
      </View>
      <Text variant="label">{value}</Text>
    </View>
  );
}

function CreateCampaignSheet({ sheetRef }: { sheetRef: React.RefObject<SheetHandle | null> }) {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const reels = useKitchenReels();
  const activeCampaigns = useCampaigns('ACTIVE');
  const createCampaign = useCreateCampaign();
  const wallet = useWalletSummary();

  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [dailyBudgetRs, setDailyBudgetRs] = useState(DEFAULT_DAILY_BUDGET_RS);
  const [durationDays, setDurationDays] = useState(DEFAULT_DURATION_DAYS);
  const [debouncedBudget, setDebouncedBudget] = useState<number | null>(DEFAULT_DAILY_BUDGET_RS);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBudget(dailyBudgetRs), 400);
    return () => clearTimeout(timer);
  }, [dailyBudgetRs]);

  const estimate = useCampaignEstimate(debouncedBudget);

  const activeReelIds = useMemo(
    () => new Set((activeCampaigns.data ?? []).map((c) => c.reelId)),
    [activeCampaigns.data],
  );
  const eligibleReels = useMemo(
    () => (reels.data ?? []).filter((reel) => reel.status === 'PUBLISHED' && !reel.isPaused && !activeReelIds.has(reel.id)),
    [reels.data, activeReelIds],
  );

  const totalCostRs = dailyBudgetRs * durationDays;
  const insufficientBalance = !!wallet.data && wallet.data.balanceRs < totalCostRs;

  const reset = () => {
    setSelectedReelId(null);
    setDailyBudgetRs(DEFAULT_DAILY_BUDGET_RS);
    setDurationDays(DEFAULT_DURATION_DAYS);
    setDebouncedBudget(DEFAULT_DAILY_BUDGET_RS);
  };

  const canSubmit = !!selectedReelId && !insufficientBalance;

  const handleSubmit = () => {
    if (!selectedReelId) return;

    createCampaign.mutate(
      { reelId: selectedReelId, dailyBudgetRs, durationDays },
      {
        onSuccess: () => {
          reset();
          sheetRef.current?.close();
        },
        onError: (error) =>
          Alert.alert('Could not start boost', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  return (
    <Sheet ref={sheetRef} title="Promote a Reel" heightRatio={0.92} onClose={reset}>
      <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text variant="overline" color="tertiary" style={styles.sheetLabel}>
          CHOOSE A REEL
        </Text>
        {reels.isLoading ? (
          <Skeleton height={72} radius={theme.radius.card} />
        ) : eligibleReels.length === 0 ? (
          <Text variant="bodySmall" color="secondary">
            Publish a reel first — only live, unpaused reels can be promoted.
          </Text>
        ) : (
          <View style={styles.reelList}>
            {eligibleReels.map((reel) => (
              <ReelPickerRow key={reel.id} reel={reel} selected={selectedReelId === reel.id} onPress={() => setSelectedReelId(reel.id)} />
            ))}
          </View>
        )}

        <Text variant="overline" color="tertiary" style={[styles.sheetLabel, styles.sheetSectionGap]}>
          DAILY BUDGET
        </Text>
        <View style={styles.sliderCard}>
          <Slider
            style={styles.slider}
            minimumValue={MIN_DAILY_BUDGET_RS}
            maximumValue={MAX_DAILY_BUDGET_RS}
            step={50}
            value={dailyBudgetRs}
            onValueChange={setDailyBudgetRs}
            minimumTrackTintColor={theme.colors.brand.primary}
            maximumTrackTintColor={theme.colors.neutral[200]}
            thumbTintColor={theme.colors.brand.primary}
          />
          <Text variant="bodyMedium" style={styles.sliderValue}>
            {formatRupees(dailyBudgetRs)}
          </Text>
        </View>
        <Text variant="caption" color="tertiary" style={styles.helperText}>
          {estimate.isFetching
            ? 'Estimating reach…'
            : estimate.data
            ? `Estimated reach: ${estimate.data.min.toLocaleString('en-IN')}–${estimate.data.max.toLocaleString('en-IN')} people/day`
            : 'Estimated reach for this budget'}
        </Text>

        <Text variant="overline" color="tertiary" style={[styles.sheetLabel, styles.sheetSectionGap]}>
          DURATION
        </Text>
        <View style={styles.sliderCard}>
          <Slider
            style={styles.slider}
            minimumValue={MIN_DURATION_DAYS}
            maximumValue={MAX_DURATION_DAYS}
            step={1}
            value={durationDays}
            onValueChange={setDurationDays}
            minimumTrackTintColor={theme.colors.brand.primary}
            maximumTrackTintColor={theme.colors.neutral[200]}
            thumbTintColor={theme.colors.brand.primary}
          />
          <Text variant="bodyMedium" style={styles.sliderValue}>
            {durationDays}d
          </Text>
        </View>

        <Card style={styles.sheetSectionGap} padding="md">
          <View style={styles.walletRow}>
            <View style={styles.walletRowLeft}>
              <Wallet size={14} color={theme.colors.text.tertiary} />
              <Text variant="bodySmall" color="secondary">
                Wallet Balance
              </Text>
            </View>
            <Text variant="bodyMedium">{wallet.data ? formatRupees(wallet.data.balanceRs) : '—'}</Text>
          </View>
          <View style={[styles.walletRow, styles.walletRowLast]}>
            <Text variant="bodySmall" color="secondary">
              Total Cost
            </Text>
            <Text variant="bodyMedium" style={insufficientBalance ? styles.costDanger : undefined}>
              {formatRupees(totalCostRs)}
            </Text>
          </View>
          {insufficientBalance ? (
            <View style={styles.insufficientWrap}>
              <TriangleAlert size={13} color={theme.colors.state.error} />
              <Text variant="caption" style={styles.insufficientText}>
                Not enough balance to boost this reel.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  sheetRef.current?.close();
                  navigation.navigate('Wallet');
                }}
              >
                <Text variant="caption" color="brand" style={styles.insufficientLink}>
                  Add Money
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </Card>

        <Button
          title={createCampaign.isPending ? 'Starting…' : 'Confirm & Boost Now'}
          onPress={handleSubmit}
          loading={createCampaign.isPending}
          disabled={!canSubmit || createCampaign.isPending}
          style={styles.sheetSubmit}
        />
      </ScrollView>
    </Sheet>
  );
}

function ReelPickerRow({ reel, selected, onPress }: { reel: KitchenReel; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.reelPickerRow, selected ? styles.reelPickerRowSelected : null]}>
      {reel.thumbnailUrl ? (
        <Image source={{ uri: reel.thumbnailUrl }} style={styles.reelPickerThumb} />
      ) : (
        <View style={[styles.reelPickerThumb, styles.thumbFallback]}>
          <Clapperboard size={16} color={theme.colors.text.tertiary} />
        </View>
      )}
      <Text variant="bodySmall" style={styles.reelPickerCaption} numberOfLines={2}>
        {reel.caption || 'Untitled reel'}
      </Text>
    </TouchableOpacity>
  );
}

export default AdsCampaigns;

const styles = StyleSheet.create({
  header: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.sm },
  tabRow: { marginBottom: theme.spacing.paddings.sm },
  listPadding: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl },
  emptyPadding: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.layout.screenPadding },
  campaignCard: { marginBottom: theme.spacing.paddings.sm },
  campaignTopRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm },
  thumb: { width: 56, height: 56, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.subtle },
  thumbFallback: { alignItems: 'center', justifyContent: 'center' },
  campaignInfo: { flex: 1 },
  budgetLine: { marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.paddings.sm,
    marginTop: theme.spacing.paddings.md,
    paddingTop: theme.spacing.paddings.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  statChip: { width: '46%' },
  statChipHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.paddings.lg,
    marginTop: theme.spacing.paddings.sm,
    paddingTop: theme.spacing.paddings.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionLabel: { fontWeight: '700' as const },
  sheetContent: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl },
  sheetLabel: { marginBottom: theme.spacing.paddings.sm },
  sheetSectionGap: { marginTop: theme.spacing.paddings.lg },
  reelList: { gap: theme.spacing.paddings.xs },
  sliderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.paddings.md,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.radius.card,
    paddingHorizontal: theme.spacing.paddings.md,
    paddingVertical: theme.spacing.paddings.sm,
  },
  slider: { flex: 1 },
  sliderValue: { fontWeight: '700' as const, width: 64, textAlign: 'right' },
  helperText: { marginTop: theme.spacing.paddings.xs },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.paddings.xs,
    marginBottom: theme.spacing.paddings.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borders.subtle,
  },
  walletRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletRowLast: { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
  costDanger: { color: theme.colors.state.error },
  insufficientWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: theme.spacing.paddings.sm,
    paddingTop: theme.spacing.paddings.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  insufficientText: { color: theme.colors.state.error, flexShrink: 1 },
  insufficientLink: { fontWeight: '700' as const, textDecorationLine: 'underline' },
  reelPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.paddings.sm,
    padding: theme.spacing.paddings.xs,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
  },
  reelPickerRowSelected: { borderColor: theme.colors.brand.primary, backgroundColor: theme.colors.brand.primarySubtle },
  reelPickerThumb: { width: 44, height: 44, borderRadius: theme.radius.sm, backgroundColor: theme.colors.surface.subtle },
  reelPickerCaption: { flex: 1 },
  sheetSubmit: { marginTop: theme.spacing.paddings.xl },
});
