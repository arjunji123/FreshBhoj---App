import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useNetInfo } from '@react-native-community/netinfo';
import HomeHeader from '../components/HomeHeader';
import CategoryPills from '../components/CategoryPills';
import KitchenStories from '../components/KitchenStories';
import CategoryCarousel from '../components/CategoryCarousel';
import TrendingNearYou from '../components/TrendingNearYou';
import ActiveTiffinCard from '@features/active-orders/components/ActiveTiffinCard';
import { useActiveOrder } from '@features/active-orders/hooks/useActiveOrder';
import { TRENDING_DATA } from '../home.constants';
import type { FoodCardItem } from '../home.types';

const Home = () => {
  const netInfo = useNetInfo();
  const activeOrder = useActiveOrder();
  const scrollY = useSharedValue(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [trendingData, setTrendingData] = useState<FoodCardItem[]>([]);

  const loadHomeData = useCallback(async () => {
    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
    if (isOffline) {
      setHasError(true);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    setHasError(false);

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 900);
    });

    setTrendingData(TRENDING_DATA);
    setIsLoading(false);
    setIsRefreshing(false);
  }, [netInfo.isConnected, netInfo.isInternetReachable]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadHomeData();
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.screen}>
      <HomeHeader scrollY={scrollY} />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#BA2121"]}
            tintColor="#BA2121"
          />
        }
      >
        <CategoryPills />
        <KitchenStories />
        {activeOrder && (
          <View style={styles.activeOrderSection}>
            <ActiveTiffinCard
              order={activeOrder}
              onViewSchedule={() => {}}
            />
          </View>
        )}
        <CategoryCarousel />
        <TrendingNearYou
          data={trendingData}
          isLoading={isLoading}
          hasError={hasError}
          onRetry={loadHomeData}
        />

      </Animated.ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    // paddingBottom: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  activeOrderSection: {
    marginTop: 20,
  },
});
