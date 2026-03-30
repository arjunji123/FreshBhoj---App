import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import HomeHeader from '../components/HomeHeader';
import CategoryPills from '../components/CategoryPills';
import KitchenStories from '../components/KitchenStories';
import CategoryCarousel from '../components/CategoryCarousel';
import TrendingNearYou from '../components/TrendingNearYou';
import ActiveTiffinCard from '@features/active-orders/components/ActiveTiffinCard';
import { useActiveOrder } from '@features/active-orders/hooks/useActiveOrder';

const Home = () => {
  const activeOrder = useActiveOrder();
  const scrollY = useSharedValue(0);

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
        <TrendingNearYou />

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
