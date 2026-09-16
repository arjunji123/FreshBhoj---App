import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '@app/theme/index';
import { Button } from '@components/ui';
import { useKitchenOnboardingStatus } from '@features/kitchenPartner/hooks/useKitchenPortal';
import KitchenOnboardingPending from '@features/kitchenPartner/screens/KitchenOnboardingPending';
import KitchenMealForm from '@features/kitchenPartner/screens/KitchenMealForm';
import type { KitchenPartnerStackParamList } from '../navigation.types';
import { KitchenTabNavigator } from './KitchenTabNavigator';

const Stack = createNativeStackNavigator<KitchenPartnerStackParamList>();

/**
 * Mirrors the website's `PartnerGuard`: a kitchen mid-onboarding (or under
 * review / rejected / suspended) never sees the dashboard — only a verified,
 * ACTIVE kitchen does. Full interactive onboarding lives on the partner
 * website for now; the app shows status + a link to finish there.
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

  if (onboarding.data?.status !== 'ACTIVE') {
    return <KitchenOnboardingPending />;
  }

  return <KitchenTabNavigator />;
}

export function KitchenPartnerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="KitchenTabs" component={KitchenGate} />
      <Stack.Screen name="KitchenMealForm" component={KitchenMealForm} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}
