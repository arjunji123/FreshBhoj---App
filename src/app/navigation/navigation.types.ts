import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { GoalTag, PaymentMethod } from '@api/types';
import type { ReelFeedType } from '@api/endpoints/reels.api';

/** Screens available before sign-in. */
export type PublicStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  OTP: { phoneNumber: string };
  OTPSuccess: undefined;
  PersonalDetails: undefined;
};

/** The five bottom tabs. */
export type MainTabParamList = {
  Home: undefined;
  Search: { query?: string; goalTag?: GoalTag; category?: string } | undefined;
  FoodFeed: undefined;
  Orders: undefined;
  Profile: undefined;
};

/** Everything reachable once signed in. */
export type PrivateStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;

  // Discovery
  MealDetail: { mealId: string; mealName?: string };
  KitchenProfile: { kitchenId: string; kitchenName?: string };
  KitchenGallery: { kitchenId: string; initialIndex?: number };
  KitchenReviews: { kitchenId: string; kitchenName?: string };
  ReelViewer: { reelId?: string; kitchenId?: string; feed?: ReelFeedType };
  Favorites: undefined;
  FollowedKitchens: undefined;

  // Ordering
  Cart: undefined;
  Checkout: undefined;
  PaymentProcessing: { orderId: string; paymentMethod: PaymentMethod };
  OrderConfirmation: { orderId: string };
  OrderTracking: { orderId: string };
  OrderDetail: { orderId: string };
  WriteReview: {
    orderId: string;
    kitchenId: string;
    kitchenName?: string;
    mealId?: string;
    mealName?: string;
    mealImage?: string | null;
  };

  // Account
  Addresses: { selectMode?: boolean } | undefined;
  AddressForm: { addressId?: string } | undefined;
  Support: undefined;
  Settings: undefined;
  EditProfile: undefined;
};

export type PrivateNavigation = NativeStackNavigationProp<PrivateStackParamList>;
export type PublicNavigation = NativeStackNavigationProp<PublicStackParamList>;
