import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Dumbbell, Flame, Leaf, Salad } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';
import { FIT, FIT_GOALS, type FitGoal } from '../fit.constants';

const ICONS: Record<FitGoal, React.FC<{ size: number; color: string; strokeWidth: number }>> = {
  ALL: Salad,
  MUSCLE_GAIN: Dumbbell,
  FAT_LOSS: Flame,
  BALANCED: Leaf,
};

interface GoalPickerProps {
  value: FitGoal;
  onChange: (goal: FitGoal) => void;
}

/** Four big goal tiles. The selected one fills with the Fit green. */
const GoalPicker: React.FC<GoalPickerProps> = ({ value, onChange }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {FIT_GOALS.map((g) => {
        const selected = g.key === value;
        const Icon = ICONS[g.key];
        return (
          <PressableScale
            key={g.key}
            onPress={() => onChange(g.key)}
            scaleTo={0.95}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={g.label}
            style={[styles.tile, selected ? styles.tileOn : null]}
          >
            <Icon size={22} color={selected ? FIT.lime : theme.colors.text.brand} strokeWidth={2.2} />
            <Text style={[styles.label, selected ? styles.labelOn : null]}>{g.label}</Text>
            <Text style={[styles.hint, selected ? styles.hintOn : null]}>{g.hint}</Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
};

export default GoalPicker;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    row: { paddingHorizontal: theme.layout.screenPadding, gap: theme.spacing.sm },
    tile: {
      width: 124,
      padding: theme.spacing.md,
      gap: 4,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface.raised,
      borderWidth: 1,
      borderColor: theme.colors.borders.subtle,
    },
    tileOn: { backgroundColor: FIT.deep, borderColor: FIT.emerald },
    label: { ...theme.text.label, color: theme.colors.text.primary, marginTop: 4 },
    labelOn: { color: FIT.onHero },
    hint: { ...theme.text.caption, color: theme.colors.text.secondary },
    hintOn: { color: FIT.heroMuted },
  });
