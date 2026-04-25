import { NavigationContainer } from '@react-navigation/native';
import { useNetInfo } from '@react-native-community/netinfo';
import { PublicStack } from './public/PublicStack';
import { PrivateTabs } from './private/PrivateStack';
import { useAuthStore } from '@features/authentication/store/authStore';
import NetworkErrorScreen from '@app/screens/NetworkErrorScreen';

type AppNavigatorProps = {
  onReady?: () => void;
};

export function AppNavigator({ onReady }: AppNavigatorProps) {
  const netInfo = useNetInfo();
  const {isAuthenticated} = useAuthStore();

  const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

  if (isOffline) {
    return <NetworkErrorScreen />;
  }

  return (
    <NavigationContainer onReady={onReady}>
      {isAuthenticated ? <PrivateTabs /> : <PublicStack />}
    </NavigationContainer>
  );
}
