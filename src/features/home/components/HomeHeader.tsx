import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MapPin, Bell, Search, Mic, ChevronDown, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import AppGradient from '@components/AppGradient';
import { theme } from '@app/theme/index';
import { useAuthStore } from '@features/authentication/store/authStore';
import { TOP_ROW_HEIGHT, SCROLL_THRESHOLD } from '../home.constants';
import type { HomeHeaderProps } from '../home.types';

const HomeHeader = ({ scrollY }: HomeHeaderProps) => {
  const insets = useSafeAreaInsets();
  const address = useAuthStore((s) => s.location.address);

  const topRowAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [1, 0],
      Extrapolation.CLAMP,
    );
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [TOP_ROW_HEIGHT, 0],
      Extrapolation.CLAMP,
    );
    const marginBottom = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [0, -16],
      Extrapolation.CLAMP,
    );
    return { opacity, height, marginBottom, overflow: 'hidden' as const };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [40, 20],
      Extrapolation.CLAMP,
    );
    return {
      borderBottomLeftRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
      overflow: 'hidden' as const,
    };
  });

  return (
    <Animated.View style={containerAnimatedStyle}>
      <AppGradient
        colors={theme.colors.defaultColor}
        locations={theme.colors.defaultLocations}
        direction="vertical"
        style={[styles.container, { paddingTop: insets.top + 12 }]}
      >
      {/* Top Row: Location + Notification + Avatar */}
      <Animated.View style={[styles.topRow, topRowAnimatedStyle]}>
        {/* Location */}
        <View style={styles.locationContainer}>
          <MapPin size={20} color={theme.colors.palette.white} fill={theme.colors.palette.white} strokeWidth={2} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
            <TouchableOpacity style={styles.addressRow} activeOpacity={0.7}>
              <Text style={styles.addressText} numberOfLines={1}>
                {address || 'Location not given'}
              </Text>
              <ChevronDown size={16} color={theme.colors.palette.white} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Icons */}
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
            <Bell size={20} color={theme.colors.palette.white} strokeWidth={2} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarButton} activeOpacity={0.7}>
            <User size={20} color={theme.colors.palette.white} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for Tiffins, Meals or Kitchens..."
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
          />
          <TouchableOpacity activeOpacity={0.7}>
            <Mic size={20} color={theme.colors.gradient2} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </AppGradient>
    </Animated.View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: theme.colors.palette.white,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBBF24',
    borderWidth: 1.5,
    borderColor: theme.colors.gradient1,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  searchContainer: {
    marginTop: 16,
  },
  searchBar: {
    height: 50,
    backgroundColor: theme.colors.palette.white,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: '#0F172A',
    padding: 0,
  },
});
