import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Landmark, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { AppBar, Button, Card, Screen } from '@components/ui';
import { KitchenApiError } from '../api/kitchenClient';
import { useStartFssaiAssistance } from '../hooks/useKitchenPortal';

interface Props {
  onBack: () => void;
}

/**
 * Step 3 of the assistance flow — the flat-fee breakdown. "Get started"
 * calls `start()`, which creates the backend `PENDING_PAYMENT` request and
 * hands routing over to `FssaiAssistanceGate`'s status-driven branch.
 */
const FssaiAssistancePricing: React.FC<Props> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const start = useStartFssaiAssistance();

  const handleStart = () => {
    start.mutate(undefined, {
      onError: (error) => Alert.alert('Could not start', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  return (
    <Screen background="page">
      <AppBar onBack={onBack} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: theme.spacing.paddings.xxl + Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <Landmark size={28} color={theme.colors.brand.primary} />
        </View>
        <Text style={styles.title}>Pricing</Text>
        <Text style={styles.body}>One flat fee, no surprises.</Text>

        <Card style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Government registration fee</Text>
            <Text style={styles.rowValue}>₹1,000</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>FreshBhoj service fee</Text>
            <Text style={styles.rowValue}>₹500</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹1,500</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.includedRow}>
            <Sparkles size={16} color={theme.colors.accent[600]} />
            <Text style={styles.includedText}>
              Document review, application filing with the government, and status updates until you&apos;re approved.
            </Text>
          </View>
        </Card>

        <Button title={start.isPending ? 'Starting…' : 'Get started'} onPress={handleStart} loading={start.isPending} style={styles.button} />
      </ScrollView>
    </Screen>
  );
};

export default FssaiAssistancePricing;

const styles = StyleSheet.create({
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
  card: { width: '100%', marginTop: theme.spacing.paddings.lg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.paddings.sm },
  rowLabel: { ...theme.text.bodySmall, color: theme.colors.text.secondary },
  rowValue: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.borders.subtle, marginVertical: theme.spacing.paddings.xs },
  totalLabel: { ...theme.text.h4, color: theme.colors.text.primary },
  totalValue: { ...theme.text.h3, color: theme.colors.brand.primary },
  includedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.paddings.sm },
  includedText: { ...theme.text.bodySmall, color: theme.colors.text.secondary, flex: 1 },
  button: { width: '100%', marginTop: theme.spacing.paddings.lg },
});
