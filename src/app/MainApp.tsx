import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, { Easing, runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { queryClient } from '@api';
import { persistOptions } from '@api/queryPersister';
import SplashScreen from '@components/SplashScreen';
import { useCaptureReferralLink } from '@features/referral/useCaptureReferralLink';
import { useThemeStore } from '@app/theme/themeStore';
import { AppNavigator } from './navigation/AppNavigator';

// Long enough for the brand moment, short enough to feel instant: the app
// underneath is already mounted (and, after the first launch, already filled
// from the persisted cache).
const SPLASH_DURATION_MS = 1300;
const SPLASH_FADE_MS = 320;

const MainApp = () => {
  const [showSplashOverlay, setShowSplashOverlay] = useState(true);
  const splashOpacity = useSharedValue(1);

  const isDark = useThemeStore((s) => s.resolvedScheme) === 'dark';

  useCaptureReferralLink();

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
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <StatusBar
            barStyle={showSplashOverlay || isDark ? 'light-content' : 'dark-content'}
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
    </PersistQueryClientProvider>
  );
};

export default MainApp;
