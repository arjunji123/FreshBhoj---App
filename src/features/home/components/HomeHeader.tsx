import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bell, ChevronDown, Gift, MapPin, Search, ShoppingBag } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import AppGradient from '@components/AppGradient';
import PressableScale from '@animations/PressableScale';
import { theme as staticTheme } from '@app/theme/index';
import { useAuthStore } from '@features/authentication/store/authStore';
import {
  HOME_COPY,
  SCROLL_THRESHOLD,
  SEARCH_HINTS,
  SEARCH_HINT_INTERVAL_MS,
  TOP_ROW_HEIGHT,
} from '../home.constants';
import type { HomeHeaderProps } from '../home.types';
import { useTheme } from '@app/theme/useTheme';

/** The header is brand-teal in both themes, so its foreground is always white. */
const ON_BRAND = staticTheme.colors.neutral[0];

/**
 * Brand-gradient header that collapses as the feed scrolls: the greeting and
 * location block fade and fold away, the curved bottom tightens, and the
 * search pill stays pinned — so search is always one tap away.
 */
const HomeHeader = ({
  scrollY,
  cartCount = 0,
  notificationCount = 0,
  onPressLocation,
  onPressSearch,
  onPressNotifications,
  onPressCart,
  onPressReferral,
}: HomeHeaderProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const location = useAuthStore((s) => s.location);
  const fullName = useAuthStore((s) => s.fullName);
  const searchRef = useRef<View>(null);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setHintIndex((i) => (i + 1) % SEARCH_HINTS.length),
      SEARCH_HINT_INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, []);

  const firstName = fullName?.trim().split(' ')[0];
  const locationLabel = location.locality || location.address || 'Set your area';

  const handlePressSearch = useCallback(() => {
    const node = searchRef.current;
    if (!node) {
      onPressSearch?.({ x: 0, y: 0, width: 0, height: 0 });
      return;
    }
    node.measureInWindow((x, y, width, height) => onPressSearch?.({ x, y, width, height }));
  }, [onPressSearch]);

  const topRowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, SCROLL_THRESHOLD * 0.7], [1, 0], Extrapolation.CLAMP),
    height: interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [TOP_ROW_HEIGHT, 0],
      Extrapolation.CLAMP,
    ),
    marginBottom: interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [0, -theme.spacing.md], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [0, -8], Extrapolation.CLAMP) },
    ],
    overflow: 'hidden' as const,
  }));

  const containerStyle = useAnimatedStyle(() => {
    const radius = interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [32, 20], Extrapolation.CLAMP);
    return {
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
      overflow: 'hidden' as const,
    };
  });

  return (
    <Animated.View style={[styles.shadow, containerStyle]}>
      <AppGradient
        colors={theme.colors.gradients.brand}
        locations={theme.colors.gradients.brandLocations}
        direction="diagonal"
        style={[styles.container, { paddingTop: insets.top + theme.spacing.md }]}
      >
        <View pointerEvents="none" style={styles.orbLarge} />
        <View pointerEvents="none" style={styles.orbSmall} />

        <Animated.View style={[styles.topRow, topRowStyle]}>
          <PressableScale
            style={styles.locationContainer}
            onPress={onPressLocation}
            scaleTo={0.98}
            haptic={false}
            accessibilityRole="button"
            accessibilityLabel="Change delivery area"
          >
            <Text style={[theme.text.h1, styles.greeting]} numberOfLines={1}>
              {firstName ? `Hi, ${firstName}` : 'Welcome'}
            </Text>
            <View style={styles.addressRow}>
              <MapPin size={14} color={ON_BRAND} strokeWidth={2.4} />
              <Text style={[theme.text.label, styles.address]} numberOfLines={1}>
                {locationLabel}
              </Text>
              <ChevronDown size={14} color={ON_BRAND} strokeWidth={2.6} />
            </View>
          </PressableScale>

          <View style={styles.actions}>
            <PressableScale
              onPress={onPressReferral}
              style={styles.iconButton}
              hitSlop={theme.layout.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Refer and earn"
            >
              <Gift size={18} color={ON_BRAND} strokeWidth={2.2} />
              <View style={styles.accentDot} />
            </PressableScale>

            <PressableScale
              style={styles.iconButton}
              hitSlop={theme.layout.hitSlop}
              onPress={onPressCart}
              accessibilityRole="button"
              accessibilityLabel="Cart"
            >
              <ShoppingBag size={18} color={ON_BRAND} strokeWidth={2.2} />
              {cartCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              ) : null}
            </PressableScale>

            <PressableScale
              style={styles.iconButton}
              hitSlop={theme.layout.hitSlop}
              onPress={onPressNotifications}
              accessibilityRole="button"
              accessibilityLabel={
                notificationCount > 0 ? `Notifications, ${notificationCount} unread` : 'Notifications'
              }
            >
              <Bell size={18} color={ON_BRAND} strokeWidth={2.2} />
              {notificationCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
                </View>
              ) : null}
            </PressableScale>
          </View>
        </Animated.View>

        <View ref={searchRef} collapsable={false} style={styles.searchWrap}>
        <PressableScale
          onPress={handlePressSearch}
          scaleTo={0.985}
          haptic={false}
          accessibilityRole="search"
          accessibilityLabel={`Search. ${SEARCH_HINTS[hintIndex]}`}
          style={styles.searchBar}
        >
          <View style={styles.searchInner}>
            <View style={styles.searchIconWrap}>
              <Search size={16} color={theme.colors.primary[700]} strokeWidth={2.4} />
            </View>
            <View style={styles.hintWrap}>
              <Animated.Text
                key={hintIndex}
                entering={FadeIn.duration(380)}
                exiting={FadeOut.duration(260)}
                style={[theme.text.body, styles.searchPlaceholder]}
                numberOfLines={1}
              >
                {SEARCH_HINTS[hintIndex] ?? HOME_COPY.searchPlaceholder}
              </Animated.Text>
            </View>
          </View>
        </PressableScale>
        </View>
      </AppGradient>
    </Animated.View>
  );
};

