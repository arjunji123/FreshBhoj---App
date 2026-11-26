import React, { useRef, useState, useMemo } from 'react';
import { FlatList, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from "@app/theme/useTheme";

/** The photo leads the dish page: a little under half the screen on any phone. */
export const useMealHeroHeight = () => Math.round(useWindowDimensions().height * 0.46);

interface MealHeroProps {
  images: string[];
}

/** Swipeable hero gallery with page dots and a scrim for the floating app bar. */
const MealHero: React.FC<MealHeroProps> = ({ images }) => {
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const height = useMealHeroHeight();
    const styles = useMemo(() => createStyles(theme, width, height), [theme, width, height]);
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
          setActiveIndex(Math.round(nativeEvent.contentOffset.x / width))
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

const createStyles = (theme: ReturnType<typeof useTheme>, width: number, height: number) => StyleSheet.create({
  container: {
    height,
    backgroundColor: theme.colors.neutral[100],
  },
  image: {
    width,
    height,
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
    bottom: theme.spacing.xxxl,
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
    backgroundColor: theme.colors.palette.white,
  },
});
