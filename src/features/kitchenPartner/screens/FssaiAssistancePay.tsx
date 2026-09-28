import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CreditCard, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Button, Card, Screen } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useConfirmFssaiAssistancePayment } from '../hooks/useKitchenPortal';
import type { FssaiAssistanceRequest } from '../kitchenPartner.types';

interface Props {
  request: FssaiAssistanceRequest;
}

/**
 * Step 5 — payment confirmation. No real payment gateway is wired up in
 * this phase; this is an explicit placeholder step that just flips the
 * backend request to `DOCUMENTS_SUBMITTED`, so the copy says so plainly.
 */
const FssaiAssistancePay: React.FC<Props> = ({ request }) => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const insets = useSafeAreaInsets();
  const confirmPayment = useConfirmFssaiAssistancePayment();

  const handlePay = () => {
    confirmPayment.mutate(undefined, {
      onError: (error) => Alert.alert('Could not confirm payment', error instanceof KitchenApiError ? error.message : 'Please try again.'),
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
          <CreditCard size={28} color={theme.colors.brand.primary} />
        </View>
        <Text style={styles.title}>Confirm payment</Text>
        <Text style={styles.body}>Your documents are in. Confirm payment to file your FSSAI application with the government.</Text>

        <Card style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Government registration fee</Text>
            <Text style={styles.rowValue}>{`₹${request.govtFee.toLocaleString('en-IN')}`}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>FreshBhoj service fee</Text>
            <Text style={styles.rowValue}>{`₹${request.serviceFee.toLocaleString('en-IN')}`}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{`₹${request.totalFee.toLocaleString('en-IN')}`}</Text>
          </View>
        </Card>

        <View style={styles.demoNotice}>
          <Info size={14} color={theme.colors.text.tertiary} />
          <Text style={styles.demoNoticeText}>Demo payment — no real charge is made in this phase.</Text>
        </View>

        <Button
          title={confirmPayment.isPending ? 'Confirming…' : `Pay ₹${request.totalFee.toLocaleString('en-IN')} (Demo)`}
          onPress={handlePay}
          loading={confirmPayment.isPending}
          style={styles.button}
        />
      </ScrollView>
    </Screen>
  );
};

export default FssaiAssistancePay;

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
  card: { width: '100%', marginTop: theme.spacing.paddings.lg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.paddings.sm },
  rowLabel: { ...theme.text.bodySmall, color: theme.colors.text.secondary },
  rowValue: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.borders.subtle, marginVertical: theme.spacing.paddings.xs },
  totalLabel: { ...theme.text.h4, color: theme.colors.text.primary },
  totalValue: { ...theme.text.h3, color: theme.colors.brand.primary },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: theme.spacing.paddings.md,
    alignSelf: 'stretch',
  },
  demoNoticeText: { ...theme.text.caption, color: theme.colors.text.tertiary, flex: 1 },
  button: { width: '100%', marginTop: theme.spacing.paddings.lg },
});
