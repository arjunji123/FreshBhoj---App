import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '@features/home/screens/Home';
import FoodFeed from '@features/foodfeed/screens/FoodFeed';
import Profile from '@features/profile/screens/Profile';
import type { MainTabParamList } from '../navigation.types';
import BottomTabBar from './BottomTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="FoodFeed" component={FoodFeed} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
