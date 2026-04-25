import React, { useCallback, useRef, useState } from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import SplashScreen from '@components/SplashScreen';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Animated, Easing, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const SPLASH_HOLD_MS = 1500; // how long to show splash after nav is ready

const MainApp = () => {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideSplash = useCallback(() => {
    holdTimer.current = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => setIsShowSplash(false));
    }, SPLASH_HOLD_MS);
  }, [splashOpacity]);

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.container}>
          {/* Navigator mounts silently behind splash */}
          <AppNavigator onReady={hideSplash} />

          {/* Splash sits on top — always visible until nav is ready + hold */}
          {isShowSplash && (
            <Animated.View pointerEvents="none" style={[styles.splashOverlay, { opacity: splashOpacity }]}>
              <SplashScreen />
            </Animated.View>
          )}
        </View>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
    elevation: 99,
  },
});

export default MainApp;