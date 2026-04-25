import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SlidersHorizontal} from 'lucide-react-native';
import {theme} from '@app/theme/index';
import GradientText from '@components/GradientText';
import FoodCard from '@components/FoodCard';
import {TRENDING_DATA} from '../home.constants';
import {useCartStore} from '@features/cart/store/cartStore';
import type {FoodCardItem} from '../home.types';

const HORIZONTAL_PADDING = 20;
const CARD_GAP = 20;

interface TrendingNearYouProps {
  data?: FoodCardItem[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
}

const TrendingNearYou = ({
  data = TRENDING_DATA,
  isLoading = false,
  hasError = false,
  onRetry,
}: TrendingNearYouProps) => {
  const [addingIds, setAddingIds] = useState<Record<string, boolean>>({});
  const cartKitchenId = useCartStore((state) => state.kitchenId);
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const addWithLoading = async (item: FoodCardItem) => {
    setAddingIds((prev) => ({...prev, [item.id]: true}));
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800);
    });
    addItem(item);
    setAddingIds((prev) => ({...prev, [item.id]: false}));
  };

  const handleAddPress = (item: FoodCardItem) => {
    const isConflict = cartKitchenId && cartKitchenId !== item.kitchenId && cartItems.length > 0;

    if (!isConflict) {
      addWithLoading(item);
      return;
    }

    Alert.alert(
      'Replace cart items?',
      'Your cart has items from another kitchen. Adding this item will clear previous items.',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes, replace',
          style: 'destructive',
          onPress: () => {
            clearCart();
            addWithLoading(item);
          },
        },
      ],
    );
  };

  const showEmptyState = !isLoading && !hasError && data.length === 0;

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Trending Near You</Text>
          <Text style={styles.headerSubtitle}>
            Popular dishes that others are loving
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <GradientText
            colors={theme.colors.defaultColor}
            direction="diagonal">
            <Text style={styles.filterText}>Filters</Text>
          </GradientText>
          <SlidersHorizontal size={18} color={theme.colors.gradient2} />
        </TouchableOpacity>
      </View>

      {/* Grid */}
      {isLoading ? (
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((skeleton) => (
            <View key={skeleton} style={styles.skeletonCard} />
          ))}
        </View>
      ) : hasError ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>Could not load kitchens</Text>
          <Text style={styles.stateSubtitle}>Please check your network and try again.</Text>
          <TouchableOpacity onPress={onRetry} activeOpacity={0.8} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : showEmptyState ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>No kitchens near you yet</Text>
          <Text style={styles.stateSubtitle}>Try changing location or pull to refresh.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {data.map(item => (
            <FoodCard
              key={item.id}
              item={item}
              isAdding={!!addingIds[item.id]}
              onAddPress={handleAddPress}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default TrendingNearYou;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.aBeeZee.regular,
    color: theme.colors.palette.black,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: theme.colors.palette.gray1,
    marginTop: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  filterText: {
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },
  skeletonCard: {
    width: '47%',
    height: 250,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
  },
  stateContainer: {
    marginHorizontal: HORIZONTAL_PADDING,
    backgroundColor: '#FFF7F7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FAD4D4',
    padding: 16,
    alignItems: 'center',
  },
  stateTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#0F172A',
    textAlign: 'center',
  },
  stateSubtitle: {
    marginTop: 6,
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: theme.colors.textGray1,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.gradient2,
  },
  retryButtonText: {
    color: theme.colors.palette.white,
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
  },
});
