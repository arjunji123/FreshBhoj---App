import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '@features/authentication/screens/Login';
import OTPScreen from '@features/authentication/screens/OTPScreen';
import OTPSuccess from '@features/authentication/screens/OTPSuccess';
import PersonalDetails from '@features/authentication/screens/PersonalDetails';
import OnboardingScreen from '@features/onboarding/screens/OnboardingScreen';
import { useAuthStore } from '@features/authentication/store/authStore';
import type { PublicStackParamList } from '../navigation.types';

export type { PublicStackParamList };

const Stack = createNativeStackNavigator<PublicStackParamList>();

export function PublicStack() {
  const isProfilePending = useAuthStore((state) => state.isProfilePending);

  return (
    <Stack.Navigator
      // A verified-but-incomplete user resumes at profile setup rather than
      // being sent back through onboarding and OTP.
      initialRouteName={isProfilePending ? 'PersonalDetails' : 'Onboarding'}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="OTPSuccess" component={OTPSuccess} options={{ animation: 'fade' }} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
    </Stack.Navigator>
  );
}
