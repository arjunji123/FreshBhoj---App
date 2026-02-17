import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '@features/home/screens/Home';

const Tab = createBottomTabNavigator();

export function PrivateTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} options={{headerShown: false}} />
      {/* Orders, Reels, Profile later */}
    </Tab.Navigator>
  );
}
