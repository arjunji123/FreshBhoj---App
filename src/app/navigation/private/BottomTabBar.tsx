import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Home, Play, Receipt, Search, User } from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import AppGradient from '@components/AppGradient';
import { useActiveOrders } from '@features/orders/hooks/useOrders';
import { useTheme } from '@app/theme/useTheme';

type IconProps = { color: string; size: number; strokeWidth: number };

const TABS: Record<string, { label: string; Icon: React.FC<IconProps> }> = {
  Home: { label: 'Home', Icon: Home },
  Search: { label: 'Search', Icon: Search },
  Orders: { label: 'Orders', Icon: Receipt },
  Profile: { label: 'Profile', Icon: User },
};

const BAR_HEIGHT = 64;
const SIDE_GUTTER = 14;
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
  const ACTIVE_COLOR = theme.colors.primary[600];
  const INACTIVE_COLOR = theme.colors.neutral[400];
  const insets = useSafeAreaInsets();
  const { data: activeOrders } = useActiveOrders();

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

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: visible.value,
    transform: [{ translateX: x.value }],
  }));

  const onRowLayout = (e: LayoutChangeEvent) => setRowWidth(e.nativeEvent.layout.width);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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
                      <Play
                        size={22}
                        color={theme.colors.text.inverse}
                        fill={theme.colors.text.inverse}
                        strokeWidth={0}
                      />
                    </AppGradient>
                  </View>
                  <Text
                    style={[
                      styles.label,
                      styles.feedLabel,
                      { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR },
                    ]}
                  >
                    Feed
                  </Text>
                </Pressable>
              );
            }

            const tab = TABS[route.name];
            if (!tab) return null;

            const { Icon } = tab;
            const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;
            const badgeCount = route.name === 'Orders' ? activeOrders?.length ?? 0 : 0;

            return (
              <Pressable
                key={route.key}
                style={styles.tabItem}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isFocused }}
              >
                <View>
                  <Icon size={22} color={color} strokeWidth={isFocused ? 2.4 : 2} />
                  {badgeCount > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.label, isFocused ? styles.labelActive : null, { color }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default BottomTabBar;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface.page,
    paddingHorizontal: SIDE_GUTTER,
    paddingTop: theme.spacing.sm,
  },
  bar: {
    height: BAR_HEIGHT,
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
    borderRadius: 24,
    backgroundColor: theme.colors.surface.brandWash,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    ...theme.text.caption,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  labelActive: {
    fontWeight: '700',
  },
  feedLabel: {
    marginTop: -5,
  },
  feedOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface.raised,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -34,
    ...theme.elevation.sm,
  },
  feedButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.elevation.primary,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.surface.raised,
  },
  badgeText: {
    ...theme.text.caption,
    fontSize: 9,
    lineHeight: 12,
    color: theme.colors.text.inverse,
  },
});
