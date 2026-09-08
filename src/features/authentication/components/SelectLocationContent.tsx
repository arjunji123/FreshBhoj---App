import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, LocateFixed } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import LocationMapPicker, { type PickedLocation } from '@components/LocationMapPicker';
import { Button } from '@components/ui';
import { getCurrentPosition, requestLocationPermission } from '@utils/deviceLocation';
import { reverseGeocode } from '@utils/geocoding';
import { AUTH_COPY } from '../auth.constants';
import { useAuthStore } from '../store/authStore';
import { useSaveOnboardingLocation } from '../hooks/useAuth';

interface SelectLocationContentProps {
  onSaveAndContinue: () => void;
}

/**
 * Real map, real GPS — no fixed area list. The customer either lets the
 * device say where they are or drags the pin themselves, the same pin-drop
 * pattern every delivery app uses, and the resolved address is what gets
 * saved as their delivery location.
 */
const SelectLocationContent: React.FC<SelectLocationContentProps> = ({ onSaveAndContinue }) => {
  const [picked, setPicked] = useState<PickedLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [recenterTo, setRecenterTo] = useState<{ latitude: number; longitude: number } | null>(null);

  const setLocation = useAuthStore((s) => s.setLocation);
  const saveLocation = useSaveOnboardingLocation();

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        Alert.alert(
          'Location permission needed',
          'Allow location access so we can find where you are.',
        );
        return;
      }
      const position = await getCurrentPosition();
      const result = await reverseGeocode(position.latitude, position.longitude);
      setPicked({
        latitude: position.latitude,
        longitude: position.longitude,
        formattedAddress:
          result?.formattedAddress ?? `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`,
        locality: result?.locality,
        city: result?.city,
        state: result?.state,
        pincode: result?.pincode,
      });
      // Remounts the map centred on the fresh coordinates.
      setRecenterTo(position);
      setMapKey((key) => key + 1);
    } catch (error) {
      Alert.alert('Could not get your location', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSave = () => {
    if (!picked) return;

    setLocation({
      address: picked.formattedAddress,
      latitude: picked.latitude,
      longitude: picked.longitude,
      locality: picked.locality ?? '',
      city: picked.city ?? 'Jaipur',
      pincode: picked.pincode ?? '',
    });

    saveLocation.mutate(
      {
        latitude: picked.latitude,
        longitude: picked.longitude,
        address: picked.formattedAddress,
        city: picked.city ?? 'Jaipur',
        state: picked.state,
        pincode: picked.pincode,
      },
      { onSuccess: onSaveAndContinue },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[theme.text.h2, styles.title]}>{AUTH_COPY.locationTitle}</Text>
      <Text style={[theme.text.body, styles.subtitle]}>{AUTH_COPY.locationSubtitle}</Text>

      <Pressable
        onPress={handleUseCurrentLocation}
        disabled={isLocating}
        style={({ pressed }) => [styles.currentLocationRow, pressed ? styles.pressed : null]}
      >
        {isLocating ? (
          <ActivityIndicator size="small" color={theme.colors.primary[600]} />
        ) : (
          <LocateFixed size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />
        )}
        <Text style={[theme.text.bodyMedium, styles.currentLocationText]}>
          {AUTH_COPY.locationUseCurrent}
        </Text>
      </Pressable>

      <LocationMapPicker
        key={mapKey}
        initialLatitude={recenterTo?.latitude ?? picked?.latitude}
        initialLongitude={recenterTo?.longitude ?? picked?.longitude}
        onLocationChange={setPicked}
        height={320}
      />

      <View style={styles.footer}>
        <Button
          title={AUTH_COPY.locationSave}
          onPress={handleSave}
          disabled={!picked}
          loading={saveLocation.isPending}
          rightIcon={<ArrowRight size={16} color={theme.colors.text.inverse} strokeWidth={2.6} />}
        />
      </View>

      <View style={styles.dots}>
        <View style={styles.dotInactive} />
        <View style={styles.dotActive} />
      </View>
    </View>
  );
};

export default SelectLocationContent;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text.primary,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    marginTop: 6,
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.surface.brandWash,
    borderWidth: 1,
    borderColor: theme.colors.borders.brand,
  },
  currentLocationText: {
    color: theme.colors.primary[700],
  },
  pressed: {
    opacity: 0.85,
  },
  footer: {
    marginTop: theme.spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  dotInactive: {
    width: 8,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary[200],
  },
  dotActive: {
    width: 32,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary[600],
  },
});
