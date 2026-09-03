import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PublicStack } from './public/PublicStack';
import { PrivateTabs } from './private/PrivateStack';
import { useAuthStore } from '@features/authentication/store/authStore';

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <PrivateTabs /> : <PublicStack />}
    </NavigationContainer>
  );
}
