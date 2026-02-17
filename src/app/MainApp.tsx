import React, { useState, useEffect } from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import SplashScreen from '@components/SplashScreen';

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

  return <AppNavigator />;
};

export default MainApp;