import type {ImageSourcePropType} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import type {FoodCardItem} from '@components/FoodCard';

export type {FoodCardItem};

export interface StoryItem {
  id: string;
  name: string;
  image: string;
}

export interface CategoryDataItem {
  id: string;
  name: string;
  image: ImageSourcePropType;
}

export interface HomeHeaderProps {
  scrollY: SharedValue<number>;
}

export interface CarouselItemProps {
  item: CategoryDataItem;
  index: number;
  scrollX: SharedValue<number>;
}
