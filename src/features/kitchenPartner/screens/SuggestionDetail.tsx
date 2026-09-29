import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Check, Gauge, IndianRupee, Radio, Ruler, ShoppingBag, Sparkles, TrendingUp, X } from 'lucide-react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, Badge, Button, Card, EmptyState, Screen, Skeleton, Text } from '@components/ui';
import type { BadgeTone } from '@components/ui';
import type { KitchenPartnerNavigation, KitchenPartnerStackParamList } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useApplySuggestion, useDismissSuggestion, useSuggestionDetail } from '../hooks/useKitchenPortal';
import type { CampaignSuggestionEffort, CampaignSuggestionStatus } from '../kitchenPartner.types';

type SuggestionDetailRoute = RouteProp<KitchenPartnerStackParamList, 'SuggestionDetail'>;

const MECHANICAL_TYPES = new Set(['BUDGET_INCREASE', 'DELIVERY_RADIUS']);

const EFFORT_TONE: Record<CampaignSuggestionEffort, BadgeTone> = {
  LOW: 'accent',
  MEDIUM: 'warning',
  HIGH: 'danger',
};

const STATUS_TONE: Record<CampaignSuggestionStatus, BadgeTone> = {
  NEW: 'brand',
  APPLIED: 'accent',
  DISMISSED: 'neutral',
};

const TYPE_LABEL: Record<string, string> = {
  BUDGET_INCREASE: 'Budget Increase',
  DELIVERY_RADIUS: 'Delivery Radius',
  TARGET_CUISINE: 'Target Cuisine',
  CREATIVE_REFRESH: 'Creative Refresh',
};

function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

