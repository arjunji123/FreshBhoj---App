import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { GoalTag, PaymentMethod, StoryItem } from '@api/types';
import type { ReelFeedType } from '@api/endpoints/reels.api';

/** Screens available before sign-in. */
export type PublicStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  OTP: { phoneNumber: string; accountType?: 'KITCHEN' | 'CUSTOMER' };
  OTPSuccess: undefined;
  PersonalDetails: undefined;
};

/** The five bottom tabs. */
export type MainTabParamList = {
  Home: undefined;
  Search: { query?: string; goalTag?: GoalTag; category?: string; categoryName?: string } | undefined;
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
  KitchenStoryViewer: { kitchenId: string; kitchenName: string; items: StoryItem[]; initialIndex?: number };
  ReelViewer: { reelId?: string; kitchenId?: string; feed?: ReelFeedType };
  FavoritesHub: undefined;
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
    orderId?: string;
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
  Notifications: undefined;
  EditProfile: undefined;
  Referral: undefined;
  DeleteAccount: undefined;
};

export type PrivateNavigation = NativeStackNavigationProp<PrivateStackParamList>;
export type PublicNavigation = NativeStackNavigationProp<PublicStackParamList>;

/** The kitchen-partner app's four bottom tabs. */
export type KitchenTabParamList = {
  KitchenDashboard: undefined;
  KitchenOrders: undefined;
  KitchenMenu: undefined;
  KitchenStories: undefined;
  KitchenProfile: undefined;
};

/** Everything reachable once signed in as a kitchen partner. */
export type KitchenPartnerStackParamList = {
  KitchenTabs: NavigatorScreenParams<KitchenTabParamList>;
  KitchenMealForm: { mealId?: string } | undefined;
  KitchenDeleteAccount: undefined;
};

export type KitchenPartnerNavigation = NativeStackNavigationProp<KitchenPartnerStackParamList>;
