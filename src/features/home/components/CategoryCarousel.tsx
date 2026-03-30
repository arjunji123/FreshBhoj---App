import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import AppGradient from '@components/AppGradient';
import { theme } from '@app/theme/index';
import { useCoverFlowAnimations } from '../../../animations/useCoverFlowAnimations';
import { CATEGORY_DATA } from '../home.constants';
import type { CarouselItemProps } from '../home.types';

// ── Layout constants ──────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.32;
const SPACING = 12;
const FULL_ITEM_SIZE = ITEM_WIDTH + SPACING;
const CENTER_PADDING = (SCREEN_WIDTH - FULL_ITEM_SIZE) / 2;
const IMAGE_SIZE = ITEM_WIDTH * 0.85;
const RING_SIZE = IMAGE_SIZE + 8;

const CarouselItem: React.FC<CarouselItemProps> = ({ item, index, scrollX }) => {
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
  });

  return (
    <Animated.View style={[styles.itemContainer, animatedScale]}>
      {/* Shadow wrapper */}
      <Animated.View style={[styles.shadowWrapper, animatedShadow]}>
        {/* Image with borders */}
        <View style={styles.imageWrapper}>
          {/* Gradient ring (center item) */}
          <Animated.View
            style={[StyleSheet.absoluteFill, styles.ringContainer, animatedRing]}
          >
            <AppGradient
              colors={theme.colors.defaultColor}
              locations={theme.colors.defaultLocations}
              direction="diagonal"
              style={styles.gradientRing}
            />
          </Animated.View>

          {/* Neutral ring (side items) */}
          <View style={styles.neutralRing} />

          {/* Inner white circle + image */}
          <View style={styles.innerCircle}>
            <Image source={item.image} style={styles.image} />
            {/* White overlay for milky fade */}
            <Animated.View style={[styles.whiteOverlay, animatedOverlay]} />
          </View>
        </View>
      </Animated.View>

      {/* Label */}
      <Animated.View style={[styles.labelPill, animatedLabelBg]}>
        <Animated.Text style={[styles.labelText, animatedLabelText]}>
          {item.name}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

// ── CategoryCarousel ──────────────────────────────────────────────
const CategoryCarousel = () => {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={CATEGORY_DATA}
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
          <CarouselItem item={item} index={index} scrollX={scrollX} />
        )}
        ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
      />
    </View>
  );
};

export default CategoryCarousel;

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingVertical: 16,
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
    borderColor: '#E5D5D5',
  },
  innerCircle: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    backgroundColor: theme.colors.palette.white,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.palette.white,
  },
  labelPill: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },
  labelText: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    textAlign: 'center',
  },
});
