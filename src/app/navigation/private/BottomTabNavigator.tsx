import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '@features/home/screens/Home';
import FoodFeed from '@features/foodfeed/screens/FoodFeed';
import Profile from '@features/profile/screens/Profile';
import FitHub from '@features/fit/screens/FitHub';
import type { MainTabParamList } from '../navigation.types';
import BottomTabBar from './BottomTabBar';

/** Never rendered: the tab press is intercepted and routed to the `Orders` stack screen. */
const OrdersTabPlaceholder = () => null;

const Tab = createBottomTabNavigator<MainTabParamList>();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Fit" component={FitHub} />
      {/* Bhoj Feed sits in the centre slot (index 2 of 5). */}
      <Tab.Screen name="FoodFeed" component={FoodFeed} />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersTabPlaceholder}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent()?.navigate('Orders');
          },
        })}
      />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
