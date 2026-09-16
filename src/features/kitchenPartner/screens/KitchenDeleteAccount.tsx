import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AlertTriangle } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Button, Card, Input, Screen } from '@components/ui';
import { KitchenApiError } from '../api/kitchenClient';
import { kitchenAuthApi } from '../api/kitchenPortal.api';
import { useKitchenAuthStore } from '../store/kitchenAuthStore';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';

const DELETED_ITEMS = [
  'Your name, email, and phone number (freed up for later reuse)',
  'Verification documents and bank details',
  'All active sessions, on every device',
];

const RETAINED_ITEMS = [
  'If your kitchen has ever taken orders, its storefront is paused (hidden from customers, no new orders) rather than erased — past orders, reviews and payouts need it to stay resolvable.',
];

type Step = 'confirm' | 'otp';

const KitchenDeleteAccount = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const account = useKitchenAuthStore((s) => s.account);
  const signOut = useKitchenAuthStore((s) => s.signOut);
  const phone = account?.phone;

  const [step, setStep] = useState<Step>('confirm');
  const [otp, setOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    if (!phone || isSending) return;
    setError(null);
    setIsSending(true);
    try {
      await kitchenAuthApi.requestAccountDeletion(phone);
      setStep('otp');
    } catch (err) {
      setError(err instanceof KitchenApiError ? err.message : 'Could not send the code. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!phone || otp.trim().length < 4 || isConfirming) return;
    setError(null);
    setIsConfirming(true);
    try {
      await kitchenAuthApi.confirmAccountDeletion(phone, otp.trim());
      Alert.alert('Account deleted', 'Your Kitchen Partner account and personal data have been deleted.', [
        { text: 'OK', onPress: () => signOut() },
      ]);
    } catch (err) {
      setError(err instanceof KitchenApiError ? err.message : 'Could not verify that code. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Button title="Back" variant="ghost" size="sm" fullWidth={false} onPress={() => navigation.goBack()} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.warningBanner}>
          <AlertTriangle size={18} color={theme.colors.text.danger} />
          <Text style={styles.warningText}>This permanently deletes your Kitchen Partner account. It cannot be undone.</Text>
        </View>

        <Text style={styles.sectionTitle}>What gets deleted</Text>
        {DELETED_ITEMS.map((item) => (
          <Text key={item} style={styles.itemText}>
            ✕ {item}
          </Text>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: theme.spacing.paddings.lg }]}>What we keep, and why</Text>
        {RETAINED_ITEMS.map((item) => (
          <Text key={item} style={styles.itemText}>
            ✓ {item}
          </Text>
        ))}

        <Card style={styles.actionCard}>
          {step === 'confirm' ? (
            <>
              <Text style={styles.actionTitle}>Ready to delete your account?</Text>
              <Text style={styles.actionSubtitle}>
                We&apos;ll send a verification code to {phone} to confirm it&apos;s really you.
              </Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button title={isSending ? 'Sending…' : 'Send verification code'} onPress={handleSendCode} loading={isSending} />
            </>
          ) : (
            <>
              <Text style={styles.actionTitle}>Enter the code</Text>
              <Text style={styles.actionSubtitle}>We sent a code to {phone}.</Text>
              <Input
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 8))}
                placeholder="Verification code"
                keyboardType="number-pad"
                containerStyle={styles.otpInput}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button
                title={isConfirming ? 'Deleting…' : 'Permanently delete my account'}
                onPress={handleConfirmDelete}
                loading={isConfirming}
                disabled={otp.trim().length < 4}
              />
            </>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
};

export default KitchenDeleteAccount;

const styles = StyleSheet.create({
  header: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  scroll: { padding: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.paddings.sm,
    backgroundColor: theme.colors.brand.primarySubtle,
    borderRadius: theme.radius.card,
    padding: theme.spacing.paddings.md,
    marginBottom: theme.spacing.paddings.lg,
  },
  warningText: { ...theme.text.bodySmall, color: theme.colors.text.danger, flex: 1, fontWeight: '600' as const },
  sectionTitle: { ...theme.text.label, color: theme.colors.text.primary, marginBottom: theme.spacing.paddings.xs },
  itemText: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginBottom: 4 },
  actionCard: { marginTop: theme.spacing.paddings.xl },
  actionTitle: { ...theme.text.h4, color: theme.colors.text.primary, marginBottom: 4 },
  actionSubtitle: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginBottom: theme.spacing.paddings.lg },
  otpInput: { marginBottom: theme.spacing.paddings.md },
  errorText: { ...theme.text.caption, color: theme.colors.text.danger, marginBottom: theme.spacing.paddings.sm },
});
