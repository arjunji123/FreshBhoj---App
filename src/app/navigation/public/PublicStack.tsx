import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '@features/authentication/screens/Login';
import OTPScreen from '@features/authentication/screens/OTPScreen';
import OnboardingScreen from '@features/onboarding/screens/OnboardingScreen';
import OTPSuccess from '@features/authentication/screens/OTPSuccess';
import PersonalDetails from '@features/authentication/screens/PersonalDetails';

const Stack = createNativeStackNavigator();

export type PublicStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  OTP: { phoneNumber: string };
  OTPSuccess : undefined;
  PersonalDetails: undefined;
};


export function PublicStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="OTPSuccess" component={OTPSuccess} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
    </Stack.Navigator>
  );
}
