import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Clock3 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Button, Card, Screen } from '@components/ui';
import { useKitchenAuthStore } from '../store/kitchenAuthStore';
import { useKitchenLogout } from '../hooks/useKitchenAuth';
import { useKitchenOnboardingStatus } from '../hooks/useKitchenPortal';

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  ONBOARDING: {
    title: 'Finish setting up your kitchen',
    body: 'A few steps are still pending — owner details, documents, or your menu. Complete them on the FreshBhoj Partner website to go live.',
  },
  UNDER_REVIEW: {
    title: 'Your application is under review',
    body: "We're verifying your documents. This usually takes 1-2 business days — we'll notify you the moment you're approved.",
  },
  REJECTED: {
    title: 'Your application needs changes',
    body: 'Please check the FreshBhoj Partner website for details on what needs fixing, then resubmit.',
  },
  SUSPENDED: {
    title: 'Your kitchen is suspended',
    body: 'Contact FreshBhoj support to resolve this before you can take orders again.',
  },
};

const KitchenOnboardingPending = () => {
  const insets = useSafeAreaInsets();
  const account = useKitchenAuthStore((s) => s.account);
  const onboarding = useKitchenOnboardingStatus();
  const logout = useKitchenLogout();

  const status = onboarding.data?.status ?? account?.status ?? 'ONBOARDING';
  const copy = STATUS_COPY[status] ?? STATUS_COPY.ONBOARDING;

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
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
  pendingCard: { width: '100%', marginTop: theme.spacing.paddings.lg },
  pendingHeading: { ...theme.text.label, color: theme.colors.text.primary, marginBottom: theme.spacing.paddings.xs },
  pendingItem: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginTop: 2 },
  button: { width: '100%', marginTop: theme.spacing.paddings.md },
});
