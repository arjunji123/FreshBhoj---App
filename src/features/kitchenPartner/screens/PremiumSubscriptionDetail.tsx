import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, Check, Crown, RefreshCw, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, Badge, Button, Card, EmptyState, Screen, Skeleton, Text } from '@components/ui';
import type { BadgeTone } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { usePremiumSubscription } from '../hooks/useKitchenPortal';
import type { PremiumFeatures, PremiumSubscriptionStatus } from '../kitchenPartner.types';

const TIER_LABEL: Record<string, string> = {
  BASIC: 'Basic',
  PRO: 'Pro',
  ELITE: 'Elite',
};

const STATUS_TONE: Record<PremiumSubscriptionStatus, BadgeTone> = {
  ACTIVE: 'accent',
  EXPIRED: 'danger',
  NONE: 'neutral',
};

const FEATURE_ROWS: { key: keyof PremiumFeatures; label: string }[] = [
  { key: 'reelsPerMonth', label: 'Reels per month' },
  { key: 'advancedAnalytics', label: 'Advanced analytics' },
  { key: 'priorityBoostMultiplier', label: 'Priority boost multiplier' },
  { key: 'aiVideoEditing', label: 'AI video editing tools' },
  { key: 'sponsoredProfile', label: 'Sponsored profile placement' },
  { key: 'aiMenuInsights', label: 'AI menu insights' },
  { key: 'prioritySupport', label: 'Priority support' },
  { key: 'verifiedBadge', label: 'Verified badge' },
  { key: 'dedicatedGrowthManager', label: 'Dedicated growth manager' },
];

function featureRowState(key: keyof PremiumFeatures, features: PremiumFeatures): { active: boolean; text: string | null } {
  const value = features[key];
  if (key === 'reelsPerMonth') {
    return { active: true, text: value == null ? 'Unlimited' : `${value}/month` };
  }
  if (key === 'priorityBoostMultiplier') {
    const multiplier = value as number;
    return { active: multiplier > 1, text: `${multiplier}×` };
  }
  return { active: !!value, text: null };
}

function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

const PremiumSubscriptionDetail = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const subscription = usePremiumSubscription();

  // Never purchased — point straight at the pricing screen instead of
  // showing an empty state here.
  useEffect(() => {
    if (subscription.data?.status === 'NONE') {
      navigation.replace('PremiumPlans');
    }
  }, [subscription.data?.status, navigation]);

  const data = subscription.data;

  return (
    <Screen background="page">
      <AppBar title="My Premium Plan" onBack={() => navigation.goBack()} />

      {subscription.isLoading || (data && data.status === 'NONE') ? (
        <View style={styles.scroll}>
          <Skeleton height={140} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.md }} />
          <Skeleton height={220} radius={theme.radius.card} />
        </View>
      ) : subscription.isError || !data ? (
        <EmptyState title="Something went wrong" description="We couldn't load your subscription." actionLabel="Retry" onAction={() => subscription.refetch()} />
      ) : (
        <View style={styles.scroll}>
          <Card style={styles.planCard}>
            <View style={styles.planTopRow}>
              <View style={styles.planTitleRow}>
                <Crown size={20} color={theme.colors.brand.primary} />
                <Text variant="h3">{data.tier ? TIER_LABEL[data.tier] : '—'} Plan</Text>
              </View>
              <Badge label={data.status} tone={STATUS_TONE[data.status]} size="sm" />
            </View>
            {data.priceRs != null ? (
              <Text variant="bodySmall" color="secondary" style={styles.priceLine}>
                {formatRupees(data.priceRs)} / 28 days
              </Text>
            ) : null}

            <View style={styles.renewalRow}>
              <Calendar size={13} color={theme.colors.text.tertiary} />
              <Text variant="bodySmall" color="secondary">
                {data.currentPeriodEnd
                  ? `Renews ${new Date(data.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : 'No renewal scheduled'}
              </Text>
            </View>
            <View style={styles.renewalRow}>
              <RefreshCw size={13} color={theme.colors.text.tertiary} />
              <Text variant="bodySmall" color="secondary">
                Auto-renew: {data.autoRenew ? 'On' : 'Off'}
              </Text>
            </View>
          </Card>

          <Text variant="overline" color="tertiary" style={styles.sectionLabel}>
            FEATURES
          </Text>
          <Card style={styles.featureCard}>
            {FEATURE_ROWS.map(({ key, label }, index) => {
              const { active, text } = featureRowState(key, data.features);
              return (
                <View key={key} style={[styles.featureRow, index === FEATURE_ROWS.length - 1 ? styles.featureRowLast : null]}>
                  <Text variant="bodySmall" style={styles.featureLabel}>
                    {label}
                    {text ? ` — ${text}` : ''}
                  </Text>
                  <Badge
                    label={active ? 'Active' : 'Inactive'}
                    tone={active ? 'accent' : 'neutral'}
                    size="sm"
                    icon={active ? <Check size={11} color={theme.colors.accent[700]} /> : <X size={11} color={theme.colors.neutral[600]} />}
                  />
                </View>
              );
            })}
          </Card>

          <Button title="Upgrade Subscription" onPress={() => navigation.navigate('PremiumPlans')} />
        </View>
      )}
    </Screen>
  );
};

export default PremiumSubscriptionDetail;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.xxl },
  planCard: { marginBottom: theme.spacing.paddings.md },
  planTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.xs },
  priceLine: { marginTop: 4 },
  renewalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: theme.spacing.paddings.sm,
    paddingTop: theme.spacing.paddings.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  sectionLabel: { marginBottom: theme.spacing.paddings.sm },
  featureCard: { marginBottom: theme.spacing.paddings.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.paddings.sm,
    marginBottom: theme.spacing.paddings.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borders.subtle,
  },
  featureRowLast: { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
  featureLabel: { flex: 1, marginRight: theme.spacing.paddings.sm },
});
