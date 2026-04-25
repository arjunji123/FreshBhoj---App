import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Heart, MessageCircle, Share2, Bookmark, ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';
import GradientText from '@components/GradientText';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FeedItem {
  id: string;
  chefName: string;
  dishName: string;
  description: string;
  image: string;
  likes: number;
  comments: number;
  price: number;
  tags: string[];
  isLiked: boolean;
  isSaved: boolean;
}

const FEED_DATA: FeedItem[] = [
  {
    id: '1',
    chefName: 'Chef Priya',
    dishName: 'Butter Chicken Special',
    description: 'Creamy, rich tomato-based curry with tender chicken. Made fresh every day with hand-ground spices. 🌶️',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600',
    likes: 1243,
    comments: 87,
    price: 299,
    tags: ['Non-Veg', 'Curry', 'Bestseller'],
    isLiked: true,
    isSaved: false,
  },
  {
    id: '2',
    chefName: 'Mama\'s Kitchen',
    dishName: 'Veg Thali Delight',
    description: 'A complete wholesome meal - dal, sabzi, roti, rice, pickle and dessert. Taste like home! 🏠',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600',
    likes: 3456,
    comments: 234,
    price: 179,
    tags: ['Veg', 'Thali', 'Healthy'],
    isLiked: false,
    isSaved: true,
  },
  {
    id: '3',
    chefName: 'Spice Garden',
    dishName: 'Hyderabadi Dum Biryani',
    description: 'Slow-cooked aromatic basmati rice with saffron, fried onions and tender meat. Pure bliss! 😍',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=600',
    likes: 5678,
    comments: 412,
    price: 349,
    tags: ['Non-Veg', 'Biryani', 'Premium'],
    isLiked: false,
    isSaved: false,
  },
  {
    id: '4',
    chefName: 'Green Bowl',
    dishName: 'Avocado Quinoa Power Bowl',
    description: 'Nutrient-packed superfood bowl with roasted veggies, quinoa and lemon tahini dressing. 💪',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
    likes: 892,
    comments: 56,
    price: 399,
    tags: ['Veg', 'Healthy', 'Keto'],
    isLiked: true,
    isSaved: true,
  },
  {
    id: '5',
    chefName: 'Sweet Indulgence',
    dishName: 'Gulab Jamun Cake',
    description: 'Fusion dessert combining the classic Indian sweet with moist cake layers and rose syrup. 🌹',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600',
    likes: 7823,
    comments: 601,
    price: 249,
    tags: ['Dessert', 'Fusion', 'Sweet'],
    isLiked: false,
    isSaved: false,
  },
];

const formatCount = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

interface FeedCardProps {
  item: FeedItem;
  itemHeight: number;
}

const FeedCard: React.FC<FeedCardProps> = ({ item, itemHeight }) => {
  const [liked, setLiked] = useState(item.isLiked);
  const [likeCount, setLikeCount] = useState(item.likes);
  const [saved, setSaved] = useState(item.isSaved);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <View style={[styles.card, { height: itemHeight }]}>
      {/* Background Image */}
      <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />

      {/* Gradient overlay */}
      <View style={styles.gradient} />

      {/* Tags row */}
      <View style={styles.tagsRow}>
        {item.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Right Action Bar */}
      <View style={styles.actionsBar}>
        {/* Like */}
        <TouchableOpacity style={styles.actionItem} onPress={handleLike} activeOpacity={0.8}>
          <Heart
            size={30}
            color={liked ? '#FF6B6B' : '#FFFFFF'}
            fill={liked ? '#FF6B6B' : 'transparent'}
            strokeWidth={1.5}
          />
          <Text style={styles.actionCount}>{formatCount(likeCount)}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity style={styles.actionItem} activeOpacity={0.8}>
          <MessageCircle size={30} color="#FFFFFF" strokeWidth={1.5} />
          <Text style={styles.actionCount}>{formatCount(item.comments)}</Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity style={styles.actionItem} onPress={() => setSaved((p) => !p)} activeOpacity={0.8}>
          <Bookmark
            size={28}
            color={saved ? '#FBBF24' : '#FFFFFF'}
            fill={saved ? '#FBBF24' : 'transparent'}
            strokeWidth={1.5}
          />
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionItem} activeOpacity={0.8}>
          <Share2 size={26} color="#FFFFFF" strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <View style={styles.chefRow}>
          <AppGradient
            colors={theme.colors.defaultColor}
            locations={theme.colors.defaultLocations}
            direction="diagonal"
            style={styles.chefAvatar}
          >
            <Text style={styles.chefInitial}>{item.chefName[0]}</Text>
          </AppGradient>
          <Text style={styles.chefName}>{item.chefName}</Text>
          <TouchableOpacity style={styles.followButton} activeOpacity={0.8}>
            <GradientText
              colors={theme.colors.defaultColor}
              direction="diagonal"
              style={styles.followText}
            >
              Follow
            </GradientText>
          </TouchableOpacity>
        </View>

        <Text style={styles.dishName}>{item.dishName}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        {/* Price + Order Button */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price}</Text>
          <TouchableOpacity activeOpacity={0.85}>
            <AppGradient
              colors={theme.colors.defaultColor}
              locations={theme.colors.defaultLocations}
              direction="diagonal"
              style={styles.orderButton}
            >
              <Text style={styles.orderButtonText}>Order Now</Text>
            </AppGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const FoodFeed = () => {
  const insets = useSafeAreaInsets();
  const ITEM_HEIGHT = SCREEN_HEIGHT - insets.bottom;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.header, { top: insets.top }]}>
        <Text style={styles.headerTitle}>Food Feed</Text>
        <ChevronDown size={20} color="#FFFFFF" strokeWidth={2} />
      </View>

      <FlatList
        data={FEED_DATA}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        renderItem={({ item }) => <FeedCard item={item} itemHeight={ITEM_HEIGHT} />}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
};

export default FoodFeed;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#FFFFFF',
  },
  card: {
    width: SCREEN_WIDTH,
    position: 'relative',
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
                                 backgroundColor: 'rgba(0,0,0,0.45)',
  },
  tagsRow: {
    position: 'absolute',
    top: 80,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tagText: {
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: '#FFFFFF',
  },
  actionsBar: {
    position: 'absolute',
    right: 12,
    bottom: 120,
    alignItems: 'center',
    gap: 20,
  },
  actionItem: {
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: '#FFFFFF',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 72,
  },
  chefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  chefAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  chefInitial: {
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#FFFFFF',
  },
  chefName: {
    flex: 1,
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: '#FFFFFF',
  },
  followButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.gradient1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  followText: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
  },
  dishName: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  description: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 60,
  },
  price: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#FFFFFF',
  },
  orderButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  orderButtonText: {
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#FFFFFF',
  },
});
