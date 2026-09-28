import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Clock3, Rocket } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Button, Card, Screen } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { useSimulateFssaiAssistanceAdvance } from '../hooks/useKitchenPortal';
import type { FssaiAssistanceRequest, FssaiAssistanceStatus } from '../kitchenPartner.types';

interface Props {
  request: FssaiAssistanceRequest;
}

type StageState = 'complete' | 'current' | 'upcoming';

const STAGE_ORDER: FssaiAssistanceStatus[] = ['DOCUMENTS_SUBMITTED', 'APPLICATION_FILED', 'GOVT_REVIEW_IN_PROGRESS', 'APPROVED'];

const STAGE_LABEL: Record<string, string> = {
  DOCUMENTS_SUBMITTED: 'Documents submitted',
  APPLICATION_FILED: 'Application filed with the government',
  GOVT_REVIEW_IN_PROGRESS: 'Government review in progress',
  APPROVED: 'Licence approved',
};

function stageState(stage: FssaiAssistanceStatus, current: FssaiAssistanceStatus): StageState {
  const stageIndex = STAGE_ORDER.indexOf(stage);
  const currentIndex = STAGE_ORDER.indexOf(current);
  if (currentIndex === -1) return 'upcoming';
  if (stageIndex < currentIndex) return 'complete';
  if (stageIndex === currentIndex) return 'current';
  return 'upcoming';
}

/** Step 6 — the government-review tracker. Polls every ~30s via `useFssaiAssistanceStatus`, plus a dev-only "simulate advance" button. */
const FssaiAssistanceStatusTracker: React.FC<Props> = ({ request }) => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const insets = useSafeAreaInsets();
  const simulateAdvance = useSimulateFssaiAssistanceAdvance();

  const handleSimulate = () => {
    simulateAdvance.mutate(undefined, {
      onError: () => Alert.alert('Could not simulate advance', 'Please try again.'),
    });
  };

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Button title="Back" variant="ghost" size="sm" fullWidth={false} onPress={() => navigation.goBack()} />
      </View>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: theme.spacing.paddings.xxl + Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <Clock3 size={28} color={theme.colors.brand.primary} />
        </View>
        <Text style={styles.title}>Your FSSAI application is in progress</Text>
        <Text style={styles.body}>
          We&apos;ll keep this updated as the government processes your application. This usually takes a few weeks.
        </Text>

        <Card style={styles.stageCard}>
          {STAGE_ORDER.map((stage, index) => (
            <StageRow key={stage} label={STAGE_LABEL[stage]} state={stageState(stage, request.status)} isLast={index === STAGE_ORDER.length - 1} />
          ))}
        </Card>

        <Button
          title={simulateAdvance.isPending ? 'Advancing…' : 'Simulate advance (dev only)'}
          variant="outline"
          leftIcon={<Rocket size={16} color={theme.colors.text.primary} />}
          onPress={handleSimulate}
          loading={simulateAdvance.isPending}
          style={styles.button}
        />
      </ScrollView>
    </Screen>
  );
};

function StageRow({ label, state, isLast }: { label: string; state: StageState; isLast: boolean }) {
  return (
    <View style={styles.stageRow}>
      <View style={styles.stageIconColumn}>
        {state === 'complete' ? (
          <CheckCircle2 size={18} color={theme.colors.accent[600]} />
        ) : state === 'current' ? (
          <Clock3 size={18} color={theme.colors.brand.primary} />
        ) : (
          <View style={styles.upcomingDot} />
        )}
        {!isLast ? <View style={[styles.stageConnector, state === 'complete' ? styles.stageConnectorDone : null]} /> : null}
      </View>
      <Text style={[styles.stageTitle, state === 'upcoming' ? styles.stageTitleUpcoming : null]}>{label}</Text>
    </View>
  );
}

export default FssaiAssistanceStatusTracker;

const styles = StyleSheet.create({
  header: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, alignItems: 'center' },
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
  stageTitle: { ...theme.text.bodyMedium, color: theme.colors.text.primary, marginLeft: theme.spacing.paddings.sm, marginTop: -1, flex: 1 },
  stageTitleUpcoming: { color: theme.colors.text.tertiary },
  button: { width: '100%', marginTop: theme.spacing.paddings.lg },
});
