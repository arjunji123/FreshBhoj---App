import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PublicStackParamList } from '@app/navigation/public/PublicStack';


const authNavigation = () => {
  const authNavigation = useNavigation<NavigationProp<PublicStackParamList>>();
  return authNavigation
}

export default authNavigation