export default HomeHeader;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    shadow: {
      backgroundColor: theme.colors.primary[900],
    },
    container: {
      paddingHorizontal: theme.layout.screenPadding,
      paddingBottom: theme.spacing.lg,
    },
    orbLarge: {
      position: 'absolute',
      width: 220,
      height: 220,
      borderRadius: 110,
      top: -90,
      right: -70,
      backgroundColor: theme.colors.overlay.glass,
      opacity: 0.35,
    },
    orbSmall: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      bottom: -50,
      left: -30,
      backgroundColor: theme.colors.overlay.glass,
      opacity: 0.25,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    locationContainer: {
      flex: 1,
      gap: 2,
    },
    greeting: {
      color: ON_BRAND,
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    address: {
      color: ON_BRAND,
      opacity: 0.9,
      flexShrink: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.overlay.glass,
      borderWidth: 1,
      borderColor: theme.colors.overlay.glassStrong,
      justifyContent: 'center',
      alignItems: 'center',
    },
    accentDot: {
      position: 'absolute',
      top: 8,
      right: 9,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.amber[300],
    },
    badge: {
      position: 'absolute',
      top: 2,
      right: 1,
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
      color: ON_BRAND,
    },
    searchBar: {
      height: 54,
      backgroundColor: theme.colors.surface.base,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.sm,
      justifyContent: 'center',
      ...theme.elevation.md,
    },
    searchWrap: {
      marginTop: theme.spacing.md,
    },
    searchInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    searchIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.brandWash,
    },
    hintWrap: {
      flex: 1,
      height: 24,
      justifyContent: 'center',
    },
    searchPlaceholder: {
      position: 'absolute',
      left: 0,
      right: 0,
      color: theme.colors.text.tertiary,
    },
  });
