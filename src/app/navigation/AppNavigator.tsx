import { NavigationContainer } from '@react-navigation/native';
import { PublicStack } from './public/PublicStack';
import { PrivateTabs } from './private/PrivateStack';

const isAuthenticated = false; // TEMP

export function AppNavigator() {
  return (
    <NavigationContainer>
      {isAuthenticated ? <PrivateTabs /> : <PublicStack />}
    </NavigationContainer>
  );
}
