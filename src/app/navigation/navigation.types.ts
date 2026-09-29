import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { GoalTag, PaymentMethod, StoryItem } from '@api/types';
import type { ReelFeedType } from '@api/endpoints/reels.api';

/** Screens available before sign-in. */
export type PublicStackParamList = {
  Onboarding: undefined;
  /** `intent: 'KITCHEN'` skips the account-type lookup and goes straight to a kitchen OTP. */
  Login: { intent?: 'KITCHEN' } | undefined;
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
  ReelViewer: { reelId?: string; kitchenId?: string; feed?: ReelFeedType; cuisineId?: string };
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

  // Subscriptions
  ManageSubscription: { subscriptionId: string };

  // Bespoke Setup Plan wizard — kitchen choice → plan details → delivery →
  // review, each its own `Stack.Screen` (not one screen with internal step
  // state). Cross-step state lives in `useSetupPlanStore`, not route params.
  SetupPlanChooseKitchen: undefined;
  SetupPlanDetails: undefined;
  SetupPlanDelivery: undefined;
  SetupPlanReview: undefined;

  // Customer prepaid wallet — reachable from Profile, not a bottom tab.
  Wallet: undefined;

  // Saved cards, UPI IDs and the wallet balance in one place. Reachable from
  // Profile and from Support's Help Center.
  PaymentMethods: undefined;

  // App-wide Appearance (System/Light/Dark) + a link-through to Notifications.
  // Reachable from Profile.
  Preferences: undefined;

  // Static legal content — same copy as the signup consent sheet
  // (`legalContent.ts`), rendered as a full page instead of a bottom sheet.
  PrivacyPolicy: undefined;
  TermsOfService: undefined;

  // Kitchen-partner registration entry point. A signed-in customer stays
  // signed in while doing this — kitchen auth is a wholly separate session
  // (see `kitchenAuthStore`) — so this pushes the *same* Login/OTP screens
  // used pre-login onto this stack instead of swapping the app's root
  // navigator, which would sign the customer out of this stack entirely.
  Login: { intent?: 'KITCHEN' } | undefined;
  OTP: { phoneNumber: string; accountType?: 'KITCHEN' | 'CUSTOMER' };
};

export type PrivateNavigation = NativeStackNavigationProp<PrivateStackParamList>;
export type PublicNavigation = NativeStackNavigationProp<PublicStackParamList>;

/** The kitchen-partner app's six bottom tabs. */
export type KitchenTabParamList = {
  KitchenDashboard: undefined;
  KitchenOrders: undefined;
  KitchenMenu: undefined;
  KitchenStories: undefined;
  KitchenReels: undefined;
  KitchenProfile: undefined;
};

/** Everything reachable once signed in as a kitchen partner. */
export type KitchenPartnerStackParamList = {
  KitchenTabs: NavigatorScreenParams<KitchenTabParamList>;
  KitchenMealForm: { mealId?: string } | undefined;
  KitchenDeleteAccount: undefined;
  FssaiAssistance: undefined;
  BhojAiChat: undefined;
  Notifications: undefined;
  Payouts: undefined;
  KitchenTimings: undefined;
  UploadGuide: undefined;
  /** `orderNumber` is optional — purely so the chat header can show "#1234" without an extra fetch (there's no order-detail endpoint yet). */
  OrderChat: { orderId: string; orderNumber?: string };
  AdsCampaigns: undefined;
  AdsCampaignDetail: { campaignId: string };
  Subscribers: undefined;
  SubscriberDetail: { subscriptionId: string };
  ManagePlans: undefined;
  Wallet: undefined;
  AdsInsights: undefined;
  SuggestionDetail: { suggestionId: string };
  SuggestionHistory: undefined;
  PremiumPlans: undefined;
  PremiumSubscriptionDetail: undefined;
};

export type KitchenPartnerNavigation = NativeStackNavigationProp<KitchenPartnerStackParamList>;
