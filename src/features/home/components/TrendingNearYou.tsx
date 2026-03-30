import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {SlidersHorizontal} from 'lucide-react-native';
import {theme} from '@app/theme/index';
import GradientText from '@components/GradientText';
import FoodCard from '@components/FoodCard';
import {TRENDING_DATA} from '../home.constants';

const HORIZONTAL_PADDING = 20;
const CARD_GAP = 20;

const TrendingNearYou = () => {
  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Trending Near You</Text>
          <Text style={styles.headerSubtitle}>
            Popular dishes that others are loving
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <GradientText
            colors={theme.colors.defaultColor}
            direction="diagonal">
            <Text style={styles.filterText}>Filters</Text>
          </GradientText>
          <SlidersHorizontal size={18} color={theme.colors.gradient2} />
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {TRENDING_DATA.map(item => (
          <FoodCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
};

export default TrendingNearYou;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.aBeeZee.regular,
    color: theme.colors.palette.black,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: theme.colors.palette.gray1,
    marginTop: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  filterText: {
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },
});
