import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Dumbbell,
  Flame,
  Heart,
  Leaf,
  TrendingDown,
} from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Chip, ChipRow } from '@components/ui';
import type { GoalTag, GoalTagOption } from '@api/types';

interface GoalFilterRowProps {
  options: GoalTagOption[];
  selected: GoalTag[];
  onToggle: (tag: GoalTag) => void;
}

/** Icon per goal, keyed off the `icon` slug the backend sends. */
const ICONS: Record<string, React.FC<{ size: number; color: string; strokeWidth: number }>> = {
  dumbbell: Dumbbell,
  leaf: Leaf,
  'trending-down': TrendingDown,
  flame: Flame,
  heart: Heart,
};

/**
 * Goal-based quick filters. Multi-select: someone can be chasing high protein
 * *and* low calorie, and the API's `hasSome` filter handles the union.
 */
const GoalFilterRow: React.FC<GoalFilterRowProps> = ({ options, selected, onToggle }) => {
  if (!options.length) return null;

  return (
    <View style={styles.container}>
      <ChipRow>
        {options.map((option) => {
          const Icon = ICONS[option.icon] ?? Leaf;
          const isSelected = selected.includes(option.key);

          return (
            <Chip
              key={option.key}
              label={option.label}
              selected={isSelected}
              onPress={() => onToggle(option.key)}
              icon={
                <Icon
                  size={14}
                  color={isSelected ? theme.colors.text.inverse : theme.colors.accent[600]}
                  strokeWidth={2.4}
                />
              }
            />
          );
        })}
      </ChipRow>
    </View>
  );
};

export default GoalFilterRow;

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.lg,
  },
});
