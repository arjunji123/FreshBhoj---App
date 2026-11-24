import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/theme/useTheme';
import type { MealNutrition } from '@api/types';
import { MACRO_COLORS } from '../fit.constants';

interface MacroPillsProps {
  nutrition: MealNutrition;
}

/** kcal / protein / carbs / fat as four colour-coded numbers. */
const MacroPills: React.FC<MacroPillsProps> = ({ nutrition }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const items: Array<{ key: string; value: number | null; unit: string; color: string; label: string }> = [
    { key: 'k', value: nutrition.calories, unit: '', label: 'kcal', color: MACRO_COLORS.kcal },
    { key: 'p', value: nutrition.proteinG, unit: 'g', label: 'protein', color: MACRO_COLORS.protein },
    { key: 'c', value: nutrition.carbsG, unit: 'g', label: 'carbs', color: MACRO_COLORS.carbs },
    { key: 'f', value: nutrition.fatG, unit: 'g', label: 'fat', color: MACRO_COLORS.fat },
  ];
  if (items.every((i) => i.value == null)) return null;
  return (
    <View style={styles.row}>
      {items.map((i) => (
        <View key={i.key} style={styles.item}>
          <Text style={[styles.value, { color: i.color }]}>
            {i.value == null ? '-' : Math.round(i.value)}
            <Text style={styles.unit}>{i.unit}</Text>
          </Text>
          <Text style={styles.label}>{i.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default MacroPills;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: theme.spacing.md },
    item: { alignItems: 'flex-start' },
    value: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
    unit: { fontSize: 11, fontWeight: '700' },
    label: { fontSize: 10, color: theme.colors.text.tertiary, fontWeight: '600', marginTop: -1 },
  });
