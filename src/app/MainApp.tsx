import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, { Easing, runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { queryClient } from '@api';
import SplashScreen from '@components/SplashScreen';
import { AppNavigator } from './navigation/AppNavigator';

const SPLASH_DURATION_MS = 2200;
const SPLASH_FADE_MS = 320;

const MainApp = () => {
  const [showSplashOverlay, setShowSplashOverlay] = useState(true);
  const splashOpacity = useSharedValue(1);

  useEffect(() => {
    // The navigator mounts immediately, hidden behind the splash overlay, so
    // Onboarding/Home is already fully painted by the time the splash fades —
    // no blank white frame popping in after the brand moment ends.
    const timer = setTimeout(() => {
      splashOpacity.value = withTiming(
        0,
        { duration: SPLASH_FADE_MS, easing: Easing.out(Easing.ease) },
        (finished) => {
          if (finished) runOnJS(setShowSplashOverlay)(false);
        },
      );
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [splashOpacity]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <StatusBar
            barStyle={showSplashOverlay ? 'light-content' : 'dark-content'}
            backgroundColor="transparent"
            translucent
          />
          <AppNavigator />
          {showSplashOverlay ? (
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: splashOpacity }]}>
              <SplashScreen />
            </Animated.View>
          ) : null}
        </KeyboardProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default MainApp;
