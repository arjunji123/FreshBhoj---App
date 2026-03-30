import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '@features/home/screens/Home';
import Search from '@features/search/screens/Search';
import FoodFeed from '@features/foodfeed/screens/FoodFeed';
import Subscriptions from '@features/subscriptions/screens/Subscriptions';
import Profile from '@features/profile/screens/Profile';
import BottomTabBar from './BottomTabBar';

const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="FoodFeed" component={FoodFeed} />
      <Tab.Screen name="Subscriptions" component={Subscriptions} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
