import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Search as SearchIcon, X, Clock, TrendingUp, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import FoodCard from '@components/FoodCard';
import GradientText from '@components/GradientText';
import AppGradient from '@components/AppGradient';
import { TRENDING_DATA } from '@features/home/home.constants';

const RECENT_SEARCHES = ['Thali', 'Biryani near me', 'Healthy breakfast', 'Paneer dishes'];
const POPULAR_TAGS = ['Veg', 'Non-Veg', 'Tiffin', 'Lunch Box', 'Snacks', 'Desserts', 'Breakfast', 'Diet'];
const NEAR_ME_DATA = TRENDING_DATA.slice(0, 4);

const Search = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const insets = useSafeAreaInsets();

  const handleClear = useCallback(() => setQuery(''), []);

  const filteredResults = query.trim().length > 0
    ? TRENDING_DATA.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.restaurant.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find your next favorite meal</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <SearchIcon size={18} color={isFocused ? theme.colors.gradient2 : '#94A3B8'} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food, kitchens, cuisines..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
              <X size={18} color="#94A3B8" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Results */}
        {filteredResults.length > 0 ? (
          <View>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginBottom: 12 }]}>
              Results for "{query}"
            </Text>
            <View style={styles.grid}>
              {filteredResults.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </View>
          </View>
        ) : query.length > 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>Try different keywords</Text>
          </View>
        ) : (
          <>
            {/* Recent Searches */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock size={16} color="#94A3B8" strokeWidth={2} />
                <Text style={styles.sectionTitle}>Recent Searches</Text>
              </View>
              <View style={styles.tagsRow}>
                {RECENT_SEARCHES.map((search) => (
                  <TouchableOpacity
                    key={search}
                    onPress={() => setQuery(search)}
                    activeOpacity={0.7}
                    style={styles.recentTag}
                  >
                    <Text style={styles.recentTagText}>{search}</Text>
                    <X size={12} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Popular Tags */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={16} color={theme.colors.gradient2} strokeWidth={2} />
                <GradientText
                  colors={theme.colors.defaultColor}
                  direction="diagonal"
                  style={styles.sectionTitle}
                >
                  Trending Tags
                </GradientText>
              </View>
              <View style={styles.tagsRow}>
                {POPULAR_TAGS.map((tag) => (
                  <TouchableOpacity key={tag} onPress={() => setQuery(tag)} activeOpacity={0.7}>
                    <AppGradient
                      colors={theme.colors.defaultColor}
                      locations={theme.colors.defaultLocations}
                      direction="diagonal"
                      style={styles.trendingTag}
                    >
                      <Text style={styles.trendingTagText}>{tag}</Text>
                    </AppGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Near Me */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MapPin size={16} color={theme.colors.gradient2} strokeWidth={2} />
                <Text style={styles.sectionTitle}>Popular Near You</Text>
              </View>
              <View style={styles.grid}>
                {NEAR_ME_DATA.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.display2,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: '#94A3B8',
    marginTop: 2,
  },
  searchBarWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  searchBarFocused: {
    borderColor: theme.colors.gradient2,
    backgroundColor: '#FFF5F5',
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: '#0F172A',
    padding: 0,
  },
  scrollContent: {
    paddingTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: '#0F172A',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  recentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  recentTagText: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    color: '#475569',
  },
  trendingTag: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  trendingTagText: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: '#94A3B8',
    marginTop: 6,
  },
});
