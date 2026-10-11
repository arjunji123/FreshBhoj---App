import type { SharedValue } from 'react-native-reanimated';
import type { GoalTag } from '@api/types';

/** Window-space rectangle of the search pill, used as the Search screen's morph origin. */
export interface SearchOriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HomeHeaderProps {
  scrollY: SharedValue<number>;
  cartCount?: number;
  /** Unread inbox items — drives the dot on the bell. */
  notificationCount?: number;
  onPressLocation?: () => void;
  onPressSearch?: (origin: SearchOriginRect) => void;
  onPressNotifications?: () => void;
  onPressCart?: () => void;
  onPressReferral?: () => void;
}

export interface GoalFilterState {
  goalTags: GoalTag[];
  category?: string;
}
