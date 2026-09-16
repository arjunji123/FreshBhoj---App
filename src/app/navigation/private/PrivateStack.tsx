import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { PrivateStackParamList } from '../navigation.types';
import { BottomTabNavigator } from './BottomTabNavigator';

// Discovery
import MealDetail from '@features/meals/screens/MealDetail';
import KitchenProfile from '@features/kitchens/screens/KitchenProfile';
import KitchenGallery from '@features/kitchens/screens/KitchenGallery';
import KitchenReviews from '@features/kitchens/screens/KitchenReviews';
import KitchenStoryViewer from '@features/home/screens/KitchenStoryViewer';
import ReelViewer from '@features/foodfeed/screens/ReelViewer';
import FavoritesHub from '@features/profile/screens/FavoritesHub';
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
import Notifications from '@features/profile/screens/Notifications';
import EditProfile from '@features/profile/screens/EditProfile';
import DeleteAccount from '@features/profile/screens/DeleteAccount';
import ReferralScreen from '@features/referral/screens/ReferralScreen';

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
        name="KitchenStoryViewer"
        component={KitchenStoryViewer}
        options={{ animation: 'fade', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="ReelViewer"
        component={ReelViewer}
        options={{ animation: 'fade', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="FavoritesHub" component={FavoritesHub} />
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
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
    </Stack.Navigator>
  );
}
