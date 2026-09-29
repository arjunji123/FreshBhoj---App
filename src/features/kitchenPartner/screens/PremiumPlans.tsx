import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Check, Crown, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, Badge, Button, Card, EmptyState, Screen, Skeleton, Text } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { usePremiumSubscription, usePremiumTiers, usePurchasePremium } from '../hooks/useKitchenPortal';
import type { PremiumFeatures, PremiumTier, PremiumTierCatalog } from '../kitchenPartner.types';

const TIER_ORDER: PremiumTier[] = ['BASIC', 'PRO', 'ELITE'];

const TIER_LABEL: Record<PremiumTier, string> = {
  BASIC: 'Basic',
  PRO: 'Pro',
  ELITE: 'Elite',
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

const PremiumPlans = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const tiers = usePremiumTiers();
  const subscription = usePremiumSubscription();
  const purchase = usePurchasePremium();

  const sortedTiers = React.useMemo(() => {
    if (!tiers.data) return [];
    const byTier = new Map(tiers.data.map((t) => [t.tier, t]));
    return TIER_ORDER.map((tier) => byTier.get(tier)).filter((t): t is PremiumTierCatalog => !!t);
  }, [tiers.data]);

  const handlePurchase = (tier: PremiumTier) => {
    const isUpgrade = subscription.data?.status === 'ACTIVE';
    Alert.alert(
      isUpgrade ? `Upgrade to ${TIER_LABEL[tier]}?` : `Choose the ${TIER_LABEL[tier]} plan?`,
      "This charges your kitchen wallet immediately.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isUpgrade ? 'Upgrade' : 'Confirm',
          onPress: () =>
            purchase.mutate(tier, {
              onSuccess: () => navigation.navigate('PremiumSubscriptionDetail'),
              onError: (error) =>
                Alert.alert('Could not complete purchase', error instanceof KitchenApiError ? error.message : 'Please try again.'),
            }),
        },
      ],
    );
  };

  return (
    <Screen background="page">
      <AppBar title="Kitchen Premium" onBack={() => navigation.goBack()} />

      {tiers.isLoading ? (
        <View style={styles.scroll}>
          <Skeleton height={280} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.md }} />
          <Skeleton height={280} radius={theme.radius.card} />
        </View>
      ) : tiers.isError ? (
        <EmptyState title="Something went wrong" description="We couldn't load the premium plans." actionLabel="Retry" onAction={() => tiers.refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text variant="bodySmall" color="secondary" style={styles.intro}>
            Unlock more reels, advanced analytics, AI tools and priority boost — billed from your kitchen wallet every 28 days.
          </Text>

          {sortedTiers.map((tierCatalog) => {
            const isCurrent = subscription.data?.status === 'ACTIVE' && subscription.data.tier === tierCatalog.tier;
            const isBusy = purchase.isPending && purchase.variables === tierCatalog.tier;
            return (
              <Card
                key={tierCatalog.tier}
                style={[styles.planCard, tierCatalog.isMostPopular ? styles.planCardPopular : null]}
                padding="lg"
              >
                {tierCatalog.isMostPopular ? <Badge label="MOST POPULAR" tone="brand" variant="solid" size="sm" style={styles.popularBadge} /> : null}

                <View style={styles.planHeaderRow}>
                  <Crown size={20} color={theme.colors.brand.primary} />
                  <Text variant="h3">{TIER_LABEL[tierCatalog.tier]}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text variant="h2">{formatRupees(tierCatalog.priceRs)}</Text>
                  <Text variant="bodySmall" color="secondary">
                    {' '}
                    / 28 days
                  </Text>
                </View>

                <View style={styles.featureList}>
                  {FEATURE_ROWS.map(({ key, label }) => {
                    const { active, text } = featureRowState(key, tierCatalog.features);
                    return (
                      <View key={key} style={styles.featureRow}>
                        {active ? (
                          <Check size={14} color={theme.colors.accent[600]} />
                        ) : (
                          <X size={14} color={theme.colors.text.tertiary} />
                        )}
                        <Text variant="bodySmall" color={active ? 'primary' : 'tertiary'} style={styles.featureLabel}>
                          {label}
                          {text ? ` — ${text}` : ''}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <Button
                  title={isCurrent ? 'Current Plan' : subscription.data?.status === 'ACTIVE' ? `Upgrade to ${TIER_LABEL[tierCatalog.tier]}` : 'Choose Plan'}
                  variant={isCurrent ? 'outline' : 'primary'}
                  disabled={isCurrent || isBusy}
                  loading={isBusy}
                  onPress={() => handlePurchase(tierCatalog.tier)}
                />
              </Card>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
};

export default PremiumPlans;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.xxl },
  intro: { marginBottom: theme.spacing.paddings.md },
  planCard: { marginBottom: theme.spacing.paddings.md },
  planCardPopular: { borderWidth: 2, borderColor: theme.colors.brand.primary },
  popularBadge: { marginBottom: theme.spacing.paddings.sm, alignSelf: 'flex-start' },
  planHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.xs },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 2, marginBottom: theme.spacing.paddings.md },
  featureList: { gap: theme.spacing.paddings.xs, marginBottom: theme.spacing.paddings.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm },
  featureLabel: { flex: 1 },
});
