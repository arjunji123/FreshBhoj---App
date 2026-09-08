import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@app/theme/index';

// components
import AppGradient from './AppGradient';


const { width } = Dimensions.get('window');

/** Plate images ease in a beat after the wordmark, rather than all landing at once. */
const useCornerImageAnimation = (delay: number, fromOffset: number) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) }),
    );
  }, [delay, progress]);

  return useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * fromOffset }],
  }));
};

const SplashScreen = () => {
  const topImageStyle = useCornerImageAnimation(280, -40);
  const bottomImageStyle = useCornerImageAnimation(420, 40);

  return (
    <AppGradient style={styles.container}>

      {/* --- Top Left Plate --- */}
      <Animated.Image
        source={require('@assets/images/plate_top.png')}
        style={[styles.topLeftImage, topImageStyle]}
        resizeMode="contain"
      />

      {/* --- Center Content --- */}
      <View style={styles.centerContent}>

        {/* Top Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.symbol}>@</Text>
          <View style={styles.line} />
        </View>

        {/* Main Title */}
        <Text style={styles.title}>FreshBhoj</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>Where Freshness Meets Flavor.</Text>

        {/* Bottom Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.symbol}>@</Text>
          <View style={styles.line} />
        </View>

      </View>

      {/* --- Bottom Right Plate --- */}
      <Animated.Image
        source={require('@assets/images/plate_bottom.png')}
        style={[styles.bottomRightImage, bottomImageStyle]}
        resizeMode="contain"
      />

    </AppGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Corner Images ---
  topLeftImage: {
    position: 'absolute',
    top: -70,
    left: -70,
    width: width * 0.8,
    height: width * 0.8,
  },
  bottomRightImage: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: width * 0.8,
    height: width * 0.8,
  },

  // --- Center Text Block ---
  centerContent: {
    width: '80%',
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontFamily: theme.typography.fontFamilies.medievalSharp,
    fontSize: theme.typography.fontSizes.display6,
    color: theme.colors.palette.white,
    textAlign: 'center',
  },
  tagline: {
    color: theme.colors.palette.white,
    fontSize: theme.typography.fontSizes.lg,
    letterSpacing: 0.5,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    opacity: 0.8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.palette.white,
  },
  symbol: {
    color: theme.colors.palette.white,
    marginHorizontal: 10,
    fontSize: theme.typography.fontSizes.xl,
    fontFamily: theme.typography.fontFamilies.medievalSharp,
  },
});

export default SplashScreen;