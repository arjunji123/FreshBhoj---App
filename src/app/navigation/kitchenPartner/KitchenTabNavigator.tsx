import React from 'react';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import KitchenDashboard from '@features/kitchenPartner/screens/KitchenDashboard';
import KitchenOrders from '@features/kitchenPartner/screens/KitchenOrders';
import KitchenMenu from '@features/kitchenPartner/screens/KitchenMenu';
import KitchenStories from '@features/kitchenPartner/screens/KitchenStories';
import KitchenReels from '@features/kitchenPartner/screens/KitchenReels';
import KitchenProfile from '@features/kitchenPartner/screens/KitchenProfile';
import type { KitchenTabParamList } from '../navigation.types';
import KitchenTabBar from './KitchenTabBar';

const Tab = createBottomTabNavigator<KitchenTabParamList>();

// Defined at module level so React Navigation gets a stable component type
// (an inline arrow would remount the tab bar on every navigator render).
const renderKitchenTabBar = (props: BottomTabBarProps) => <KitchenTabBar {...props} />;

export function KitchenTabNavigator() {
  return (
    <Tab.Navigator tabBar={renderKitchenTabBar} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="KitchenDashboard" component={KitchenDashboard} />
      <Tab.Screen name="KitchenOrders" component={KitchenOrders} />
      <Tab.Screen name="KitchenMenu" component={KitchenMenu} />
      <Tab.Screen name="KitchenStories" component={KitchenStories} />
      <Tab.Screen name="KitchenReels" component={KitchenReels} />
      <Tab.Screen name="KitchenProfile" component={KitchenProfile} />
    </Tab.Navigator>
  );
}
