import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  type SharedValue,
} from 'react-native-reanimated';
import AppGradient from '@components/AppGradient';
import { theme } from '@app/theme/index';
import { useCoverFlowAnimations } from '@animations/useCoverFlowAnimations';
import type { Cuisine } from '@api/types';

// ── Layout constants ──────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.32;
const SPACING = 12;
const FULL_ITEM_SIZE = ITEM_WIDTH + SPACING;
const CENTER_PADDING = (SCREEN_WIDTH - FULL_ITEM_SIZE) / 2;
const IMAGE_SIZE = ITEM_WIDTH * 0.85;
const RING_SIZE = IMAGE_SIZE + 8;

interface CarouselItemProps {
  item: Cuisine;
  index: number;
  scrollX: SharedValue<number>;
  onPress: (cuisine: Cuisine) => void;
}

const CarouselItem: React.FC<CarouselItemProps> = ({ item, index, scrollX, onPress }) => {
  const {
    animatedScale,
    animatedOverlay,
    animatedRing,
    animatedShadow,
    animatedLabelBg,
    animatedLabelText,
  } = useCoverFlowAnimations({
    scrollX,
    index,
    itemSize: FULL_ITEM_SIZE,
    labelBgColors: ['rgba(226,18,29,0)', theme.colors.primary[600], 'rgba(226,18,29,0)'],
    labelTextColors: [theme.colors.text.tertiary, theme.colors.text.inverse, theme.colors.text.tertiary],
  });

  return (
    <Animated.View style={[styles.itemContainer, animatedScale]}>
      <Pressable onPress={() => onPress(item)} accessibilityRole="button" accessibilityLabel={item.name}>
        <Animated.View style={[styles.shadowWrapper, animatedShadow]}>
        <View style={styles.imageWrapper}>
          {/* Gradient ring — fades in only for the centred item. */}
          <Animated.View style={[StyleSheet.absoluteFill, styles.ringContainer, animatedRing]}>
            <AppGradient
              colors={theme.colors.gradients.brand}
              locations={theme.colors.gradients.brandLocations}
              direction="diagonal"
              style={styles.gradientRing}
            />
          </Animated.View>

          <View style={styles.neutralRing} />

          <View style={styles.innerCircle}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.imageFallback]} />
            )}
            {/* White wash that fades out as an item approaches the centre. */}
            <Animated.View style={[styles.whiteOverlay, animatedOverlay]} />
          </View>
        </View>
        </Animated.View>
      </Pressable>

      <Animated.View style={[styles.labelPill, animatedLabelBg]}>
        <Animated.Text style={[styles.labelText, animatedLabelText]} numberOfLines={1}>
          {item.name}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

interface CuisineCarouselProps {
  cuisines: Cuisine[];
  onSelect: (cuisine: Cuisine) => void;
}

/** Cover-flow style carousel of cuisines — the centred item scales up and glows. */
const CuisineCarousel: React.FC<CuisineCarouselProps> = ({ cuisines, onSelect }) => {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  if (!cuisines.length) return null;

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={cuisines}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={FULL_ITEM_SIZE}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: CENTER_PADDING }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: FULL_ITEM_SIZE,
          offset: FULL_ITEM_SIZE * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <CarouselItem item={item} index={index} scrollX={scrollX} onPress={onSelect} />
        )}
        ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
      />
    </View>
  );
};

export default CuisineCarousel;

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    alignItems: 'center',
  },
  shadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    borderRadius: RING_SIZE / 2,
  },
  imageWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
  },
  neutralRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
    borderColor: theme.colors.neutral[200],
  },
  innerCircle: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    backgroundColor: theme.colors.surface.base,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageFallback: {
    backgroundColor: theme.colors.neutral[200],
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.surface.base,
  },
  labelPill: {
    marginTop: 10,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  labelText: {
    ...theme.text.label,
    textAlign: 'center',
  },
});
