import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, Badge, Button, Card, Chip, ChipRow, EmptyState, Input, Screen, Sheet, Skeleton, Text } from '@components/ui';
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
} from '../hooks/useKitchenPortal';
import type { Campaign, CampaignStatus, KitchenReel } from '../kitchenPartner.types';

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
  const reels = useKitchenReels();
  const createCampaign = useCreateCampaign();

  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [endDate, setEndDate] = useState('');
  const [debouncedBudget, setDebouncedBudget] = useState<number | null>(null);

  useEffect(() => {
    const parsed = Number(budgetInput);
    const timer = setTimeout(() => {
      setDebouncedBudget(budgetInput && Number.isFinite(parsed) && parsed > 0 ? parsed : null);
    }, 400);
    return () => clearTimeout(timer);
  }, [budgetInput]);

  const estimate = useCampaignEstimate(debouncedBudget);

  const eligibleReels = useMemo(
    () => (reels.data ?? []).filter((reel) => reel.status === 'PUBLISHED' && !reel.isPaused),
    [reels.data],
  );

  const reset = () => {
    setSelectedReelId(null);
    setBudgetInput('');
    setEndDate('');
    setDebouncedBudget(null);
  };

  const canSubmit = !!selectedReelId && Number(budgetInput) > 0;

  const handleSubmit = () => {
    if (!selectedReelId) return;
    const dailyBudgetRs = Number(budgetInput);
    if (!Number.isFinite(dailyBudgetRs) || dailyBudgetRs <= 0) {
      Alert.alert('Enter a daily budget', 'A daily budget greater than ₹0 is required.');
      return;
    }
    const trimmedEndDate = endDate.trim();
    if (trimmedEndDate && !/^\d{4}-\d{2}-\d{2}$/.test(trimmedEndDate)) {
      Alert.alert('Invalid end date', 'Use the YYYY-MM-DD format, e.g. 2026-12-31.');
      return;
    }

    createCampaign.mutate(
      { reelId: selectedReelId, dailyBudgetRs, endDate: trimmedEndDate || undefined },
      {
        onSuccess: () => {
          reset();
          sheetRef.current?.close();
        },
        onError: (error) =>
          Alert.alert('Could not start campaign', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  return (
    <Sheet ref={sheetRef} title="Promote a Reel" heightRatio={0.88} onClose={reset}>
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
        <Input
          value={budgetInput}
          onChangeText={setBudgetInput}
          placeholder="e.g. 200"
          keyboardType="number-pad"
          prefix="₹"
          helperText={
            estimate.isFetching
              ? 'Estimating reach…'
              : estimate.data
              ? `Estimated reach: ${estimate.data.min.toLocaleString('en-IN')}–${estimate.data.max.toLocaleString('en-IN')} people/day`
              : 'Enter a daily budget to see estimated reach'
          }
        />

        <Text variant="overline" color="tertiary" style={[styles.sheetLabel, styles.sheetSectionGap]}>
          END DATE (OPTIONAL)
        </Text>
        <Input value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD — leave blank to run indefinitely" autoCapitalize="none" />

        <Button
          title={createCampaign.isPending ? 'Starting…' : 'Start campaign'}
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
