import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { FeedPlayIcon, HomeTabIcon, ProfileTabIcon } from '@components/icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import AppGradient from '@components/AppGradient';
import { useTheme } from '@app/theme/useTheme';
import { useThemeStore } from '@app/theme/themeStore';
import {
  TAB_BAR_HEIGHT,
  TAB_BAR_TOGGLE,
  useTabBarBottomGap,
  useTabBarVisibility,
} from './tabBarVisibility';

type TabIconComponent = React.FC<{ size?: number; color?: string; active?: boolean }>;

const TABS: Record<string, { label: string; Icon: TabIconComponent }> = {
  Home: { label: 'Home', Icon: HomeTabIcon },
  Profile: { label: 'Profile', Icon: ProfileTabIcon },
};

const BAR_WIDTH = 264;
/** Extra slide distance so the raised Feed button clears the screen edge too. */
const HIDE_OVERSHOOT = 40;
const INDICATOR_INSET = 6;
const SLIDE = { duration: 260, easing: Easing.out(Easing.cubic) } as const;

/**
 * Floating pill tab bar: detached from the screen edges, rounded, softly
 * lifted. A single tinted pill slides (no overshoot) behind the active tab
 * while the Food Feed button stays raised in the centre, notched into the bar.
 */
const BottomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDark = useThemeStore((s) => s.resolvedScheme) === 'dark';
  const ACTIVE_COLOR = theme.colors.text.brand;
  // neutral[400] is too close to the raised dark surface to read as an icon/label.
  const INACTIVE_COLOR = isDark ? theme.colors.neutral[600] : theme.colors.neutral[400];
  const bottomGap = useTabBarBottomGap();
  const hidden = useTabBarVisibility((s) => s.hidden);
  const setHidden = useTabBarVisibility((s) => s.setHidden);
  const hideProgress = useSharedValue(0);

  const [rowWidth, setRowWidth] = useState(0);
  const slotWidth = rowWidth / state.routes.length;
  const activeRoute = state.routes[state.index]?.name;
  const hasIndicator = activeRoute !== 'FoodFeed';

  const x = useSharedValue(0);
  const visible = useSharedValue(0);

  useEffect(() => {
    if (!slotWidth) return;
    if (hasIndicator) {
      // First placement snaps into position; later changes slide.
      x.value = visible.value === 0 ? state.index * slotWidth : withTiming(state.index * slotWidth, SLIDE);
    }
    visible.value = withTiming(hasIndicator ? 1 : 0, { duration: 180 });
  }, [state.index, slotWidth, hasIndicator, x, visible]);

  // Always reveal the bar when the active tab changes.
  useEffect(() => {
    setHidden(false);
  }, [state.index, setHidden]);

  useEffect(() => {
    hideProgress.value = withTiming(hidden ? 1 : 0, TAB_BAR_TOGGLE);
  }, [hidden, hideProgress]);

  const shift = TAB_BAR_HEIGHT + bottomGap + HIDE_OVERSHOOT;
  const containerAnimStyle = useAnimatedStyle(() => ({
    opacity: 1 - hideProgress.value,
    transform: [{ translateY: hideProgress.value * shift }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: visible.value,
    transform: [{ translateX: x.value }],
  }));

  const onRowLayout = (e: LayoutChangeEvent) => setRowWidth(e.nativeEvent.layout.width);

  return (
    <Animated.View
      pointerEvents={hidden ? 'none' : 'box-none'}
      style={[styles.container, { paddingBottom: bottomGap }, containerAnimStyle]}
    >
      <View style={styles.bar}>
        <View style={styles.tabRow} onLayout={onRowLayout}>
          {slotWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.indicator,
                { width: slotWidth - INDICATOR_INSET * 2, left: INDICATOR_INSET },
                indicatorStyle,
              ]}
            />
          ) : null}

          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            if (route.name === 'FoodFeed') {
              return (
                <Pressable
                  key={route.key}
                  style={styles.tabItem}
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityLabel="Food Feed"
                  accessibilityState={{ selected: isFocused }}
                >
                  <View style={styles.feedOuter}>
                    <AppGradient
                      colors={theme.colors.gradients.brand}
                      locations={theme.colors.gradients.brandLocations}
                      direction="diagonal"
                      style={styles.feedButton}
                    >
                      <AppGradient
                        colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
                        direction="vertical"
                        style={styles.feedGloss}
                      />
                      <FeedPlayIcon size={34} color={theme.colors.palette.white} />
                    </AppGradient>
                  </View>
                  <Text
                    style={[
                      styles.label,
                      styles.feedLabel,
                      isFocused ? styles.labelActive : null,
                      { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR },
                    ]}
                  >
                    Reels
                  </Text>
                </Pressable>
              );
            }

            const tab = TABS[route.name];
            if (!tab) return null;

            const { Icon } = tab;
            const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

            return (
              <Pressable
                key={route.key}
                style={styles.tabItem}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isFocused }}
              >
                <Icon size={24} color={color} active={isFocused} />
                {isFocused ? (
                  <Text style={[styles.label, styles.labelActive, { color }]} numberOfLines={1}>
                    {tab.label}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
};

export default BottomTabBar;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    width: BAR_WIDTH,
    height: TAB_BAR_HEIGHT,
    borderRadius: 32,
    backgroundColor: theme.colors.surface.raised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borders.subtle,
    ...theme.elevation.lg,
  },
  tabRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    borderRadius: 22,
    backgroundColor: theme.colors.surface.brandWash,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    ...theme.text.caption,
    fontSize: 12,
    letterSpacing: 0.1,
  },
  labelActive: {
    fontWeight: '700',
  },
  feedOuter: {
    position: 'absolute',
    top: -34,
    alignSelf: 'center',
    width: 68,
    height: 68,
    borderRadius: 26,
    backgroundColor: theme.colors.surface.raised,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.elevation.sm,
  },
  feedButton: {
    width: 58,
    height: 58,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary[700],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  feedGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
  },
  feedLabel: {
    position: 'absolute',
    bottom: 7,
    alignSelf: 'center',
  },
});
