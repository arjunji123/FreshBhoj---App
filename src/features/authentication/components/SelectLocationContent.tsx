import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Check, MapPin, Navigation, Search, Sparkles } from 'lucide-react-native';
import { catalogApi, qk } from '@api';
import type { ServiceableArea } from '@api/types';
import { theme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';
import { Button, Input } from '@components/ui';
import { AUTH_COPY } from '../auth.constants';
import { useAuthStore } from '../store/authStore';
import { useSaveOnboardingLocation } from '../hooks/useAuth';

interface SelectLocationContentProps {
  onSaveAndContinue: () => void;
}

/**
 * Single-city launch, so this is an area picker rather than a map search.
 *
 * A locality we don't serve is not treated as an error: the list simply comes
 * back empty and we show a warm "not here yet" panel that still offers the
 * nearby areas we *do* cover, so the flow never dead-ends.
 */
const SelectLocationContent: React.FC<SelectLocationContentProps> = ({ onSaveAndContinue }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ServiceableArea | null>(null);

  const setLocation = useAuthStore((s) => s.setLocation);
  const saveLocation = useSaveOnboardingLocation();

  const areasQuery = useQuery({
    queryKey: qk.catalog.areas(search),
    queryFn: () => catalogApi.areas({ q: search || undefined, city: 'Jaipur' }),
    staleTime: 5 * 60_000,
  });

  const areas = areasQuery.data ?? [];
  const hasSearched = search.trim().length > 1;
  const showUnserved = hasSearched && !areasQuery.isFetching && areas.length === 0;

  /** With no match we still need something to offer, so fall back to all areas. */
  const allAreasQuery = useQuery({
    queryKey: qk.catalog.areas(''),
    queryFn: () => catalogApi.areas({ city: 'Jaipur' }),
    enabled: showUnserved,
    staleTime: 5 * 60_000,
  });

  const suggestions = useMemo(
    () => (showUnserved ? (allAreasQuery.data ?? []).slice(0, 4) : []),
    [showUnserved, allAreasQuery.data],
  );

  const handleSelect = (area: ServiceableArea) => {
    setSelected(area);
    setSearch('');
  };

  const handleSave = () => {
    if (!selected) return;

    setLocation({
      address: `${selected.locality}, ${selected.city}`,
      latitude: selected.latitude ?? 0,
      longitude: selected.longitude ?? 0,
      locality: selected.locality,
      city: selected.city,
      pincode: selected.pincode,
    });

    saveLocation.mutate(
      {
        latitude: selected.latitude ?? 26.9124,
        longitude: selected.longitude ?? 75.7873,
        address: `${selected.locality}, ${selected.city}`,
        city: selected.city,
        state: selected.state,
        pincode: selected.pincode,
      },
      { onSuccess: onSaveAndContinue },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[theme.text.h2, styles.title]}>{AUTH_COPY.locationTitle}</Text>
      <Text style={[theme.text.body, styles.subtitle]}>{AUTH_COPY.locationSubtitle}</Text>

      <Input
        value={search}
        onChangeText={setSearch}
        placeholder={AUTH_COPY.locationSearchPlaceholder}
        leftIcon={<Search size={18} color={theme.colors.text.tertiary} strokeWidth={2.2} />}
        rightIcon={
          areasQuery.isFetching ? (
            <ActivityIndicator size="small" color={theme.colors.primary[600]} />
          ) : (
            <Navigation size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />
          )
        }
        containerStyle={styles.search}
        returnKeyType="search"
        autoCorrect={false}
      />

      {selected ? (
        <View style={styles.selectedCard}>
          <View style={styles.selectedPin}>
            <MapPin size={16} color={theme.colors.text.inverse} strokeWidth={2.4} fill={theme.colors.text.inverse} />
          </View>
          <View style={styles.selectedText}>
            <Text style={[theme.text.overline, styles.selectedLabel]}>DELIVERING TO</Text>
            <Text style={theme.text.h4} numberOfLines={1}>
              {selected.locality}, {selected.city}
            </Text>
            <Text style={[theme.text.caption, styles.selectedPin_code]}>{selected.pincode}</Text>
          </View>
          <Pressable onPress={() => setSelected(null)} hitSlop={theme.layout.hitSlop}>
            <Text style={[theme.text.label, styles.changeLink]}>Change</Text>
          </Pressable>
        </View>
      ) : showUnserved ? (
        <UnservedPanel suggestions={suggestions} onSelect={handleSelect} />
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {areas.map((area) => (
            <Pressable
              key={area.id}
              onPress={() => handleSelect(area)}
              style={({ pressed }) => [styles.areaRow, pressed ? styles.areaRowPressed : null]}
            >
              <View style={styles.areaIcon}>
                <MapPin size={16} color={theme.colors.primary[600]} strokeWidth={2.2} />
              </View>
              <View style={styles.areaText}>
                <Text style={theme.text.h4}>{area.locality}</Text>
                <Text style={[theme.text.caption, styles.areaMeta]}>
                  {area.city} · {area.pincode}
                </Text>
              </View>
              <Check size={18} color={theme.colors.neutral[300]} strokeWidth={2.4} />
            </Pressable>
          ))}

          {areasQuery.isLoading ? (
            <ActivityIndicator style={styles.loader} color={theme.colors.primary[600]} />
          ) : null}
        </ScrollView>
      )}

      <View style={styles.mapPreview}>
        <Image
          source={require('@assets/images/map_view.png')}
          style={styles.mapImage}
          resizeMode="cover"
        />
        <View style={styles.mapPinOverlay}>
          <AppGradient
            colors={theme.colors.gradients.brand}
            locations={theme.colors.gradients.brandLocations}
            direction="diagonal"
            style={styles.mapPin}
          >
            <View style={styles.mapPinDot} />
          </AppGradient>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={AUTH_COPY.locationSave}
          onPress={handleSave}
          disabled={!selected}
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

/** Warm, on-brand version of "we don't deliver here" — never a dead end. */
const UnservedPanel: React.FC<{
  suggestions: ServiceableArea[];
  onSelect: (area: ServiceableArea) => void;
}> = ({ suggestions, onSelect }) => (
  <View style={styles.unserved}>
    <View style={styles.unservedIcon}>
      <Sparkles size={22} color={theme.colors.primary[600]} strokeWidth={2.2} />
    </View>
    <Text style={[theme.text.h3, styles.unservedTitle]}>{AUTH_COPY.unservedTitle}</Text>
    <Text style={[theme.text.bodySmall, styles.unservedBody]}>{AUTH_COPY.unservedBody}</Text>

    <View style={styles.suggestionRow}>
      {suggestions.map((area) => (
        <Pressable
          key={area.id}
          onPress={() => onSelect(area)}
          style={({ pressed }) => [styles.suggestionChip, pressed ? styles.areaRowPressed : null]}
        >
          <Text style={[theme.text.label, styles.suggestionText]}>{area.locality}</Text>
        </Pressable>
      ))}
    </View>
  </View>
);

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
  search: {
    marginTop: theme.spacing.lg,
  },
  list: {
    maxHeight: 208,
    marginTop: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.sm,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  areaRowPressed: {
    opacity: 0.7,
  },
  areaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaText: {
    flex: 1,
  },
  areaMeta: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  loader: {
    marginTop: theme.spacing.lg,
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface.brandWash,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.brand,
  },
  selectedPin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    flex: 1,
  },
  selectedLabel: {
    color: theme.colors.primary[600],
    marginBottom: 2,
  },
  selectedPin_code: {
    color: theme.colors.text.tertiary,
  },
  changeLink: {
    color: theme.colors.primary[600],
  },
  unserved: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
  },
  unservedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  unservedTitle: {
    textAlign: 'center',
  },
  unservedBody: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginTop: 6,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  suggestionChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.base,
    borderWidth: 1,
    borderColor: theme.colors.borders.brand,
  },
  suggestionText: {
    color: theme.colors.primary[600],
  },
  mapPreview: {
    marginTop: theme.spacing.lg,
    height: 130,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.45,
  },
  mapPinOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.md,
  },
  mapPinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surface.base,
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
