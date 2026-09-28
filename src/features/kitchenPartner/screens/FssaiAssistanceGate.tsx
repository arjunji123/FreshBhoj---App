import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '@app/theme/index';
import { Button } from '@components/ui';
import { useFssaiAssistanceStatus } from '../hooks/useKitchenPortal';
import type { FssaiAssistanceDocumentType } from '../kitchenPartner.types';
import FssaiAssistanceChoice from './FssaiAssistanceChoice';
import FssaiAssistanceEducation from './FssaiAssistanceEducation';
import FssaiAssistancePricing from './FssaiAssistancePricing';
import FssaiAssistanceDocuments from './FssaiAssistanceDocuments';
import FssaiAssistancePay from './FssaiAssistancePay';
import FssaiAssistanceStatusTracker from './FssaiAssistanceStatusTracker';
import FssaiAssistanceSuccess from './FssaiAssistanceSuccess';

export const REQUIRED_FSSAI_ASSISTANCE_DOCS: FssaiAssistanceDocumentType[] = [
  'IDENTITY_PROOF',
  'ADDRESS_PROOF',
  'KITCHEN_PHOTO',
  'PASSPORT_PHOTO',
];

type LocalStep = 'choice' | 'education' | 'pricing';

/**
 * Status-driven router for the FSSAI Assistance concierge flow — the same
 * shape as `KitchenGate` in `KitchenPartnerStack.tsx`. Once a backend
 * request exists, its `status` is the single source of truth for which
 * screen shows. Before a request exists there's nothing for the backend to
 * key routing off of, so `localStep` carries the partner through
 * Choice → Education → Pricing; `start()` (fired from Pricing) is what
 * actually creates the backend record and hands routing over to `status`.
 */
function FssaiAssistanceGate() {
  const query = useFssaiAssistanceStatus();
  const [localStep, setLocalStep] = useState<LocalStep>('choice');

  if (query.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.brand.primary} />
      </View>
    );
  }

  if (query.isError) {
    return (
      <View style={[styles.center, styles.errorPadding]}>
        <Text style={[theme.text.h3, styles.errorTitle]}>Couldn&apos;t load this</Text>
        <Text style={[theme.text.bodySmall, styles.errorBody]}>Check your connection and try again.</Text>
        <Button title="Retry" onPress={() => query.refetch()} fullWidth={false} />
      </View>
    );
  }

  const request = query.data?.request ?? null;
  const documents = query.data?.documents ?? [];

  if (!request || request.status === 'REJECTED' || request.status === 'CANCELLED') {
    if (localStep === 'education') {
      return <FssaiAssistanceEducation onNext={() => setLocalStep('pricing')} onBack={() => setLocalStep('choice')} />;
    }
    if (localStep === 'pricing') {
      return <FssaiAssistancePricing onBack={() => setLocalStep('education')} />;
    }
    return <FssaiAssistanceChoice previousRequest={request} onGetAssistance={() => setLocalStep('education')} />;
  }

  if (request.status === 'APPROVED') {
    return <FssaiAssistanceSuccess request={request} />;
  }

  if (request.status === 'PENDING_PAYMENT') {
    const hasAllDocs = REQUIRED_FSSAI_ASSISTANCE_DOCS.every((type) => documents.some((doc) => doc.type === type));
    return hasAllDocs ? <FssaiAssistancePay request={request} /> : <FssaiAssistanceDocuments documents={documents} />;
  }

  // DOCUMENTS_SUBMITTED, APPLICATION_FILED, GOVT_REVIEW_IN_PROGRESS
  return <FssaiAssistanceStatusTracker request={request} />;
}

export default FssaiAssistanceGate;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface.page },
  errorPadding: { padding: theme.spacing.paddings.xl },
  errorTitle: { color: theme.colors.text.primary, textAlign: 'center', marginBottom: theme.spacing.paddings.xs },
  errorBody: { color: theme.colors.text.secondary, textAlign: 'center', marginBottom: theme.spacing.paddings.lg },
});
