import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Badge, Button, Input, Screen } from '@components/ui';
import { KitchenApiError } from '../api/kitchenClient';
import { useKitchenLogout } from '../hooks/useKitchenAuth';
import { useKitchenOnboardingStatus, useSaveBankDetails } from '../hooks/useKitchenPortal';
import RegistrationProgressBar from '../components/RegistrationProgressBar';

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** Step 5 of registration — payout details. Verification always lands `false` right after save. */
const KitchenRegisterBankDetails = () => {
  const insets = useSafeAreaInsets();
  const onboarding = useKitchenOnboardingStatus();
  const saveBankDetails = useSaveBankDetails();
  const logout = useKitchenLogout();

  const existing = onboarding.data?.bankAccount ?? null;
  const [accountHolderName, setAccountHolderName] = useState(existing?.accountHolderName ?? '');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState(existing?.ifsc ?? '');
  const [bankName, setBankName] = useState(existing?.bankName ?? '');
  const [upiId, setUpiId] = useState(existing?.upiId ?? '');
  const [justSaved, setJustSaved] = useState(false);

  const showVerificationPending = justSaved || existing?.isVerified === false;

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  };

  const handleContinue = () => {
    if (!accountHolderName.trim()) {
      Alert.alert('Add the account holder name', 'This should match the bank account exactly.');
      return;
    }
    const digitsOnly = accountNumber.replace(/\D/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 18) {
      Alert.alert('Check your account number', 'Account number must be 9-18 digits.');
      return;
    }
    if (!IFSC_PATTERN.test(ifsc.trim().toUpperCase())) {
      Alert.alert('Check your IFSC code', 'e.g. HDFC0001234 — 4 letters, a 0, then 6 letters/digits.');
      return;
    }
    saveBankDetails.mutate(
      {
        accountHolderName: accountHolderName.trim(),
        accountNumber: digitsOnly,
        ifsc: ifsc.trim().toUpperCase(),
        bankName: bankName.trim() || undefined,
        upiId: upiId.trim() || undefined,
      },
      {
        onSuccess: () => setJustSaved(true),
        onError: (error) =>
          Alert.alert('Could not save', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Text style={theme.text.h2}>Bank details</Text>
        <Button title="Log out" variant="ghost" size="sm" fullWidth={false} onPress={handleLogout} />
      </View>

      {onboarding.data ? (
        <RegistrationProgressBar steps={onboarding.data.steps} progressPercent={onboarding.data.progressPercent} />
      ) : null}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: theme.spacing.paddings.xxl + Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>This is where we'll send your payouts. Double-check it — payouts can't be redirected once sent.</Text>

        {showVerificationPending ? (
          <Badge label="Verification pending" tone="warning" size="md" style={styles.badge} />
        ) : null}

        <Input
          label="Account holder name"
          value={accountHolderName}
          onChangeText={setAccountHolderName}
          placeholder="As printed on your passbook"
          autoCapitalize="words"
          containerStyle={styles.field}
        />
        <Input
          label="Account number"
          value={accountNumber}
          onChangeText={(v) => setAccountNumber(v.replace(/\D/g, '').slice(0, 18))}
          placeholder={existing ? 'Re-enter to change the saved number' : '9-18 digit account number'}
          keyboardType="numeric"
          containerStyle={styles.field}
        />
        <Input
          label="IFSC code"
          value={ifsc}
          onChangeText={(v) => setIfsc(v.toUpperCase().slice(0, 11))}
          placeholder="HDFC0001234"
          autoCapitalize="characters"
          containerStyle={styles.field}
        />
        <Input
          label="Bank name (optional)"
          value={bankName}
          onChangeText={setBankName}
          placeholder="e.g. HDFC Bank"
          containerStyle={styles.field}
        />
        <Input
          label="UPI ID (optional)"
          value={upiId}
          onChangeText={setUpiId}
          placeholder="yourname@upi"
          autoCapitalize="none"
          containerStyle={styles.field}
        />

        <Button
          title={saveBankDetails.isPending ? 'Saving…' : 'Continue'}
          onPress={handleContinue}
          loading={saveBankDetails.isPending}
          disabled={saveBankDetails.isPending}
          style={styles.field}
        />
      </ScrollView>
    </Screen>
  );
};

export default KitchenRegisterBankDetails;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.paddings.sm,
  },
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  intro: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginBottom: theme.spacing.paddings.md },
  badge: { marginBottom: theme.spacing.paddings.md },
  field: { marginBottom: theme.spacing.paddings.md },
});
