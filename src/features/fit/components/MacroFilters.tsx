import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Beef, Flame, Leaf, Store } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';
import { FIT, MACRO_COLORS } from '../fit.constants';

export interface MacroFilterState {
  highProtein: boolean;
  lowCal: boolean;
  vegOnly: boolean;
  openNow: boolean;
}

export const NO_MACRO_FILTERS: MacroFilterState = {
  highProtein: false,
  lowCal: false,
  vegOnly: false,
  openNow: false,
};

const CHIPS: Array<{ key: keyof MacroFilterState; label: string; Icon: React.FC<{ size: number; color: string; strokeWidth: number }>; color: string }> = [
  { key: 'highProtein', label: '30g+ protein', Icon: Beef, color: MACRO_COLORS.protein },
  { key: 'lowCal', label: 'Under 400 kcal', Icon: Flame, color: MACRO_COLORS.kcal },
  { key: 'vegOnly', label: 'Veg only', Icon: Leaf, color: MACRO_COLORS.protein },
  { key: 'openNow', label: 'Open now', Icon: Store, color: MACRO_COLORS.fat },
];

interface MacroFiltersProps {
  value: MacroFilterState;
  onToggle: (key: keyof MacroFilterState) => void;
}

/** One-tap macro filters that map straight onto the meals API. */
const MacroFilters: React.FC<MacroFiltersProps> = ({ value, onToggle }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {CHIPS.map(({ key, label, Icon, color }) => {
        const on = value[key];
        return (
          <PressableScale
            key={key}
            onPress={() => onToggle(key)}
            haptic={false}
            scaleTo={0.95}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[styles.chip, on ? { backgroundColor: FIT.deep, borderColor: FIT.emerald } : null]}
          >
            <Icon size={14} color={on ? FIT.lime : color} strokeWidth={2.4} />
            <Text style={[styles.text, on ? { color: FIT.onHero } : null]}>{label}</Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
};

export default MacroFilters;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    row: { paddingHorizontal: theme.layout.screenPadding, gap: theme.spacing.sm },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface.raised,
      borderWidth: 1,
      borderColor: theme.colors.borders.subtle,
    },
    text: { ...theme.text.label, color: theme.colors.text.primary },
  });
