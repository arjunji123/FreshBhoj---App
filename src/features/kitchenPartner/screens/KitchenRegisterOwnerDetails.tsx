import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Button, Input, Screen } from '@components/ui';
import { KitchenApiError } from '../api/kitchenClient';
import { useKitchenLogout } from '../hooks/useKitchenAuth';
import { useKitchenOnboardingStatus, useSaveOwnerDetails } from '../hooks/useKitchenPortal';
import RegistrationProgressBar from '../components/RegistrationProgressBar';

/** Step 1 of registration — who's running this kitchen. */
const KitchenRegisterOwnerDetails = () => {
  const insets = useSafeAreaInsets();
  const onboarding = useKitchenOnboardingStatus();
  const saveOwnerDetails = useSaveOwnerDetails();
  const logout = useKitchenLogout();

  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  };

  const handleContinue = () => {
    if (!ownerName.trim() || ownerName.trim().length < 2) {
      Alert.alert('Add your name', 'Your full name needs to be at least 2 characters.');
      return;
    }
    saveOwnerDetails.mutate(
      { ownerName: ownerName.trim(), email: email.trim() || undefined },
      {
        onError: (error) =>
          Alert.alert('Could not save', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Text style={theme.text.h2}>Owner details</Text>
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
        <Text style={styles.intro}>Let's start with your details as the kitchen owner — this is who we'll verify and contact.</Text>

        <Input
          label="Your full name"
          value={ownerName}
          onChangeText={setOwnerName}
          placeholder="e.g. Priya Sharma"
          autoCapitalize="words"
          containerStyle={styles.field}
        />
        <Input
          label="Email (optional)"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          containerStyle={styles.field}
        />

        <Button
          title={saveOwnerDetails.isPending ? 'Saving…' : 'Continue'}
          onPress={handleContinue}
          loading={saveOwnerDetails.isPending}
          disabled={saveOwnerDetails.isPending}
          style={styles.field}
        />
      </ScrollView>
    </Screen>
  );
};

export default KitchenRegisterOwnerDetails;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.paddings.sm,
  },
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  intro: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginBottom: theme.spacing.paddings.lg },
  field: { marginBottom: theme.spacing.paddings.md },
});
