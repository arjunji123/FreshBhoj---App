import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Cloud, Home, Package, UtensilsCrossed } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Button, Input, Screen } from '@components/ui';
import { KitchenApiError } from '../api/kitchenClient';
import { useKitchenLogout } from '../hooks/useKitchenAuth';
import { useKitchenOnboardingStatus, useSaveKitchenDetails } from '../hooks/useKitchenPortal';
import RegistrationProgressBar from '../components/RegistrationProgressBar';
import type { KitchenType } from '../kitchenPartner.types';

const KITCHEN_TYPES: { value: KitchenType; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'HOME_KITCHEN', label: 'Home kitchen', description: 'Cooked at home', icon: Home },
  { value: 'CLOUD_KITCHEN', label: 'Cloud kitchen', description: 'Delivery-only', icon: Cloud },
  { value: 'RESTAURANT', label: 'Restaurant', description: 'Dine-in kitchen', icon: UtensilsCrossed },
  { value: 'TIFFIN_SERVICE', label: 'Tiffin service', description: 'Daily meal boxes', icon: Package },
];

/**
 * Kitchen type is a required single-select — the shared `Chip` primitive is
 * built for filter-toggle rows, not a mandatory choice with icon + helper
 * copy, so this is a small bespoke grid rather than a force-fit of `Chip`.
 */
function KitchenTypeGrid({ value, onChange }: { value: KitchenType | null; onChange: (v: KitchenType) => void }) {
  return (
    <View style={styles.grid}>
      {KITCHEN_TYPES.map(({ value: typeValue, label, description, icon: Icon }) => {
        const selected = value === typeValue;
        return (
          <Pressable
            key={typeValue}
            onPress={() => onChange(typeValue)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.typeCard,
              selected ? styles.typeCardSelected : null,
              pressed ? styles.typeCardPressed : null,
            ]}
          >
            <View style={[styles.typeIconWrap, selected ? styles.typeIconWrapSelected : null]}>
              <Icon size={20} color={selected ? theme.colors.text.inverse : theme.colors.brand.primary} strokeWidth={2.2} />
            </View>
            <Text style={[styles.typeLabel, selected ? styles.typeLabelSelected : null]} numberOfLines={1}>
              {label}
            </Text>
            <Text style={[styles.typeDescription, selected ? styles.typeDescriptionSelected : null]} numberOfLines={1}>
              {description}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Step 2 of registration — what the kitchen is called and what kind it is. */
const KitchenRegisterKitchenDetails = () => {
  const insets = useSafeAreaInsets();
  const onboarding = useKitchenOnboardingStatus();
  const saveKitchenDetails = useSaveKitchenDetails();
  const logout = useKitchenLogout();

  const [name, setName] = useState('');
  const [kitchenType, setKitchenType] = useState<KitchenType | null>(null);
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [prepTimeMins, setPrepTimeMins] = useState('25');
  const [opensAt, setOpensAt] = useState('08:00');
  const [closesAt, setClosesAt] = useState('22:00');

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  };

  const handleContinue = () => {
    if (!name.trim() || name.trim().length < 3) {
      Alert.alert('Add a kitchen name', 'Your kitchen name needs to be at least 3 characters.');
      return;
    }
    if (!kitchenType) {
      Alert.alert('Pick a kitchen type', 'Choose the option that best describes your kitchen.');
      return;
    }
    const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
    if ((opensAt.trim() && !hhmm.test(opensAt.trim())) || (closesAt.trim() && !hhmm.test(closesAt.trim()))) {
      Alert.alert('Check your timings', 'Use 24-hour time like 09:00 and 21:00.');
      return;
    }
    const prep = prepTimeMins.trim() ? Number(prepTimeMins) : undefined;
    if (prep !== undefined && (!Number.isInteger(prep) || prep < 5 || prep > 180)) {
      Alert.alert('Check the prep time', 'Prep time must be a whole number of minutes between 5 and 180.');
      return;
    }
    saveKitchenDetails.mutate(
      {
        name: name.trim(),
        prepTimeMins: prep,
        kitchenType,
        tagline: tagline.trim() || undefined,
        description: description.trim() || undefined,
        opensAt: opensAt.trim() || undefined,
        closesAt: closesAt.trim() || undefined,
      },
      {
        onError: (error) =>
          Alert.alert('Could not save', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Text style={theme.text.h2}>Kitchen details</Text>
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
        <Input
          label="Kitchen name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Priya's Kitchen"
          containerStyle={styles.field}
        />

        <Text style={styles.label}>Kitchen type</Text>
        <KitchenTypeGrid value={kitchenType} onChange={setKitchenType} />

        <Input
          label="Tagline (optional)"
          value={tagline}
          onChangeText={setTagline}
          placeholder="e.g. Home-style North Indian meals"
          containerStyle={styles.field}
        />
        <Input
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Tell customers what makes your kitchen special"
          multiline
          numberOfLines={3}
          containerStyle={styles.field}
        />

        <Input
          label="Prep time (mins)"
          value={prepTimeMins}
          onChangeText={(value) => setPrepTimeMins(value.replace(/\D/g, '').slice(0, 3))}
          keyboardType="number-pad"
          maxLength={3}
          containerStyle={styles.field}
        />

        <View style={styles.hoursRow}>
          <Input
            label="Opens at"
            value={opensAt}
            onChangeText={setOpensAt}
            placeholder="09:00"
            maxLength={5}
            containerStyle={[styles.field, styles.hoursField]}
          />
          <Input
            label="Closes at"
            value={closesAt}
            onChangeText={setClosesAt}
            placeholder="21:00"
            maxLength={5}
            containerStyle={[styles.field, styles.hoursField]}
          />
        </View>
        <Text style={styles.hoursHint}>Use 24-hour time, e.g. 09:00 and 21:00.</Text>

        <Button
          title={saveKitchenDetails.isPending ? 'Saving…' : 'Continue'}
          onPress={handleContinue}
          loading={saveKitchenDetails.isPending}
          disabled={saveKitchenDetails.isPending}
          style={styles.field}
        />
      </ScrollView>
    </Screen>
  );
};

export default KitchenRegisterKitchenDetails;

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
  label: { ...theme.text.label, color: theme.colors.text.primary, marginBottom: theme.spacing.paddings.xs },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.paddings.sm,
    marginBottom: theme.spacing.paddings.md,
  },
  typeCard: {
    width: '47%',
    borderRadius: theme.radius.card,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.surface.base,
    padding: theme.spacing.paddings.md,
  },
  typeCardSelected: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: theme.colors.brand.primarySubtle,
  },
  typeCardPressed: { opacity: 0.9 },
  typeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brand.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.paddings.sm,
  },
  typeIconWrapSelected: { backgroundColor: theme.colors.brand.primary },
  typeLabel: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  typeLabelSelected: { color: theme.colors.brand.primary },
  typeDescription: { ...theme.text.caption, color: theme.colors.text.tertiary, marginTop: 2 },
  typeDescriptionSelected: { color: theme.colors.text.secondary },
  hoursRow: { flexDirection: 'row', gap: theme.spacing.paddings.md },
  hoursField: { flex: 1 },
  hoursHint: { ...theme.text.caption, color: theme.colors.text.tertiary, marginTop: -theme.spacing.paddings.sm, marginBottom: theme.spacing.paddings.md },
});
