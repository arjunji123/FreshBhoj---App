import React, { forwardRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '@app/theme/index';
import { Button, Sheet, type SheetHandle } from '@components/ui';
import FoodTypeDot from '@components/ui/FoodTypeDot';
import type { FoodType, GoalTag, GoalTagOption } from '@api/types';
import type { MealSortBy } from '@api/endpoints/meals.api';

export interface PriceRange {
  minPrice?: number;
  maxPrice?: number;
}

const SORTS: Array<{ key: MealSortBy; label: string }> = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'rating', label: 'Top rated' },
  { key: 'protein_high', label: 'Most protein' },
  { key: 'calories_low', label: 'Fewest calories' },
  { key: 'price_low', label: 'Price: low to high' },
  { key: 'price_high', label: 'Price: high to low' },
];

const PRICE_RANGES: Array<{ label: string; range: PriceRange }> = [
  { label: 'Under ₹150', range: { maxPrice: 150 } },
  { label: '₹150 – 300', range: { minPrice: 150, maxPrice: 300 } },
  { label: '₹300 – 500', range: { minPrice: 300, maxPrice: 500 } },
  { label: 'Above ₹500', range: { minPrice: 500 } },
];

const PROTEIN_OPTIONS = [15, 25, 35];
const CALORIE_OPTIONS = [400, 600, 800];

const FOOD_TYPES: Array<{ key: FoodType; label: string }> = [
  { key: 'VEG', label: 'Veg' },
  { key: 'NON_VEG', label: 'Non-Veg' },
  { key: 'EGG', label: 'Egg' },
];

interface SearchFiltersSheetProps {
  goalOptions: GoalTagOption[];
  goalTags: GoalTag[];
  onToggleGoal: (tag: GoalTag) => void;
  foodTypes: FoodType[];
  onToggleFoodType: (type: FoodType) => void;
  sortBy: MealSortBy;
  onChangeSortBy: (sort: MealSortBy) => void;
  priceRange: PriceRange;
  onChangePriceRange: (range: PriceRange) => void;
  minProtein?: number;
  onChangeMinProtein: (value?: number) => void;
  maxCalories?: number;
  onChangeMaxCalories: (value?: number) => void;
  onReset: () => void;
  onApply: () => void;
  resultCount: number;
}

const samePriceRange = (a: PriceRange, b: PriceRange) =>
  a.minPrice === b.minPrice && a.maxPrice === b.maxPrice;

/**
 * The one place every search filter lives — sort, price, food type, protein,
 * calories and health goals — so "filter" means something instead of just
 * being a decorative icon next to the quick sort chips.
 */
const SearchFiltersSheet = forwardRef<SheetHandle, SearchFiltersSheetProps>(
  (
    {
      goalOptions,
      goalTags,
      onToggleGoal,
      foodTypes,
      onToggleFoodType,
      sortBy,
      onChangeSortBy,
      priceRange,
      onChangePriceRange,
      minProtein,
      onChangeMinProtein,
      maxCalories,
      onChangeMaxCalories,
      onReset,
      onApply,
      resultCount,
    },
    ref,
  ) => (
    <Sheet ref={ref} eyebrow="FILTER & SORT" title="Find your meal" heightRatio={0.88}>
      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Sort by">
          <View style={styles.wrap}>
            {SORTS.map((option) => (
              <FilterPill
                key={option.key}
                label={option.label}
                selected={sortBy === option.key}
                onPress={() => onChangeSortBy(option.key)}
              />
            ))}
          </View>
        </Section>

        <Section title="Price">
          <View style={styles.wrap}>
            {PRICE_RANGES.map((option) => {
              const isSelected = samePriceRange(priceRange, option.range);
              return (
                <FilterPill
                  key={option.label}
                  label={option.label}
                  selected={isSelected}
                  onPress={() => onChangePriceRange(isSelected ? {} : option.range)}
                />
              );
            })}
          </View>
        </Section>

        <Section title="Food type">
          <View style={styles.wrap}>
            {FOOD_TYPES.map((option) => (
              <FilterPill
                key={option.key}
                label={option.label}
                icon={<FoodTypeDot type={option.key} size={10} />}
                selected={foodTypes.includes(option.key)}
                onPress={() => onToggleFoodType(option.key)}
              />
            ))}
          </View>
        </Section>

        <Section title="Protein">
          <View style={styles.wrap}>
            {PROTEIN_OPTIONS.map((value) => (
              <FilterPill
                key={value}
                label={`${value}g+`}
                selected={minProtein === value}
                onPress={() => onChangeMinProtein(minProtein === value ? undefined : value)}
              />
            ))}
          </View>
        </Section>

        <Section title="Calories">
          <View style={styles.wrap}>
            {CALORIE_OPTIONS.map((value) => (
              <FilterPill
                key={value}
                label={`Under ${value} kcal`}
                selected={maxCalories === value}
                onPress={() => onChangeMaxCalories(maxCalories === value ? undefined : value)}
              />
            ))}
          </View>
        </Section>

        {goalOptions.length ? (
          <Section title="Health goals">
            <View style={styles.wrap}>
              {goalOptions.map((option) => (
                <FilterPill
                  key={option.key}
                  label={option.label}
                  selected={goalTags.includes(option.key)}
                  onPress={() => onToggleGoal(option.key)}
                />
              ))}
            </View>
          </Section>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={onReset} hitSlop={theme.layout.hitSlop}>
          <Text style={[theme.text.label, styles.resetText]}>Reset all</Text>
        </Pressable>
        <Button
          title={`Show ${resultCount} ${resultCount === 1 ? 'result' : 'results'}`}
          onPress={onApply}
          fullWidth={false}
          style={styles.applyButton}
        />
      </View>
    </Sheet>
  ),
);

SearchFiltersSheet.displayName = 'SearchFiltersSheet';

export default SearchFiltersSheet;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={[theme.text.h4, styles.sectionTitle]}>{title}</Text>
    {children}
  </View>
);

const FilterPill: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}> = ({ label, selected, onPress, icon }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    style={[styles.pill, selected ? styles.pillSelected : null]}
  >
    {icon}
    <Text
      style={[
        theme.text.label,
        { color: selected ? theme.colors.primary[700] : theme.colors.text.secondary },
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  scrollFlex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.raised,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
  },
  pillSelected: {
    backgroundColor: theme.colors.surface.brandWash,
    borderColor: theme.colors.borders.brand,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borders.subtle,
  },
  resetText: {
    color: theme.colors.primary[600],
  },
  applyButton: {
    flex: 1,
    maxWidth: 260,
  },
});
