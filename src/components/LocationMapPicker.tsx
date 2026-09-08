import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { type Region } from 'react-native-maps';
import { LocateFixed, MapPin } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { getCurrentPosition, requestLocationPermission } from '@utils/deviceLocation';
import { reverseGeocode, type ReverseGeocodeResult } from '@utils/geocoding';
import AppGradient from './AppGradient';

const DEFAULT_REGION: Region = {
  // Jaipur — the app's single-city launch fallback.
  latitude: 26.9124,
  longitude: 75.7873,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export interface PickedLocation extends ReverseGeocodeResult {
  latitude: number;
  longitude: number;
}

interface LocationMapPickerProps {
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  /** Fires once per settled drag, after the address has resolved. */
  onLocationChange: (location: PickedLocation) => void;
  height?: number;
}

/**
 * The pin-drop location picker shared by onboarding and "add/edit address" —
 * drag the map, the centre pin stays put, the address underneath updates to
 * match, exactly like the pattern used across delivery apps.
 */
const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  initialLatitude,
  initialLongitude,
  onLocationChange,
  height = 300,
}) => {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(
    initialLatitude && initialLongitude
      ? { ...DEFAULT_REGION, latitude: initialLatitude, longitude: initialLongitude }
      : DEFAULT_REGION,
  );
  const [address, setAddress] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const requestId = useRef(0);

  const resolveAddress = useCallback(
    async (latitude: number, longitude: number) => {
      const thisRequest = ++requestId.current;
      setIsResolving(true);
      const result = await reverseGeocode(latitude, longitude);
      if (thisRequest !== requestId.current) return; // a newer drag has since started

      setIsResolving(false);
      setAddress(result?.formattedAddress ?? null);
      onLocationChange({
        latitude,
        longitude,
        formattedAddress: result?.formattedAddress ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        locality: result?.locality,
        city: result?.city,
        state: result?.state,
        pincode: result?.pincode,
      });
    },
    [onLocationChange],
  );

  // Resolve the starting point once on mount.
  useEffect(() => {
    resolveAddress(region.latitude, region.longitude);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        Alert.alert(
          'Location permission needed',
          'Allow location access to set your delivery address from where you are.',
        );
        return;
      }
      const position = await getCurrentPosition();
      const nextRegion = { ...region, latitude: position.latitude, longitude: position.longitude };
      setRegion(nextRegion);
      mapRef.current?.animateToRegion(nextRegion, 400);
      await resolveAddress(position.latitude, position.longitude);
    } catch (error) {
      Alert.alert('Could not get your location', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        onRegionChangeComplete={(nextRegion) => {
          setRegion(nextRegion);
          resolveAddress(nextRegion.latitude, nextRegion.longitude);
        }}
      />

      <View style={styles.centerPinWrap} pointerEvents="none">
        <AppGradient
          colors={theme.colors.gradients.brand}
          locations={theme.colors.gradients.brandLocations}
          direction="diagonal"
          style={styles.pin}
        >
          <MapPin size={16} color={theme.colors.text.inverse} fill={theme.colors.text.inverse} strokeWidth={0} />
        </AppGradient>
        <View style={styles.pinShadow} />
      </View>

      <Pressable
        onPress={handleUseCurrentLocation}
        disabled={isLocating}
        accessibilityRole="button"
        accessibilityLabel="Use current location"
        style={({ pressed }) => [styles.locateButton, pressed ? styles.pressed : null]}
      >
        {isLocating ? (
          <ActivityIndicator size="small" color={theme.colors.primary[600]} />
        ) : (
          <LocateFixed size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />
        )}
      </Pressable>

      <View style={styles.addressBar}>
        {isResolving ? (
          <ActivityIndicator size="small" color={theme.colors.primary[600]} />
        ) : (
          <MapPin size={15} color={theme.colors.primary[600]} strokeWidth={2.2} />
        )}
        <Text style={[theme.text.bodySmall, styles.addressText]} numberOfLines={2}>
          {isResolving ? 'Finding address…' : address ?? 'Move the map to set your location'}
        </Text>
      </View>
    </View>
  );
};

export default LocationMapPicker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    backgroundColor: theme.colors.neutral[100],
  },
  centerPinWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -40,
    alignItems: 'center',
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: theme.colors.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.md,
  },
  pinShadow: {
    width: 8,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(15,23,42,0.35)',
    marginTop: 2,
  },
  locateButton: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  addressBar: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    top: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.surface.base,
    ...theme.elevation.sm,
  },
  addressText: {
    flex: 1,
    color: theme.colors.text.primary,
  },
});
