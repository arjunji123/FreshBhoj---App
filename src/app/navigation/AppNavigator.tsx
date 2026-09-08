import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PublicStack } from './public/PublicStack';
import { PrivateTabs } from './private/PrivateStack';
import { useAuthStore } from '@features/authentication/store/authStore';
import LoginGateSheet from '@features/authentication/components/LoginGateSheet';
import { navigationRef } from './navigationRef';
import MiniCartBar from '@components/MiniCartBar';

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isGuest = useAuthStore((state) => state.isGuest);

  return (
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated || isGuest ? (
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
