import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '@features/authentication/screens/Login';
import OTPScreen from '@features/authentication/screens/OTPScreen';
import OnboardingScreen from '@features/onboarding/screens/OnboardingScreen';

const Stack = createNativeStackNavigator();

export function PublicStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="OTP" component={OTPScreen} />

    </Stack.Navigator>
  );
}
