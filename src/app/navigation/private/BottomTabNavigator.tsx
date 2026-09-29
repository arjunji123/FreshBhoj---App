import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '@features/home/screens/Home';
import Search from '@features/search/screens/Search';
import FoodFeed from '@features/foodfeed/screens/FoodFeed';
import OrdersAndSubscriptions from '@features/orders/screens/OrdersAndSubscriptions';
import Profile from '@features/profile/screens/Profile';
import type { MainTabParamList } from '../navigation.types';
import BottomTabBar from './BottomTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="FoodFeed" component={FoodFeed} />
      <Tab.Screen name="Orders" component={OrdersAndSubscriptions} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
