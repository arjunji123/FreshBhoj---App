import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CircleAlert, Utensils } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Badge, Button, Card, Divider, Screen } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useKitchenLogout } from '../hooks/useKitchenAuth';
import { useKitchenOnboardingStatus, useKitchenProfile, useSubmitOnboarding } from '../hooks/useKitchenPortal';
import RegistrationProgressBar from '../components/RegistrationProgressBar';

/** Step 6 — everything the partner entered, a checklist of what's left, then submit. */
const KitchenRegisterReview = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const insets = useSafeAreaInsets();
  const onboarding = useKitchenOnboardingStatus();
  const profile = useKitchenProfile();
  const submit = useSubmitOnboarding();
  const logout = useKitchenLogout();

  const pending = onboarding.data?.pending ?? [];
  const hasDishPending = pending.some((item) => item.toLowerCase().includes('dish'));
  const canSubmit = onboarding.data?.canSubmit ?? false;

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  };

  const handleSubmit = () => {
    submit.mutate(undefined, {
      onError: (error) =>
        Alert.alert('Could not submit', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Text style={theme.text.h2}>Review & submit</Text>
        <Button title="Log out" variant="ghost" size="sm" fullWidth={false} onPress={handleLogout} />
      </View>

      {onboarding.data ? (
        <RegistrationProgressBar steps={onboarding.data.steps} progressPercent={onboarding.data.progressPercent} />
      ) : null}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: theme.spacing.paddings.xxl + Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        {onboarding.data?.rejectionReason ? (
          <Card style={styles.field}>
            <View style={styles.pendingHeader}>
              <CircleAlert size={16} color={theme.colors.state.error} />
              <Text style={styles.cardHeading}>Your application needs changes</Text>
            </View>
            <Text style={styles.pendingItem}>{onboarding.data.rejectionReason}</Text>
            <Text style={styles.pendingItem}>Fix what is flagged, then submit again.</Text>
          </Card>
        ) : null}

        {profile.data ? (
          <Card style={styles.field}>
            <Text style={styles.summaryTitle}>{profile.data.name}</Text>
            {profile.data.tagline ? <Text style={styles.summaryLine}>{profile.data.tagline}</Text> : null}
            {profile.data.addressLine ? (
              <Text style={styles.summaryLine}>
                {[profile.data.addressLine, profile.data.locality, profile.data.city].filter(Boolean).join(', ')}
              </Text>
            ) : null}
            {profile.data.opensAt && profile.data.closesAt ? (
              <Text style={styles.summaryLine}>
                {profile.data.opensAt} – {profile.data.closesAt}
              </Text>
            ) : null}
          </Card>
        ) : null}

        {onboarding.data?.documents.length ? (
          <Card style={styles.field}>
            <Text style={styles.cardHeading}>Documents</Text>
            {onboarding.data.documents.map((doc) => (
              <View key={doc.id} style={styles.docRow}>
                <Text style={styles.docLabel}>{doc.type.replace(/_/g, ' ')}</Text>
                <Badge
                  label={doc.status === 'VERIFIED' ? 'Verified' : doc.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                  tone={doc.status === 'VERIFIED' ? 'accent' : doc.status === 'REJECTED' ? 'danger' : 'info'}
                  size="sm"
                />
              </View>
            ))}
          </Card>
        ) : null}

        {onboarding.data?.bankAccount ? (
          <Card style={styles.field}>
            <Text style={styles.cardHeading}>Bank account</Text>
            <View style={styles.docRow}>
              <Text style={styles.docLabel}>{onboarding.data.bankAccount.accountNumberMasked}</Text>
              <Badge
                label={onboarding.data.bankAccount.isVerified ? 'Verified' : 'Verification pending'}
                tone={onboarding.data.bankAccount.isVerified ? 'accent' : 'warning'}
                size="sm"
              />
            </View>
          </Card>
        ) : null}

        {pending.length > 0 ? (
          <Card style={styles.field}>
            <View style={styles.pendingHeader}>
              <CircleAlert size={16} color={theme.colors.amber[600]} />
              <Text style={styles.cardHeading}>Still needed before you can submit</Text>
            </View>
            <Divider spacing={theme.spacing.paddings.sm} />
            {pending.map((item) => (
              <Text key={item} style={styles.pendingItem}>
                • {item}
              </Text>
            ))}
          </Card>
        ) : (
          <Card style={styles.field}>
            <Text style={styles.cardHeading}>You're all set</Text>
            <Text style={styles.summaryLine}>Everything required is in place — submit whenever you're ready.</Text>
          </Card>
        )}

        {hasDishPending ? (
          <Button
            title="Add a dish"
            leftIcon={<Utensils size={16} color={theme.colors.palette.white} />}
            onPress={() => navigation.navigate('KitchenMealForm')}
            style={styles.field}
          />
        ) : (
          <Button
            title={submit.isPending ? 'Submitting…' : 'Submit for review'}
            onPress={handleSubmit}
            loading={submit.isPending}
            disabled={!canSubmit || submit.isPending}
            style={styles.field}
          />
        )}

        <Button
          title="Refresh status"
          variant="secondary"
          onPress={() => onboarding.refetch()}
          loading={onboarding.isRefetching}
          style={styles.field}
        />
      </ScrollView>
    </Screen>
  );
};

export default KitchenRegisterReview;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.paddings.sm,
  },
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  field: { marginBottom: theme.spacing.paddings.md },
  summaryTitle: { ...theme.text.h3, color: theme.colors.text.primary },
  summaryLine: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginTop: 4 },
  cardHeading: { ...theme.text.label, color: theme.colors.text.primary },
  pendingHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pendingItem: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginTop: 4 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.paddings.xs,
  },
  docLabel: { ...theme.text.bodySmall, color: theme.colors.text.primary, textTransform: 'capitalize' as const },
});
