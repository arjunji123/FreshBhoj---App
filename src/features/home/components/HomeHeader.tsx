import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, ChevronDown, MapPin, Search, ShoppingBag } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import AppGradient from '@components/AppGradient';
import { theme } from '@app/theme/index';
import { useAuthStore } from '@features/authentication/store/authStore';
import { HOME_COPY, SCROLL_THRESHOLD, TOP_ROW_HEIGHT } from '../home.constants';
import type { HomeHeaderProps } from '../home.types';

/**
 * Brand-gradient header that collapses as the feed scrolls: the greeting and
 * location row fade away, the curved bottom tightens, and the search bar stays
 * pinned — so search is always one tap away without eating the viewport.
 */
const HomeHeader = ({
  scrollY,
  cartCount = 0,
  onPressLocation,
  onPressSearch,
  onPressProfile,
  onPressCart,
}: HomeHeaderProps) => {
  const insets = useSafeAreaInsets();
  const location = useAuthStore((s) => s.location);
  const fullName = useAuthStore((s) => s.fullName);

  const firstName = fullName?.trim().split(' ')[0];
  const locationLabel = location.locality || location.address || 'Set your area';

  const topRowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [1, 0], Extrapolation.CLAMP),
    height: interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [TOP_ROW_HEIGHT, 0],
      Extrapolation.CLAMP,
    ),
    marginBottom: interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [0, -12], Extrapolation.CLAMP),
    overflow: 'hidden' as const,
  }));

  const containerStyle = useAnimatedStyle(() => {
    const radius = interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [32, 18], Extrapolation.CLAMP);
    return {
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
      overflow: 'hidden' as const,
    };
  });

  return (
    <Animated.View style={containerStyle}>
      <AppGradient
        colors={theme.colors.gradients.brand}
        locations={theme.colors.gradients.brandLocations}
        direction="vertical"
        style={[styles.container, { paddingTop: insets.top + theme.spacing.md }]}
      >
        <Animated.View style={[styles.topRow, topRowStyle]}>
          <Pressable
            style={styles.locationContainer}
            onPress={onPressLocation}
            accessibilityRole="button"
            accessibilityLabel="Change delivery area"
          >
            <MapPin
              size={18}
              color={theme.colors.text.inverse}
              fill={theme.colors.text.inverse}
              strokeWidth={2}
            />
            <View style={styles.locationText}>
              <Text style={[theme.text.caption, styles.greeting]} numberOfLines={1}>
                {firstName ? `Hi ${firstName} · Delivering to` : 'DELIVERING TO'}
              </Text>
              <View style={styles.addressRow}>
                <Text style={[theme.text.h4, styles.address]} numberOfLines={1}>
                  {locationLabel}
                </Text>
                <ChevronDown size={15} color={theme.colors.text.inverse} strokeWidth={2.5} />
              </View>
            </View>
          </Pressable>

          <View style={styles.actions}>
            <Pressable
              style={styles.iconButton}
              onPress={onPressCart}
              accessibilityRole="button"
              accessibilityLabel="Cart"
            >
              <ShoppingBag size={19} color={theme.colors.text.inverse} strokeWidth={2} />
              {cartCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              ) : null}
            </Pressable>

            <Pressable
              style={styles.iconButton}
              onPress={onPressProfile}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Bell size={19} color={theme.colors.text.inverse} strokeWidth={2} />
            </Pressable>
          </View>
        </Animated.View>

        <Pressable
          style={styles.searchBar}
          onPress={onPressSearch}
          accessibilityRole="search"
          accessibilityLabel={HOME_COPY.searchPlaceholder}
        >
          <Search size={18} color={theme.colors.text.tertiary} strokeWidth={2.2} />
          <Text style={[theme.text.body, styles.searchPlaceholder]}>
            {HOME_COPY.searchPlaceholder}
          </Text>
        </Pressable>
      </AppGradient>
    </Animated.View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  locationText: {
    flex: 1,
  },
  greeting: {
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 0.4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    color: theme.colors.text.inverse,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.overlay.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 3,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.amber[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...theme.text.caption,
    fontSize: 9,
    lineHeight: 12,
    color: theme.colors.text.inverse,
  },
  searchBar: {
    height: 50,
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    ...theme.elevation.sm,
  },
  searchPlaceholder: {
    color: theme.colors.text.tertiary,
  },
});
