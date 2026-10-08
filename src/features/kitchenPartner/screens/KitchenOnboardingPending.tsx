import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Clock3, Rocket, ShieldAlert } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Button, Card, Screen } from '@components/ui';
import { useKitchenAuthStore } from '../store/kitchenAuthStore';
import { useKitchenLogout } from '../hooks/useKitchenAuth';
import { useKitchenOnboardingStatus, useSimulateApprove } from '../hooks/useKitchenPortal';
import type { KitchenAccountStatus } from '../kitchenPartner.types';

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  ONBOARDING: {
    title: 'Finish setting up your kitchen',
    body: 'A few steps are still pending — owner details, documents, or your menu.',
  },
  UNDER_REVIEW: {
    title: 'Your application is under review',
    body: "We're verifying your documents. This usually takes 1-2 business days — we'll notify you the moment you're approved.",
  },
  REJECTED: {
    title: 'Your application needs changes',
    body: 'Please review the note below, fix what is flagged, then resubmit.',
  },
  SUSPENDED: {
    title: 'Your kitchen is suspended',
    body: 'Contact FreshBhoj support to resolve this before you can take orders again.',
  },
};

type StageState = 'complete' | 'current' | 'attention' | 'upcoming';

interface Stage {
  key: string;
  title: string;
  state: StageState;
}

/** Mirrors the website's `UnderReviewScreen` 3-stage tracker. */
function buildStages(status: KitchenAccountStatus): Stage[] {
  const verificationState: StageState =
    status === 'REJECTED' || status === 'SUSPENDED' ? 'attention' : status === 'UNDER_REVIEW' ? 'current' : 'complete';
  const liveState: StageState = status === 'ACTIVE' ? 'complete' : 'upcoming';

  return [
    { key: 'submitted', title: 'Application submitted', state: 'complete' },
    { key: 'verification', title: 'Verification in progress', state: verificationState },
    { key: 'live', title: 'Live on platform', state: liveState },
  ];
}

function StageIcon({ state }: { state: StageState }) {
  if (state === 'complete') return <CheckCircle2 size={18} color={theme.colors.accent[600]} />;
  if (state === 'attention') return <ShieldAlert size={18} color={theme.colors.state.error} />;
  if (state === 'current') return <Clock3 size={18} color={theme.colors.brand.primary} />;
  return <View style={styles.upcomingDot} />;
}

function StageRow({ stage, isLast }: { stage: Stage; isLast: boolean }) {
  return (
    <View style={styles.stageRow}>
      <View style={styles.stageIconColumn}>
        <StageIcon state={stage.state} />
        {!isLast ? (
          <View style={[styles.stageConnector, stage.state === 'complete' ? styles.stageConnectorDone : null]} />
        ) : null}
      </View>
      <Text
        style={[
          styles.stageTitle,
          stage.state === 'upcoming' ? styles.stageTitleUpcoming : null,
          stage.state === 'attention' ? styles.stageTitleAttention : null,
        ]}
      >
        {stage.title}
      </Text>
    </View>
  );
}

const KitchenOnboardingPending = () => {
  const insets = useSafeAreaInsets();
  const account = useKitchenAuthStore((s) => s.account);
  const onboarding = useKitchenOnboardingStatus();
  const logout = useKitchenLogout();
  const simulateApprove = useSimulateApprove();

  const status = onboarding.data?.status ?? account?.status ?? 'ONBOARDING';
  const copy = STATUS_COPY[status] ?? STATUS_COPY.ONBOARDING;
  const stages = buildStages(status);

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  };

  const handleSimulateApprove = () => {
    simulateApprove.mutate(undefined, {
      onError: () => Alert.alert('Could not simulate approval', 'Please try again.'),
    });
  };

  return (
    <Screen background="page">
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: theme.spacing.paddings.xxl + Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <Clock3 size={28} color={theme.colors.brand.primary} />
        </View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.body}>{copy.body}</Text>

        <Card style={styles.stageCard}>
          {stages.map((stage, index) => (
            <StageRow key={stage.key} stage={stage} isLast={index === stages.length - 1} />
          ))}
        </Card>

        {onboarding.data?.pending?.length ? (
          <Card style={styles.pendingCard}>
            <Text style={styles.pendingHeading}>Still pending</Text>
            {onboarding.data.pending.map((item) => (
              <Text key={item} style={styles.pendingItem}>
                • {item}
              </Text>
            ))}
          </Card>
        ) : null}

        {onboarding.data?.rejectionReason ? (
          <Card style={styles.pendingCard}>
            <Text style={styles.pendingHeading}>Reviewer note</Text>
            <Text style={styles.pendingItem}>{onboarding.data.rejectionReason}</Text>
          </Card>
        ) : null}

        <Button title="Refresh status" variant="secondary" onPress={() => onboarding.refetch()} loading={onboarding.isRefetching} style={styles.button} />

        {__DEV__ && status === 'UNDER_REVIEW' ? (
          <Button
            title={simulateApprove.isPending ? 'Approving…' : 'Simulate approval (dev only)'}
            variant="outline"
            leftIcon={<Rocket size={16} color={theme.colors.text.primary} />}
            onPress={handleSimulateApprove}
            loading={simulateApprove.isPending}
            style={styles.button}
          />
        ) : null}

        <Button title={logout.isPending ? 'Logging out…' : 'Log out'} variant="ghost" onPress={handleLogout} style={styles.button} />
      </ScrollView>
    </Screen>
  );
};

export default KitchenOnboardingPending;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.xxl, paddingBottom: theme.spacing.paddings.xxl, alignItems: 'center' },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.brand.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.paddings.lg,
  },
  title: { ...theme.text.h2, color: theme.colors.text.primary, textAlign: 'center' },
  body: { ...theme.text.bodySmall, color: theme.colors.text.secondary, textAlign: 'center', marginTop: theme.spacing.paddings.sm },
  stageCard: { width: '100%', marginTop: theme.spacing.paddings.lg },
  stageRow: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 40 },
  stageIconColumn: { width: 24, alignItems: 'center' },
  stageConnector: { width: 2, flex: 1, minHeight: 16, backgroundColor: theme.colors.borders.subtle, marginTop: 2 },
  stageConnectorDone: { backgroundColor: theme.colors.accent[300] },
  upcomingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.neutral[300] },
  stageTitle: { ...theme.text.bodyMedium, color: theme.colors.text.primary, marginLeft: theme.spacing.paddings.sm, marginTop: -1 },
  stageTitleUpcoming: { color: theme.colors.text.tertiary },
  stageTitleAttention: { color: theme.colors.state.error, fontWeight: '700' as const },
  pendingCard: { width: '100%', marginTop: theme.spacing.paddings.lg },
  pendingHeading: { ...theme.text.label, color: theme.colors.text.primary, marginBottom: theme.spacing.paddings.xs },
  pendingItem: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginTop: 2 },
  button: { width: '100%', marginTop: theme.spacing.paddings.md },
});
