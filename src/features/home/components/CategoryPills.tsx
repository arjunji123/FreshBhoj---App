import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { theme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';
import { CATEGORIES } from '../home.constants';

const PILL_ICON = require('@assets/images/home_pill_icon.png');

const CategoryPills = () => {
  const [activeCategory, setActiveCategory] = React.useState(CATEGORIES[0]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isActive = category === activeCategory;
          return (
            <TouchableOpacity
              key={category}
              activeOpacity={0.7}
              onPress={() => setActiveCategory(category)}
            >
              <AppGradient
                colors={isActive ? theme.colors.defaultColor : ['#FDEAEA', '#FDEAEA', '#FDEAEA']}
                locations={theme.colors.defaultLocations}
                direction="diagonal"
                style={styles.pill}
              >
                <Image source={PILL_ICON} style={styles.pillIcon} />
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {category}
                </Text>
              </AppGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategoryPills;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    paddingVertical: 8,
    paddingRight: 16,
    paddingLeft: 12,
    borderRadius: theme.spacing.borderRadius.round,
    gap: 8,
  },
  pillIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.spacing.borderRadius.round,
  },
  pillText: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: theme.colors.gradient2,
  },
  pillTextActive: {
    color: theme.colors.palette.white,
  },
});
