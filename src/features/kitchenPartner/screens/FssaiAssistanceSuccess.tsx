import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Award, ExternalLink } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Button, Card, Screen } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { useKitchenOnboardingStatus } from '../hooks/useKitchenPortal';
import type { FssaiAssistanceRequest } from '../kitchenPartner.types';

interface Props {
  request: FssaiAssistanceRequest;
}

/**
 * Final step — shown once the backend request is `APPROVED`. "Complete
 * Kitchen Setup" refreshes the onboarding-status query (shared cache with
 * `KitchenGate`) and navigates back to the `KitchenTabs` route, which always
 * renders `KitchenGate` — so it lands the partner on whatever's correct for
 * their current `KitchenAccountStatus` (a remaining registration step, the
 * under-review tracker, or the live dashboard) without this screen needing
 * to know which.
 */
const FssaiAssistanceSuccess: React.FC<Props> = ({ request }) => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const insets = useSafeAreaInsets();
  const onboarding = useKitchenOnboardingStatus();

  const handleComplete = async () => {
    await onboarding.refetch();
    navigation.navigate('KitchenTabs', { screen: 'KitchenDashboard' });
  };

  const handleViewCertificate = () => {
    if (!request.certificateUrl) return;
    Linking.openURL(request.certificateUrl).catch(() => Alert.alert('Could not open certificate', 'Please try again.'));
  };

  return (
    <Screen background="page">
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: theme.spacing.paddings.xxl + Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <Award size={32} color={theme.colors.accent[600]} />
        </View>
        <Text style={styles.title}>You&apos;re FSSAI licensed!</Text>
        <Text style={styles.body}>Your food-safety licence has been approved by the government.</Text>

        <Card style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Licence number</Text>
            <Text style={styles.rowValue}>{request.licenseNumber ?? '—'}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Valid from</Text>
            <Text style={styles.rowValue}>{request.validFrom ? new Date(request.validFrom).toLocaleDateString('en-IN') : '—'}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Valid till</Text>
            <Text style={styles.rowValue}>{request.validTill ? new Date(request.validTill).toLocaleDateString('en-IN') : '—'}</Text>
          </View>
        </Card>

        {request.certificateUrl ? (
          <Card style={styles.card} onPress={handleViewCertificate}>
            <View style={styles.certRow}>
              <ExternalLink size={16} color={theme.colors.brand.primary} />
              <Text style={styles.certText}>View certificate</Text>
            </View>
          </Card>
        ) : null}

        <Button
          title={onboarding.isRefetching ? 'Loading…' : 'Complete Kitchen Setup'}
          onPress={handleComplete}
          loading={onboarding.isRefetching}
          style={styles.button}
        />
      </ScrollView>
    </Screen>
  );
};

export default FssaiAssistanceSuccess;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.xxl, alignItems: 'center' },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.accent[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.paddings.lg,
  },
  title: { ...theme.text.h2, color: theme.colors.text.primary, textAlign: 'center' },
  body: { ...theme.text.bodySmall, color: theme.colors.text.secondary, textAlign: 'center', marginTop: theme.spacing.paddings.sm },
  card: { width: '100%', marginTop: theme.spacing.paddings.lg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.paddings.sm },
  rowLabel: { ...theme.text.bodySmall, color: theme.colors.text.secondary },
  rowValue: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  certRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.paddings.sm },
  certText: { ...theme.text.bodyMedium, color: theme.colors.brand.primary, fontWeight: '700' as const },
  button: { width: '100%', marginTop: theme.spacing.paddings.xl },
});
