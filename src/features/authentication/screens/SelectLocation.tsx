import React, { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ArrowRight, Search, Navigation, Crosshair } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Theme
import { theme } from '@app/theme/index';

// Components
import GradientButton from '@components/GradientButton';
import GradientText from '@components/GradientText';
import AppGradient from '@components/AppGradient';
import PersonalDetailsHeader from '../components/PersonalDetailsHeader';

const ICON_COLOR = '#94A3B8';
const LABEL_COLOR = '#64748B';
const INPUT_BG = '#F8FAFC';
const LOCATION_BG = 'rgba(226, 18, 29, 0.05)';
const LOCATION_BORDER = 'rgba(226, 18, 29, 0.2)';

const SelectLocation = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSaveAndContinue = () => {
    // TODO: Handle save and navigate forward
  };

  const handleUseCurrentLocation = () => {
    // TODO: Get current location
  };

  return (
    <View style={styles.screen}>
      {/* Red Gradient Header */}
      <PersonalDetailsHeader />

      {/* White Content Card */}
      <View style={styles.contentCard}>
        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Pull Handle */}
          <View style={styles.pullHandle} />

          {/* Top Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={16} color="#0F172A" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Location</Text>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <View style={styles.searchIconLeft}>
                <Search size={15} color={ICON_COLOR} strokeWidth={2} />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for your area, street..."
                placeholderTextColor={ICON_COLOR}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              <TouchableOpacity style={styles.searchIconRight} activeOpacity={0.7}>
                <Crosshair size={18} color={theme.colors.gradient2} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Use Current Location Button */}
          <View style={styles.locationButtonContainer}>
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
              activeOpacity={0.7}
            >
              <Navigation size={18} color={theme.colors.gradient2} strokeWidth={2} />
              <GradientText
                colors={theme.colors.defaultColor}
                direction="diagonal"
                style={styles.currentLocationText}
              >
                Use Current Location
              </GradientText>
            </TouchableOpacity>
          </View>

          {/* Map Preview */}
          <View style={styles.mapContainer}>
            <Image
              source={require('@assets/images/map_view.png')}
              style={styles.mapImage}
              resizeMode="cover"
            />
            {/* Map Pin Marker */}
            <View style={styles.mapPinOverlay}>
              <AppGradient
                colors={theme.colors.defaultColor}
                locations={theme.colors.defaultLocations}
                direction="diagonal"
                style={styles.mapPin}
              >
                <View style={styles.mapPinDot} />
              </AppGradient>
            </View>
          </View>

          {/* Footer Text */}
          <Text style={styles.footerText}>Finding kitchens near you...</Text>

          {/* Save & Continue Button */}
          <View style={styles.buttonContainer}>
            <GradientButton
              title="Save & Continue"
              onPress={handleSaveAndContinue}
              rightIcon={<ArrowRight size={12} color={theme.colors.palette.white} strokeWidth={2.5} />}
              style={styles.saveButton}
              textStyle={styles.saveButtonText}
            />
          </View>

          {/* Page Indicator Dots */}
          <View style={styles.dotsContainer}>
            <View style={styles.dotInactive} />
            <View style={styles.dotInactive} />
            <View style={styles.dotActive} />
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

export default SelectLocation;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.gradient1,
  },
  flex: {
    flex: 1,
  },
  contentCard: {
    flex: 1,
    backgroundColor: theme.colors.palette.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -20,
    overflow: 'hidden',
  },
  pullHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 9999,
    alignSelf: 'center',
    marginTop: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 36,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#0F172A',
    lineHeight: 28,
  },

  // Search Input
  searchContainer: {
    paddingHorizontal: 24,
    marginTop: 17,
  },
  searchInputWrapper: {
    height: 56,
    backgroundColor: INPUT_BG,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIconLeft: {
    paddingLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    color: '#0F172A',
    paddingHorizontal: 12,
    padding: 0,
  },
  searchIconRight: {
    paddingRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Current Location Button
  locationButtonContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  currentLocationButton: {
    height: 56,
    backgroundColor: LOCATION_BG,
    borderWidth: 2,
    borderColor: LOCATION_BORDER,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  currentLocationText: {
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    lineHeight: 24,
  },

  // Map Preview
  mapContainer: {
    marginHorizontal: 24,
    marginTop: 16,
    height: 161,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  mapPinOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.palette.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  mapPinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.palette.white,
  },

  // Footer
  footerText: {
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    color: LABEL_COLOR,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 0.35,
  },

  // Button
  buttonContainer: {
    paddingHorizontal: 32,
    marginTop: 24,
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 24,
  },
  saveButtonText: {
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
  },

  // Page Indicator Dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  dotInactive: {
    width: 8,
    height: 6,
    borderRadius: 9999,
    backgroundColor: '#D5AFAF',
  },
  dotActive: {
    width: 32,
    height: 6,
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: theme.colors.gradient2,
  },
});