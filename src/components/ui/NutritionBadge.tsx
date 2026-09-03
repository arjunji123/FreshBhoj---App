import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Beef, Flame } from 'lucide-react-native';
import { theme } from '@app/theme/index';

interface NutritionBadgeRowProps {
  calories?: number | null;
  proteinG?: number | null;
  style?: StyleProp<ViewStyle>;
  /** `compact` fits a meal card; `full` is for the detail header. */
  size?: 'compact' | 'full';
}

/**
 * Calories + protein at a glance — the FreshBhoj trust promise, shown on every
 * meal card. Iconography-led rather than plain text so it reads as data, not
 * marketing copy, and stays legible at card size.
 */
export const NutritionBadgeRow: React.FC<NutritionBadgeRowProps> = ({
  calories,
  proteinG,
  style,
  size = 'compact',
}) => {
  const hasCalories = typeof calories === 'number' && calories > 0;
  const hasProtein = typeof proteinG === 'number' && proteinG > 0;
  if (!hasCalories && !hasProtein) return null;

  const iconSize = size === 'compact' ? 11 : 14;
  const textStyle = size === 'compact' ? theme.text.caption : theme.text.label;

  return (
    <View style={[styles.row, style]}>
      {hasCalories ? (
        <View style={[styles.pill, styles.caloriePill]}>
          <Flame size={iconSize} color={theme.colors.amber[600]} strokeWidth={2.5} />
          <Text style={[textStyle, styles.calorieText]}>{Math.round(calories!)} kcal</Text>
        </View>
      ) : null}

      {hasProtein ? (
        <View style={[styles.pill, styles.proteinPill]}>
          <Beef size={iconSize} color={theme.colors.accent[600]} strokeWidth={2.5} />
          <Text style={[textStyle, styles.proteinText]}>{Math.round(proteinG!)}g protein</Text>
        </View>
      ) : null}
    </View>
  );
};

export default NutritionBadgeRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  caloriePill: { backgroundColor: theme.colors.amber[50] },
  proteinPill: { backgroundColor: theme.colors.accent[50] },
  calorieText: { color: theme.colors.amber[700] },
  proteinText: { color: theme.colors.accent[700] },
});
