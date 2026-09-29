import React, { useMemo, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Check,
  Gauge,
  History,
  Sparkles,
  Square,
  SquareCheck,
  TriangleAlert,
  X,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, AppBarAction, Badge, Button, Card, EmptyState, Screen, Sheet, Skeleton, Text } from '@components/ui';
import type { SheetHandle } from '@components/ui';
import type { BadgeTone } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import {
  useApplySuggestion,
  useDismissSuggestion,
  useGenerateSuggestions,
  useSuggestions,
} from '../hooks/useKitchenPortal';
import type { CampaignSuggestion, CampaignSuggestionEffort } from '../kitchenPartner.types';

const MECHANICAL_TYPES = new Set(['BUDGET_INCREASE', 'DELIVERY_RADIUS']);

const EFFORT_TONE: Record<CampaignSuggestionEffort, BadgeTone> = {
  LOW: 'accent',
  MEDIUM: 'warning',
  HIGH: 'danger',
};

function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

const AdsInsights = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const query = useSuggestions({ status: 'NEW', page: 1 });
  const generateSuggestions = useGenerateSuggestions();
  const applySuggestion = useApplySuggestion();
  const dismissSuggestion = useDismissSuggestion();

  const [generateError, setGenerateError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const compareSheetRef = useRef<SheetHandle>(null);

  const items = useMemo(() => query.data?.items ?? [], [query.data]);
  const hasSuggestions = items.length > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedSuggestions = useMemo(() => items.filter((item) => selectedIds.has(item.id)), [items, selectedIds]);

  const handleGenerate = () => {
    setGenerateError(null);
    generateSuggestions.mutate(undefined, {
      onError: (error) => {
        setGenerateError(error instanceof KitchenApiError ? error.message : 'Something went wrong. Please try again.');
      },
    });
  };

  const handleApply = (suggestion: CampaignSuggestion) => {
    applySuggestion.mutate(suggestion.id, {
      onError: (error) =>
        Alert.alert('Could not apply suggestion', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  const handleDismiss = (suggestion: CampaignSuggestion) => {
    dismissSuggestion.mutate(suggestion.id, {
      onError: (error) =>
        Alert.alert('Could not dismiss suggestion', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  return (
    <Screen background="page">
      <AppBar
        title="AI Insights"
        onBack={() => navigation.goBack()}
        right={
          <AppBarAction accessibilityLabel="Suggestion history" onPress={() => navigation.navigate('SuggestionHistory')}>
            <History size={18} color={theme.colors.text.primary} />
          </AppBarAction>
        }
      />

      <View style={styles.header}>
        <Text variant="overline" color="tertiary" style={styles.headerEyebrow}>
          AI POWERED ANALYSIS
        </Text>
        <Text variant="bodySmall" color="secondary" style={styles.headerSub}>
          Generate AI suggestions to improve the reach, ROI and cuisine targeting of your active campaigns.
        </Text>
        <Button
          title={generateSuggestions.isPending ? 'Generating…' : hasSuggestions ? 'Refresh Suggestions' : 'Generate Suggestions'}
          leftIcon={<Sparkles size={16} color={theme.colors.palette.white} />}
          size="sm"
          fullWidth={false}
          loading={generateSuggestions.isPending}
          onPress={handleGenerate}
        />
      </View>

      {generateError ? (
        <Card style={styles.errorBanner} padding="md">
          <View style={styles.errorRow}>
            <TriangleAlert size={16} color={theme.colors.state.error} />
            <Text variant="bodySmall" style={styles.errorText}>
              {generateError}
            </Text>
          </View>
          <Button title="Try again" variant="outline" size="sm" fullWidth={false} onPress={handleGenerate} style={styles.errorButton} />
        </Card>
      ) : null}

      {selectedIds.size > 0 ? (
        <TouchableOpacity style={styles.compareBar} onPress={() => compareSheetRef.current?.open()}>
          <Gauge size={14} color={theme.colors.brand.primary} />
          <Text variant="label" color="brand" style={styles.compareBarText}>
            Compare {selectedIds.size} suggestion{selectedIds.size > 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      ) : null}

      {query.isLoading ? (
        <View style={styles.listPadding}>
          {[0, 1].map((i) => (
            <Skeleton key={i} height={180} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.sm }} />
          ))}
        </View>
      ) : query.isError ? (
        <View style={styles.emptyPadding}>
          <EmptyState title="Something went wrong" description="We couldn't load your suggestions." actionLabel="Retry" onAction={() => query.refetch()} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={items.length ? styles.listPadding : styles.emptyPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.colors.primary[600]} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Sparkles size={28} color={theme.colors.text.tertiary} />}
              title="No suggestions yet"
              description="Generate AI-powered suggestions for your active campaigns — budget, delivery radius, cuisine targeting and more."
              actionLabel="Generate Suggestions"
              onAction={handleGenerate}
            />
          }
          renderItem={({ item }) => (
            <SuggestionCard
              suggestion={item}
              isSelected={selectedIds.has(item.id)}
              onToggleSelect={() => toggleSelect(item.id)}
              onPress={() => navigation.navigate('SuggestionDetail', { suggestionId: item.id })}
              onApply={() => handleApply(item)}
              onDismiss={() => handleDismiss(item)}
              isBusy={
                (applySuggestion.isPending && applySuggestion.variables === item.id) ||
                (dismissSuggestion.isPending && dismissSuggestion.variables === item.id)
              }
            />
          )}
        />
      )}

      <CompareSheet sheetRef={compareSheetRef} suggestions={selectedSuggestions} />
    </Screen>
  );
};

function ImpactChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.impactChip}>
      <Text variant="caption" color="tertiary">
        {label}
      </Text>
      <Text variant="label" color="brand">
        {value}
      </Text>
    </View>
  );
}

function SuggestionCard({
  suggestion,
  isSelected,
  onToggleSelect,
  onPress,
  onApply,
  onDismiss,
  isBusy,
}: {
  suggestion: CampaignSuggestion;
  isSelected: boolean;
  onToggleSelect: () => void;
  onPress: () => void;
  onApply: () => void;
  onDismiss: () => void;
  isBusy: boolean;
}) {
  const isMechanical = MECHANICAL_TYPES.has(suggestion.type);
  const primaryLabel = isMechanical ? 'Apply Suggestion' : 'Acknowledge';
  const { impact } = suggestion;

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onToggleSelect} hitSlop={theme.layout.hitSlop} style={styles.checkbox}>
          {isSelected ? (
            <SquareCheck size={20} color={theme.colors.brand.primary} />
          ) : (
            <Square size={20} color={theme.colors.text.tertiary} />
          )}
        </TouchableOpacity>
        <View style={styles.cardInfo}>
          <Text variant="bodyMedium" numberOfLines={2}>
            {suggestion.title}
          </Text>
          <Text variant="caption" color="secondary" numberOfLines={2} style={styles.cardDescription}>
            {suggestion.description}
          </Text>
        </View>
        <Badge label={impact.effort} tone={EFFORT_TONE[impact.effort]} size="sm" />
      </View>

      <View style={styles.impactRow}>
        {impact.reachDeltaPct != null ? <ImpactChip label="Reach" value={`+${impact.reachDeltaPct}%`} /> : null}
        {impact.ordersDeltaPct != null ? <ImpactChip label="Orders" value={`+${impact.ordersDeltaPct}%`} /> : null}
        {impact.roiDeltaPct != null ? <ImpactChip label="ROI" value={`+${impact.roiDeltaPct}%`} /> : null}
        {impact.costRs > 0 ? <ImpactChip label="Cost" value={formatRupees(impact.costRs)} /> : null}
      </View>

      {suggestion.status === 'NEW' ? (
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={onApply} disabled={isBusy} style={styles.actionButton}>
            <Check size={13} color={theme.colors.brand.primary} />
            <Text variant="label" color="brand">
              {primaryLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDismiss} disabled={isBusy} style={styles.actionButton}>
            <X size={13} color={theme.colors.state.error} />
            <Text variant="label" style={styles.dismissLabel}>
              Dismiss
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </Card>
  );
}

function CompareSheet({
  sheetRef,
  suggestions,
}: {
  sheetRef: React.RefObject<SheetHandle | null>;
  suggestions: CampaignSuggestion[];
}) {
  return (
    <Sheet ref={sheetRef} title="Compare Suggestions" heightRatio={0.8}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compareScroll}>
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} style={styles.compareCard} padding="md">
            <Badge label={suggestion.type.replace(/_/g, ' ')} tone="brand" size="sm" style={styles.compareTypeBadge} />
            <Text variant="bodyMedium" numberOfLines={3} style={styles.compareTitle}>
              {suggestion.title}
            </Text>
            <CompareRow label="Effort" value={suggestion.impact.effort} />
            <CompareRow label="Reach" value={suggestion.impact.reachDeltaPct != null ? `+${suggestion.impact.reachDeltaPct}%` : '—'} />
            <CompareRow label="Orders" value={suggestion.impact.ordersDeltaPct != null ? `+${suggestion.impact.ordersDeltaPct}%` : '—'} />
            <CompareRow label="ROI" value={suggestion.impact.roiDeltaPct != null ? `+${suggestion.impact.roiDeltaPct}%` : '—'} />
            <CompareRow label="Expected orders" value={suggestion.impact.expectedOrders != null ? String(suggestion.impact.expectedOrders) : '—'} />
            <CompareRow label="Cost" value={formatRupees(suggestion.impact.costRs)} />
          </Card>
        ))}
      </ScrollView>
    </Sheet>
  );
}

function CompareRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.compareRow}>
      <Text variant="caption" color="tertiary">
        {label}
      </Text>
      <Text variant="label">{value}</Text>
    </View>
  );
}

export default AdsInsights;

const styles = StyleSheet.create({
  header: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.md },
  headerEyebrow: { marginBottom: theme.spacing.paddings.xs },
  headerSub: { marginBottom: theme.spacing.paddings.md },
  errorBanner: {
    marginHorizontal: theme.layout.screenPadding,
    marginBottom: theme.spacing.paddings.md,
    backgroundColor: theme.colors.state.errorBg,
  },
  errorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.paddings.xs },
  errorText: { color: theme.colors.state.error, flex: 1 },
  errorButton: { marginTop: theme.spacing.paddings.sm, alignSelf: 'flex-start' },
  compareBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: theme.layout.screenPadding,
    marginBottom: theme.spacing.paddings.md,
    paddingHorizontal: theme.spacing.paddings.md,
    paddingVertical: theme.spacing.paddings.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brand.primarySubtle,
    alignSelf: 'flex-start',
  },
  compareBarText: { fontWeight: '700' as const },
  listPadding: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl },
  emptyPadding: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.layout.screenPadding },
  card: { marginBottom: theme.spacing.paddings.sm },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.paddings.sm },
  checkbox: { paddingTop: 2 },
  cardInfo: { flex: 1 },
  cardDescription: { marginTop: 2 },
  impactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.paddings.md,
    marginTop: theme.spacing.paddings.md,
    paddingTop: theme.spacing.paddings.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  impactChip: { minWidth: 64 },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.paddings.lg,
    marginTop: theme.spacing.paddings.sm,
    paddingTop: theme.spacing.paddings.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dismissLabel: { color: theme.colors.state.error },
  compareScroll: { paddingHorizontal: theme.layout.screenPadding, gap: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.xxl },
  compareCard: { width: 200 },
  compareTypeBadge: { marginBottom: theme.spacing.paddings.sm },
  compareTitle: { marginBottom: theme.spacing.paddings.sm },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
});
