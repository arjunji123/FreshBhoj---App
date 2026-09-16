import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PublicStack } from './public/PublicStack';
import { PrivateTabs } from './private/PrivateStack';
import { KitchenPartnerStack } from './kitchenPartner/KitchenPartnerStack';
import { useAuthStore } from '@features/authentication/store/authStore';
import { useKitchenAuthStore } from '@features/kitchenPartner/store/kitchenAuthStore';
import LoginGateSheet from '@features/authentication/components/LoginGateSheet';
import { navigationRef } from './navigationRef';
import MiniCartBar from '@components/MiniCartBar';

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGuest = useAuthStore((state) => state.isGuest);
  const isKitchenAuthenticated = useKitchenAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer ref={navigationRef}>
      {isKitchenAuthenticated ? (
        // A phone signed in as a kitchen partner never sees the customer app —
        // the two modes are mutually exclusive, kitchen takes priority.
        <KitchenPartnerStack />
      ) : isAuthenticated || isGuest ? (
        <View style={{ flex: 1 }}>
          <PrivateTabs />
          <MiniCartBar />
          <LoginGateSheet />
        </View>
      ) : (
        <PublicStack />
      )}
    </NavigationContainer>
  );
}
