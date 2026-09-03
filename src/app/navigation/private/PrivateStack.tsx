import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { PrivateStackParamList } from '../navigation.types';
import { BottomTabNavigator } from './BottomTabNavigator';

// Discovery
import MealDetail from '@features/meals/screens/MealDetail';
import KitchenProfile from '@features/kitchens/screens/KitchenProfile';
import KitchenGallery from '@features/kitchens/screens/KitchenGallery';
import KitchenReviews from '@features/kitchens/screens/KitchenReviews';
import ReelViewer from '@features/foodfeed/screens/ReelViewer';
import Favorites from '@features/profile/screens/Favorites';
import FollowedKitchens from '@features/profile/screens/FollowedKitchens';

// Ordering
import Cart from '@features/cart/screens/Cart';
import Checkout from '@features/cart/screens/Checkout';
import PaymentProcessing from '@features/orders/screens/PaymentProcessing';
import OrderConfirmation from '@features/orders/screens/OrderConfirmation';
import OrderTracking from '@features/orders/screens/OrderTracking';
import OrderDetail from '@features/orders/screens/OrderDetail';
import WriteReview from '@features/reviews/screens/WriteReview';

// Account
import Addresses from '@features/profile/screens/Addresses';
import AddressForm from '@features/profile/screens/AddressForm';
import Support from '@features/profile/screens/Support';
import Settings from '@features/profile/screens/Settings';
import EditProfile from '@features/profile/screens/EditProfile';

const Stack = createNativeStackNavigator<PrivateStackParamList>();

export function PrivateTabs() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // Native slide keeps transitions at 60fps without a JS animation cost.
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      <Stack.Screen name="MealDetail" component={MealDetail} />
      <Stack.Screen name="KitchenProfile" component={KitchenProfile} />
      <Stack.Screen
        name="KitchenGallery"
        component={KitchenGallery}
        options={{ animation: 'fade', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="KitchenReviews" component={KitchenReviews} />
      <Stack.Screen
        name="ReelViewer"
        component={ReelViewer}
        options={{ animation: 'fade', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="Favorites" component={Favorites} />
      <Stack.Screen name="FollowedKitchens" component={FollowedKitchens} />

      <Stack.Screen name="Cart" component={Cart} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen
        name="PaymentProcessing"
        component={PaymentProcessing}
        // No swipe-back mid-payment — leaving the screen would strand the order.
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmation}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="OrderTracking" component={OrderTracking} />
      <Stack.Screen name="OrderDetail" component={OrderDetail} />
      <Stack.Screen
        name="WriteReview"
        component={WriteReview}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />

      <Stack.Screen name="Addresses" component={Addresses} />
      <Stack.Screen name="AddressForm" component={AddressForm} />
      <Stack.Screen name="Support" component={Support} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
  );
}
