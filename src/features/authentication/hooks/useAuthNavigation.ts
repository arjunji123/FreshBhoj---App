import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { PublicStackParamList } from '@app/navigation/navigation.types';

/** Typed navigation for the pre-login stack. */
export function useAuthNavigation() {
  return useNavigation<NavigationProp<PublicStackParamList>>();
}

export default useAuthNavigation;
