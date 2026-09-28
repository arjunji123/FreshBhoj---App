import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '@app/theme/index';
import { Button } from '@components/ui';
import { useKitchenOnboardingStatus } from '@features/kitchenPartner/hooks/useKitchenPortal';
import KitchenOnboardingPending from '@features/kitchenPartner/screens/KitchenOnboardingPending';
import KitchenRegisterOwnerDetails from '@features/kitchenPartner/screens/KitchenRegisterOwnerDetails';
import KitchenRegisterKitchenDetails from '@features/kitchenPartner/screens/KitchenRegisterKitchenDetails';
import KitchenRegisterLocation from '@features/kitchenPartner/screens/KitchenRegisterLocation';
import KitchenRegisterDocuments from '@features/kitchenPartner/screens/KitchenRegisterDocuments';
import KitchenRegisterBankDetails from '@features/kitchenPartner/screens/KitchenRegisterBankDetails';
import KitchenRegisterReview from '@features/kitchenPartner/screens/KitchenRegisterReview';
import KitchenMealForm from '@features/kitchenPartner/screens/KitchenMealForm';
import KitchenDeleteAccount from '@features/kitchenPartner/screens/KitchenDeleteAccount';
import FssaiAssistanceGate from '@features/kitchenPartner/screens/FssaiAssistanceGate';
import BhojAiChat from '@features/kitchenPartner/screens/BhojAiChat';
import Notifications from '@features/kitchenPartner/screens/Notifications';
import Payouts from '@features/kitchenPartner/screens/Payouts';
import KitchenTimings from '@features/kitchenPartner/screens/KitchenTimings';
import UploadGuide from '@features/kitchenPartner/screens/UploadGuide';
import OrderChat from '@features/kitchenPartner/screens/OrderChat';
import AdsCampaigns from '@features/kitchenPartner/screens/AdsCampaigns';
import AdsCampaignDetail from '@features/kitchenPartner/screens/AdsCampaignDetail';
import Subscribers from '@features/kitchenPartner/screens/Subscribers';
import SubscriberDetail from '@features/kitchenPartner/screens/SubscriberDetail';
import type { KitchenPartnerStackParamList } from '../navigation.types';
import { KitchenTabNavigator } from './KitchenTabNavigator';

const Stack = createNativeStackNavigator<KitchenPartnerStackParamList>();

/**
 * Mirrors the website's `PartnerGuard` + its step-by-step onboarding router:
 * a kitchen mid-onboarding sees the matching registration form for
 * `currentStep`, one still under review / rejected / suspended sees the
 * status tracker, and only a verified, ACTIVE kitchen reaches the dashboard.
 *
 * The 6 registration screens are rendered directly here (not pushed as
 * separate stack routes) because the backend — not the client — decides
 * what step comes next, and steps only ever move forward. `currentStep` on
 * the status response names the last *completed* step, so each case below
 * shows the form for the step after it.
 */
function KitchenGate() {
  const onboarding = useKitchenOnboardingStatus();

  if (onboarding.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface.page }}>
        <ActivityIndicator color={theme.colors.brand.primary} />
      </View>
    );
  }

  // A failed fetch tells us nothing about the account's real status — never
  // fall through to the "finish setup" screen on a network blip, since the
  // account could actually be ACTIVE.
  if (onboarding.isError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface.page, padding: theme.spacing.paddings.xl }}>
        <Text style={[theme.text.h3, { color: theme.colors.text.primary, textAlign: 'center', marginBottom: theme.spacing.paddings.xs }]}>
          Couldn't load your account
        </Text>
        <Text style={[theme.text.bodySmall, { color: theme.colors.text.secondary, textAlign: 'center', marginBottom: theme.spacing.paddings.lg }]}>
          Check your connection and try again.
        </Text>
        <Button title="Retry" onPress={() => onboarding.refetch()} fullWidth={false} />
      </View>
    );
  }

  const status = onboarding.data?.status;

  if (status === 'ACTIVE') {
    return <KitchenTabNavigator />;
  }

  if (status === 'ONBOARDING') {
    switch (onboarding.data?.currentStep) {
      case 'PHONE_VERIFIED':
        return <KitchenRegisterOwnerDetails />;
      case 'OWNER_DETAILS':
        return <KitchenRegisterKitchenDetails />;
      case 'KITCHEN_DETAILS':
        return <KitchenRegisterLocation />;
      case 'LOCATION':
        return <KitchenRegisterDocuments />;
      case 'DOCUMENTS':
        return <KitchenRegisterBankDetails />;
      case 'BANK_DETAILS':
      case 'MENU_SETUP':
      default:
        return <KitchenRegisterReview />;
    }
  }

  // UNDER_REVIEW, REJECTED, SUSPENDED (and any unexpected status) — the
  // status tracker screen, which reads `status`/`rejectionReason` itself.
  return <KitchenOnboardingPending />;
}

export function KitchenPartnerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="KitchenTabs" component={KitchenGate} />
      <Stack.Screen name="KitchenMealForm" component={KitchenMealForm} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="KitchenDeleteAccount" component={KitchenDeleteAccount} />
      <Stack.Screen name="FssaiAssistance" component={FssaiAssistanceGate} />
      <Stack.Screen name="BhojAiChat" component={BhojAiChat} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Payouts" component={Payouts} />
      <Stack.Screen name="KitchenTimings" component={KitchenTimings} />
      <Stack.Screen name="UploadGuide" component={UploadGuide} />
      <Stack.Screen name="OrderChat" component={OrderChat} />
      <Stack.Screen name="AdsCampaigns" component={AdsCampaigns} />
      <Stack.Screen name="AdsCampaignDetail" component={AdsCampaignDetail} />
      <Stack.Screen name="Subscribers" component={Subscribers} />
      <Stack.Screen name="SubscriberDetail" component={SubscriberDetail} />
    </Stack.Navigator>
  );
}
