import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Home, Play, Receipt, Search, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import AppGradient from '@components/AppGradient';
import { theme } from '@app/theme/index';
import { useActiveOrders } from '@features/orders/hooks/useOrders';

type IconProps = { color: string; size: number; strokeWidth: number };

const TABS: Record<string, { label: string; Icon: React.FC<IconProps> }> = {
  Home: { label: 'Home', Icon: Home },
  Search: { label: 'Search', Icon: Search },
  Orders: { label: 'Orders', Icon: Receipt },
  Profile: { label: 'Profile', Icon: User },
};

const ACTIVE_COLOR = theme.colors.primary[600];
const INACTIVE_COLOR = theme.colors.neutral[400];

/**
 * Five-slot tab bar with the Food Feed reels button raised into the centre.
 * Icons come from lucide so the whole bar shares one stroke weight and can be
 * tinted from theme tokens (the old PNG pairs couldn't change colour).
 */
const BottomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const { data: activeOrders } = useActiveOrders();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.separator} />
      <View style={styles.tabRow}>
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
                <Icon size={22} color={color} strokeWidth={isFocused ? 2.5 : 2} />
                {badgeCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default BottomTabBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface.base,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.borders.subtle,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    ...theme.text.caption,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  feedOuter: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
  },
  feedButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    borderColor: theme.colors.surface.base,
  },
  badgeText: {
    ...theme.text.caption,
    fontSize: 9,
    lineHeight: 12,
    color: theme.colors.text.inverse,
  },
});