const SuggestionDetail = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const route = useRoute<SuggestionDetailRoute>();
  const { suggestionId } = route.params;

  const query = useSuggestionDetail(suggestionId);
  const applySuggestion = useApplySuggestion();
  const dismissSuggestion = useDismissSuggestion();

  const suggestion = query.data;
  const isBusy = applySuggestion.isPending || dismissSuggestion.isPending;

  const handleApply = () => {
    if (!suggestion) return;
    applySuggestion.mutate(suggestion.id, {
      onError: (error) =>
        Alert.alert('Could not apply suggestion', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  const handleDismiss = () => {
    if (!suggestion) return;
    dismissSuggestion.mutate(suggestion.id, {
      onError: (error) =>
        Alert.alert('Could not dismiss suggestion', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  return (
    <Screen background="page">
      <AppBar title={suggestion ? TYPE_LABEL[suggestion.type] ?? 'Suggestion' : 'Suggestion'} onBack={() => navigation.goBack()} />

      {query.isLoading ? (
        <View style={styles.scroll}>
          <Skeleton height={140} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.md }} />
          <Skeleton height={160} radius={theme.radius.card} />
        </View>
      ) : query.isError || !suggestion ? (
        <EmptyState title="Something went wrong" description="We couldn't load this suggestion." actionLabel="Retry" onAction={() => query.refetch()} />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Card style={styles.headerCard}>
              <View style={styles.headerTopRow}>
                <Badge label={TYPE_LABEL[suggestion.type] ?? suggestion.type} tone="brand" size="sm" />
                <Badge label={suggestion.status} tone={STATUS_TONE[suggestion.status]} size="sm" />
              </View>
              <Text variant="h3" style={styles.title}>
                {suggestion.title}
              </Text>
              <Text variant="bodySmall" color="secondary" style={styles.description}>
                {suggestion.description}
              </Text>
              <View style={styles.effortRow}>
                <Text variant="caption" color="tertiary">
                  Effort required
                </Text>
                <Badge label={suggestion.impact.effort} tone={EFFORT_TONE[suggestion.impact.effort]} size="sm" />
              </View>
            </Card>

            <Text variant="overline" color="tertiary" style={styles.sectionLabel}>
              IMPACT BREAKDOWN
            </Text>
            <View style={styles.statsGrid}>
              {suggestion.impact.reachDeltaPct != null ? (
                <StatCard icon={<Radio size={16} color={theme.colors.brand.primary} />} label="Reach" value={`+${suggestion.impact.reachDeltaPct}%`} />
              ) : null}
              {suggestion.impact.ordersDeltaPct != null ? (
                <StatCard icon={<ShoppingBag size={16} color={theme.colors.brand.primary} />} label="Orders" value={`+${suggestion.impact.ordersDeltaPct}%`} />
              ) : null}
              {suggestion.impact.roiDeltaPct != null ? (
                <StatCard icon={<TrendingUp size={16} color={theme.colors.brand.primary} />} label="ROI" value={`+${suggestion.impact.roiDeltaPct}%`} />
              ) : null}
              {suggestion.impact.expectedOrders != null ? (
                <StatCard icon={<Gauge size={16} color={theme.colors.brand.primary} />} label="Expected orders" value={suggestion.impact.expectedOrders} />
              ) : null}
              {suggestion.impact.suggestedDailyBudgetRs != null ? (
                <StatCard
                  icon={<IndianRupee size={16} color={theme.colors.brand.primary} />}
                  label="Suggested daily budget"
                  value={formatRupees(suggestion.impact.suggestedDailyBudgetRs)}
                />
              ) : null}
              {suggestion.impact.suggestedRadiusKm != null ? (
                <StatCard icon={<Ruler size={16} color={theme.colors.brand.primary} />} label="Suggested radius" value={`${suggestion.impact.suggestedRadiusKm} km`} />
              ) : null}
              <StatCard icon={<IndianRupee size={16} color={theme.colors.brand.primary} />} label="Cost" value={formatRupees(suggestion.impact.costRs)} />
            </View>

            <Card style={styles.reasoningCard}>
              <View style={styles.reasoningHeader}>
                <Sparkles size={14} color={theme.colors.brand.primary} />
                <Text variant="overline" color="tertiary">
                  AI REASONING
                </Text>
              </View>
              <Text variant="bodySmall" color="secondary">
                {suggestion.reasoning}
              </Text>
            </Card>

            {suggestion.appliedChanges ? (
              <Card style={styles.appliedCard}>
                <Text variant="overline" color="tertiary" style={styles.sectionLabel}>
                  APPLIED CHANGE
                </Text>
                <View style={styles.appliedRow}>
                  <Text variant="bodySmall" color="secondary">
                    {suggestion.appliedChanges.field}
                  </Text>
                  <View style={styles.appliedValuesRow}>
                    <Text variant="bodyMedium" color="tertiary" style={styles.strikethrough}>
                      {suggestion.appliedChanges.before}
                    </Text>
                    <Text variant="bodyMedium" color="brand">
                      → {suggestion.appliedChanges.after}
                    </Text>
                  </View>
                </View>
              </Card>
            ) : null}
          </ScrollView>

          {suggestion.status === 'NEW' ? (
            <View style={styles.bottomBar}>
              <Button
                title={MECHANICAL_TYPES.has(suggestion.type) ? 'Apply Suggestion' : 'Acknowledge'}
                leftIcon={<Check size={16} color={theme.colors.palette.white} />}
                onPress={handleApply}
                loading={applySuggestion.isPending}
                disabled={isBusy}
                style={styles.bottomButton}
              />
              <Button
                title="Dismiss"
                variant="outline"
                leftIcon={<X size={16} color={theme.colors.text.primary} />}
                onPress={handleDismiss}
                loading={dismissSuggestion.isPending}
                disabled={isBusy}
                style={styles.bottomButton}
              />
            </View>
          ) : null}
        </>
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

export default SuggestionDetail;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.xxl },
  headerCard: { marginBottom: theme.spacing.paddings.md },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { marginTop: theme.spacing.paddings.sm },
  description: { marginTop: theme.spacing.paddings.xs },
  effortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.paddings.md,
    paddingTop: theme.spacing.paddings.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  sectionLabel: { marginBottom: theme.spacing.paddings.sm },
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
  reasoningCard: { marginBottom: theme.spacing.paddings.md },
  reasoningHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: theme.spacing.paddings.sm },
  appliedCard: { marginBottom: theme.spacing.paddings.md },
  appliedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appliedValuesRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  strikethrough: { textDecorationLine: 'line-through' },
  bottomBar: {
    flexDirection: 'row',
    gap: theme.spacing.paddings.sm,
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.paddings.sm,
    paddingBottom: theme.spacing.paddings.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.surface.base,
  },
  bottomButton: { flex: 1 },
});
