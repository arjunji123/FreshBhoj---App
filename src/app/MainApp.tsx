import React, { useState, useEffect } from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import SplashScreen from '@components/SplashScreen';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
const MainApp = () => {
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    // INFO: Simulate Loading Time for Splash Screen (e.g. fetching resources, auth status etc.)
    const timer = setTimeout(() => {
      setIsShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isShowSplash) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <AppNavigator />
      </KeyboardProvider>
    </SafeAreaProvider>
  );
};

export default MainApp;