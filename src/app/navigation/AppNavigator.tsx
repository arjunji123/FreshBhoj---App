import { NavigationContainer } from '@react-navigation/native';
import { PublicStack } from './public/PublicStack';
import { PrivateTabs } from './private/PrivateStack';
import { useAuthStore } from '@features/authentication/store/authStore';

export function AppNavigator() {
  const {isAuthenticated} = useAuthStore();
  return (
    <NavigationContainer>
      {isAuthenticated ? <PrivateTabs /> : <PublicStack />}
    </NavigationContainer>
  );
}
