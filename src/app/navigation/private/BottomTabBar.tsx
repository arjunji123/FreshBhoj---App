import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { Play } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import AppGradient from '@components/AppGradient';
import GradientText from '@components/GradientText';
import { theme } from '@app/theme/index';

const TAB_ICONS: Record<string, { active: ImageSourcePropType; inactive: ImageSourcePropType; label: string }> = {
  Home: {
    active: require('@assets/images/bottom_tab_icons/home.png'),
    inactive: require('@assets/images/bottom_tab_icons/home_inactive.png'),
    label: 'Home',
  },
  Search: {
    active: require('@assets/images/bottom_tab_icons/search.png'),
    inactive: require('@assets/images/bottom_tab_icons/search_inacitve.png'),
    label: 'Search',
  },
  Subscriptions: {
    active: require('@assets/images/bottom_tab_icons/subscription.png'),
    inactive: require('@assets/images/bottom_tab_icons/subscription_inactive.png'),
    label: 'Subscriptions',
  },
  Profile: {
    active: require('@assets/images/bottom_tab_icons/profile.png'),
    inactive: require('@assets/images/bottom_tab_icons/profile_inactive.png'),
    label: 'Profile',
  },
};

const ACTIVE_COLOR = theme.colors.gradient2;
const INACTIVE_COLOR = '#94A3B8';

const BottomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      <View style={styles.separator} />
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isFoodFeed = route.name === 'FoodFeed';

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

          if (isFoodFeed) {
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={onPress}
                activeOpacity={0.8}
              >
                <View style={styles.foodFeedOuter}>
                  <AppGradient
                    colors={theme.colors.defaultColor}
                    locations={theme.colors.defaultLocations}
                    direction="diagonal"
                    style={styles.foodFeedButton}
                  >
                    <Play size={24} color={theme.colors.palette.white} fill={theme.colors.palette.white} strokeWidth={0} />
                  </AppGradient>
                </View>
                <GradientText
                  colors = { isFocused ? theme.colors.defaultColor : [INACTIVE_COLOR, INACTIVE_COLOR, INACTIVE_COLOR] }
                  direction="diagonal"
                  style={styles.label}>
                  Food Feed
                </GradientText>
              </TouchableOpacity>
            );
          }

          const tabIcon = TAB_ICONS[route.name];
          if (!tabIcon) return null;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Image
                source={isFocused ? tabIcon.active : tabIcon.inactive}
                style={styles.icon}
                resizeMode="contain"
              />
              <GradientText
                colors = { isFocused ? theme.colors.defaultColor : [INACTIVE_COLOR, INACTIVE_COLOR, INACTIVE_COLOR] }
                direction="diagonal"
                style={styles.label}>
                {tabIcon.label}
              </GradientText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomTabBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.palette.white,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: ACTIVE_COLOR,
  },
  labelInactive: {
    color: INACTIVE_COLOR,
  },
  foodFeedOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
  },
  foodFeedButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.Shadows.medium,
  },
});
