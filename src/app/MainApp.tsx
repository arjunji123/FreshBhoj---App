import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@api';
import SplashScreen from '@components/SplashScreen';
import { AppNavigator } from './navigation/AppNavigator';

const SPLASH_DURATION_MS = 2200;

const MainApp = () => {
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    // Persisted auth state rehydrates from MMKV synchronously, so the splash is
    // purely a brand moment — no async gate to wait on here.
    const timer = setTimeout(() => setIsShowSplash(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (isShowSplash) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <AppNavigator />
        </KeyboardProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default MainApp;
