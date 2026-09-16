import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import KitchenDashboard from '@features/kitchenPartner/screens/KitchenDashboard';
import KitchenOrders from '@features/kitchenPartner/screens/KitchenOrders';
import KitchenMenu from '@features/kitchenPartner/screens/KitchenMenu';
import KitchenStories from '@features/kitchenPartner/screens/KitchenStories';
import KitchenProfile from '@features/kitchenPartner/screens/KitchenProfile';
import type { KitchenTabParamList } from '../navigation.types';
import KitchenTabBar from './KitchenTabBar';

const Tab = createBottomTabNavigator<KitchenTabParamList>();

export function KitchenTabNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <KitchenTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="KitchenDashboard" component={KitchenDashboard} />
      <Tab.Screen name="KitchenOrders" component={KitchenOrders} />
      <Tab.Screen name="KitchenMenu" component={KitchenMenu} />
      <Tab.Screen name="KitchenStories" component={KitchenStories} />
      <Tab.Screen name="KitchenProfile" component={KitchenProfile} />
    </Tab.Navigator>
  );
}
