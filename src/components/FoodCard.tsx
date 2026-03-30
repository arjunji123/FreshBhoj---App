import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {Heart, Plus} from 'lucide-react-native';
import {theme} from '@app/theme/index';
import {Shadows} from '@app/theme/colors';
import GradientText from '@components/GradientText';
import AppGradient from '@components/AppGradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 20;
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export interface FoodCardItem {
  id: string;
  name: string;
  image: string;
  rating: number;
  restaurant: string;
  distance: string;
  price: number;
  isFavorite: boolean;
}

interface FoodCardProps {
  item: FoodCardItem;
  onFavoritePress?: (item: FoodCardItem) => void;
  onAddPress?: (item: FoodCardItem) => void;
}

const FoodCard = ({item, onFavoritePress, onAddPress}: FoodCardProps) => {
  return (
    <View style={styles.card}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={{uri: item.image}} style={styles.cardImage} />
        <TouchableOpacity
          style={styles.favoriteButton}
          activeOpacity={0.7}
          onPress={() => onFavoritePress?.(item)}>
          <Heart
            size={16}
            color={
              item.isFavorite
                ? theme.colors.gradient1
                : theme.colors.palette.gray3
            }
            fill={item.isFavorite ? theme.colors.gradient1 : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={styles.cardContent}>
        {/* Name + Rating Row */}
        <View style={styles.nameRatingRow}>
          <Text style={styles.foodName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{item.rating}★</Text>
          </View>
        </View>

        {/* Restaurant + Distance */}
        <Text style={styles.restaurantText} numberOfLines={1}>
          {item.restaurant} • {item.distance}
        </Text>

        {/* Price + Add Button Row */}
        <View style={styles.priceAddRow}>
          <GradientText
            colors={theme.colors.defaultColor}
            direction="horizontal">
            <Text style={styles.priceText}>₹{item.price}</Text>
          </GradientText>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.addButtonWrapper}
            onPress={() => onAddPress?.(item)}>
            <AppGradient
              colors={theme.colors.defaultColor}
              direction="diagonal"
              style={styles.addButton}>
              <Plus size={16} color={theme.colors.palette.white} />
            </AppGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FoodCard;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 250,
    backgroundColor: theme.colors.palette.white,
    borderRadius: theme.spacing.borderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.heavy,
  },
  imageContainer: {
    width: '100%',
    height: 130,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 25,
    height: 25,
    borderRadius: theme.spacing.borderRadius.xxl,
    backgroundColor: theme.colors.palette.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light,
  },
  cardContent: {
    padding: 10,
  },
  nameRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  foodName: {
    flex: 1,
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: theme.colors.palette.black,
  },
  ratingBadge: {
    backgroundColor: theme.colors.palette.success,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    color: theme.colors.palette.white,
  },
  restaurantText: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: theme.colors.palette.gray1,
    marginTop: 4,
  },
  priceAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 8,
  },
  priceText: {
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fontFamilies.aBeeZee.regular,
  },
  addButtonWrapper: {
    borderRadius: theme.spacing.borderRadius.md,
    overflow: 'hidden',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
