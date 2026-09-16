import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '@features/authentication/screens/Login';
import OTPScreen from '@features/authentication/screens/OTPScreen';
import OTPSuccess from '@features/authentication/screens/OTPSuccess';
import PersonalDetails from '@features/authentication/screens/PersonalDetails';
import OnboardingScreen from '@features/onboarding/screens/OnboardingScreen';
import { onboardingStore } from '@features/onboarding/onboardingStore';
import { useAuthStore } from '@features/authentication/store/authStore';
import type { PublicStackParamList } from '../navigation.types';

export type { PublicStackParamList };

const Stack = createNativeStackNavigator<PublicStackParamList>();

function getInitialRouteName(isProfilePending: boolean): keyof PublicStackParamList {
  // A verified-but-incomplete user resumes at profile setup rather than
  // being sent back through onboarding and OTP.
  if (isProfilePending) return 'PersonalDetails';
  // The 3-slide intro is a one-time thing — once a user has seen it, every
  // later sign-out (or a cold start while signed out) should drop them
  // straight on Login instead of showing it again.
  return onboardingStore.hasSeenOnboarding() ? 'Login' : 'Onboarding';
}

export function PublicStack() {
  const isProfilePending = useAuthStore((state) => state.isProfilePending);

  return (
    <Stack.Navigator
      initialRouteName={getInitialRouteName(isProfilePending)}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      {/* Instant — no slide-in, so the hero image is just there immediately. */}
      <Stack.Screen name="Login" component={Login} options={{ animation: 'none' }} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="OTPSuccess" component={OTPSuccess} options={{ animation: 'fade' }} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
    </Stack.Navigator>
  );
}
