import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@app/theme/index';

// components
import AppGradient from './AppGradient';


const { width } = Dimensions.get('window');

const SplashScreen = () => {
  return (
    <AppGradient style={styles.container}>

      {/* --- Top Left Plate --- */}
      <Image
        source={require('@assets/images/plate_top.png')}
        style={styles.topLeftImage}
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
      <Image
        source={require('@assets/images/plate_bottom.png')}
        style={styles.bottomRightImage}
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
    color: theme.colors.palette.gray1,
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