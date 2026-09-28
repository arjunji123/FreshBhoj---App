import React, { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Button, Input, Screen } from '@components/ui';
import LocationMapPicker, { type PickedLocation } from '@components/LocationMapPicker';
import { KitchenApiError } from '../api/kitchenClient';
import { useKitchenLogout } from '../hooks/useKitchenAuth';
import { useKitchenOnboardingStatus, useSaveLocation } from '../hooks/useKitchenPortal';
import RegistrationProgressBar from '../components/RegistrationProgressBar';

const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 40;

/** Step 3 of registration — pin-drop location plus how far this kitchen delivers. */
const KitchenRegisterLocation = () => {
  const insets = useSafeAreaInsets();
  const onboarding = useKitchenOnboardingStatus();
  const saveLocation = useSaveLocation();
  const logout = useKitchenLogout();

  const [addressLine, setAddressLine] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(5);

  // The map picker keeps resolving a fresh address on every drag — once the
  // partner has started hand-editing a field, stop overwriting it from the
  // reverse-geocode result so their edits aren't clobbered mid-typing.
  const addressEditedRef = useRef(false);

  const handleLocationChange = (location: PickedLocation) => {
    setCoords({ latitude: location.latitude, longitude: location.longitude });
    if (addressEditedRef.current) return;
    setAddressLine(location.formattedAddress);
    setLocality(location.locality ?? '');
    setCity(location.city ?? '');
    setStateName(location.state ?? '');
    setPincode(location.pincode ?? '');
  };

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  };

  const handleContinue = () => {
    if (!coords) {
      Alert.alert('Drop a pin', 'Move the map to set your kitchen location first.');
      return;
    }
    if (!addressLine.trim() || addressLine.trim().length < 5) {
      Alert.alert('Add your address', 'Your address line needs to be at least 5 characters.');
      return;
    }
    if (!locality.trim()) {
      Alert.alert('Add your locality', 'This helps customers find your kitchen.');
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      Alert.alert('Check your pincode', 'Pincode must be exactly 6 digits.');
      return;
    }
    saveLocation.mutate(
      {
        addressLine: addressLine.trim(),
        locality: locality.trim(),
        city: city.trim() || undefined,
        state: stateName.trim() || undefined,
        pincode: pincode.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        serviceRadiusKm: radiusKm,
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
        <Text style={theme.text.h2}>Location</Text>
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
        <LocationMapPicker onLocationChange={handleLocationChange} height={280} />

        <Input
          label="Address line"
          value={addressLine}
          onChangeText={(v) => {
            addressEditedRef.current = true;
            setAddressLine(v);
          }}
          placeholder="House / building, street"
          containerStyle={styles.field}
        />
        <Input
          label="Locality"
          value={locality}
          onChangeText={(v) => {
            addressEditedRef.current = true;
            setLocality(v);
          }}
          placeholder="e.g. Malviya Nagar"
          containerStyle={styles.field}
        />
        <View style={styles.row}>
          <Input
            label="City"
            value={city}
            onChangeText={(v) => {
              addressEditedRef.current = true;
              setCity(v);
            }}
            containerStyle={[styles.field, styles.rowField]}
          />
          <Input
            label="State"
            value={stateName}
            onChangeText={(v) => {
              addressEditedRef.current = true;
              setStateName(v);
            }}
            containerStyle={[styles.field, styles.rowField]}
          />
        </View>
        <Input
          label="Pincode"
          value={pincode}
          onChangeText={(v) => {
            addressEditedRef.current = true;
            setPincode(v.replace(/\D/g, '').slice(0, 6));
          }}
          keyboardType="numeric"
          placeholder="302017"
          containerStyle={styles.field}
        />

        <Text style={styles.label}>Delivery radius</Text>
        <View style={styles.radiusCard}>
          <Slider
            style={styles.slider}
            minimumValue={MIN_RADIUS_KM}
            maximumValue={MAX_RADIUS_KM}
            step={1}
            value={radiusKm}
            onValueChange={setRadiusKm}
            minimumTrackTintColor={theme.colors.brand.primary}
            maximumTrackTintColor={theme.colors.neutral[200]}
            thumbTintColor={theme.colors.brand.primary}
          />
          <Text style={styles.radiusValue}>{radiusKm} km</Text>
        </View>

        <Button
          title={saveLocation.isPending ? 'Saving…' : 'Continue'}
          onPress={handleContinue}
          loading={saveLocation.isPending}
          disabled={saveLocation.isPending}
          style={styles.field}
        />
      </ScrollView>
    </Screen>
  );
};

export default KitchenRegisterLocation;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.paddings.sm,
  },
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  field: { marginTop: theme.spacing.paddings.md },
  row: { flexDirection: 'row', gap: theme.spacing.paddings.md },
  rowField: { flex: 1 },
  label: { ...theme.text.label, color: theme.colors.text.primary, marginTop: theme.spacing.paddings.lg, marginBottom: theme.spacing.paddings.xs },
  radiusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.paddings.md,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.radius.card,
    paddingHorizontal: theme.spacing.paddings.md,
    paddingVertical: theme.spacing.paddings.sm,
  },
  slider: { flex: 1 },
  radiusValue: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const, width: 48, textAlign: 'right' },
});
