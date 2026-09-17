import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { AppBar, Button, Card, Input, Screen } from '@components/ui';
import { ApiError, authApi } from '@api';
import { useAuthStore } from '@features/authentication/store/authStore';
import type { PrivateNavigation } from '@app/navigation/navigation.types';

const DELETED_ITEMS = [
  'Your name, email, and profile photo',
  'Your phone number (freed up for later reuse)',
  'Saved addresses and saved payment methods',
  'Favourites, kitchen follows, story/reel likes and saves',
  'All active sessions, on every device',
];

const RETAINED_ITEMS = [
  'Past orders and reviews stay on file, no longer linked to your name — kitchens and our accounting have a legitimate need to keep these records.',
];

type Step = 'confirm' | 'otp';

const DeleteAccount = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const insets = useSafeAreaInsets();
  const phone = useAuthStore((s) => s.user?.phone ?? s.phoneNumber);
  const signOut = useAuthStore((s) => s.signOut);

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
      await authApi.requestAccountDeletion(phone);
      setStep('otp');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send the code. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!phone || otp.trim().length < 4 || isConfirming) return;
    setError(null);
    setIsConfirming(true);
    try {
      await authApi.confirmAccountDeletion(phone, otp.trim());
      Alert.alert('Account deleted', 'Your FreshBhoj account and personal data have been deleted.', [
        { text: 'OK', onPress: () => signOut() },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not verify that code. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Screen background="page">
      <AppBar title="Delete Account" onBack={navigation.goBack} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: theme.spacing.xxxl + Math.max(insets.bottom, 24) }]}
      >
        <View style={styles.warningBanner}>
          <AlertTriangle size={18} color={theme.colors.state.error} />
          <Text style={styles.warningText}>This permanently deletes your account. It cannot be undone.</Text>
        </View>

        <Text style={styles.sectionTitle}>What gets deleted</Text>
        {DELETED_ITEMS.map((item) => (
          <Text key={item} style={styles.itemText}>
            ✕ {item}
          </Text>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: theme.spacing.lg }]}>What we keep, and why</Text>
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
                We&apos;ll send a verification code to your registered number to confirm it&apos;s really you.
              </Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button
                title={isSending ? 'Sending…' : 'Send verification code'}
                variant="danger"
                onPress={handleSendCode}
                loading={isSending}
              />
            </>
          ) : (
            <>
              <Text style={styles.actionTitle}>Enter the code</Text>
              <Text style={styles.actionSubtitle}>We sent a code to your registered number.</Text>
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
                variant="danger"
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

export default DeleteAccount;

const styles = StyleSheet.create({
  scroll: { padding: theme.layout.screenPadding, paddingBottom: theme.spacing.xxxl },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface.brandWash,
    borderRadius: theme.radius.card,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  warningText: { ...theme.text.bodySmall, color: theme.colors.text.danger, flex: 1, fontWeight: '600' as const },
  sectionTitle: { ...theme.text.label, color: theme.colors.text.primary, marginBottom: theme.spacing.xs },
  itemText: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginBottom: 4 },
  actionCard: { marginTop: theme.spacing.xl },
  actionTitle: { ...theme.text.h4, color: theme.colors.text.primary, marginBottom: 4 },
  actionSubtitle: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginBottom: theme.spacing.lg },
  otpInput: { marginBottom: theme.spacing.md },
  errorText: { ...theme.text.caption, color: theme.colors.text.danger, marginBottom: theme.spacing.sm },
});
