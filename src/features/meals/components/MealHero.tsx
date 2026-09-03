import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '@app/theme/index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 300;

interface MealHeroProps {
  images: string[];
}

/** Swipeable hero gallery with page dots and a scrim for the floating app bar. */
const MealHero: React.FC<MealHeroProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<string>>(null);
  const photos = images.length ? images : [''];

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(uri, index) => `${uri}-${index}`}
        onMomentumScrollEnd={({ nativeEvent }) =>
          setActiveIndex(Math.round(nativeEvent.contentOffset.x / SCREEN_WIDTH))
        }
        renderItem={({ item }) =>
          item ? (
            <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.fallback]} />
          )
        }
      />

      {/* Top scrim keeps the back/share buttons readable on a bright photo. */}
      <LinearGradient
        colors={['rgba(15,23,42,0.35)', 'transparent']}
        style={styles.topScrim}
        pointerEvents="none"
      />

      {photos.length > 1 ? (
        <View style={styles.dots}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeIndex ? styles.dotActive : null]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default MealHero;

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    backgroundColor: theme.colors.neutral[100],
  },
  image: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  fallback: {
    backgroundColor: theme.colors.neutral[200],
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  dots: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 20,
    backgroundColor: theme.colors.surface.base,
  },
});
