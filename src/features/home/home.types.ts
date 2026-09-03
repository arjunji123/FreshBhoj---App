import type { SharedValue } from 'react-native-reanimated';
import type { GoalTag } from '@api/types';

export interface HomeHeaderProps {
  scrollY: SharedValue<number>;
  cartCount?: number;
  onPressLocation?: () => void;
  onPressSearch?: () => void;
  onPressProfile?: () => void;
  onPressCart?: () => void;
}

export interface GoalFilterState {
  goalTags: GoalTag[];
  category?: string;
}
