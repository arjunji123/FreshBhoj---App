import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import {
  Dumbbell,
  Flame,
  Heart,
  Leaf,
  TrendingDown,
} from 'lucide-react-native';
import { theme as staticTheme } from '@app/theme/index';
import { useTheme } from '@app/theme/useTheme';
import { Skeleton } from '@components/ui';
import PressableScale from '@animations/PressableScale';
import { enterRise } from '@animations/motion';
import type { GoalTag, GoalTagOption } from '@api/types';
import { HOME_COPY } from '../home.constants';
import HomeSectionHeader from './HomeSectionHeader';

interface GoalFilterRowProps {
  options: GoalTagOption[];
  selected: GoalTag[];
  onToggle: (tag: GoalTag) => void;
  isLoading?: boolean;
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
 * "Eat your goal" chips. Multi-select: someone can be chasing high protein
 * *and* low calorie, and the API's `hasSome` filter handles the union.
 */
const GoalFilterRow: React.FC<GoalFilterRowProps> = ({ options, selected, onToggle, isLoading }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} width={96} height={32} radius={staticTheme.radius.pill} />
          ))}
        </View>
      </View>
    );
  }

  if (!options.length) return null;

  return (
    <View style={styles.container}>
      <HomeSectionHeader title={HOME_COPY.goalTitle} subtitle={HOME_COPY.goalSubtitle} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {options.map((option, index) => {
          const Icon = ICONS[option.icon] ?? Leaf;
          const isSelected = selected.includes(option.key);

          return (
            <Animated.View key={option.key} entering={enterRise(index)}>
              <PressableScale
                onPress={() => onToggle(option.key)}
                scaleTo={0.93}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={[styles.chip, isSelected ? styles.chipSelected : styles.chipIdle]}
              >
                <Icon
                  size={14}
                  color={isSelected ? staticTheme.colors.palette.white : theme.colors.primary[600]}
                  strokeWidth={2.4}
                />
                <Text
                  style={[
                    theme.text.caption,
                    styles.label,
                    { color: isSelected ? staticTheme.colors.palette.white : theme.colors.text.primary },
                  ]}
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
              </PressableScale>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default GoalFilterRow;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    marginTop: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipIdle: {
    backgroundColor: theme.colors.surface.raised,
    borderColor: theme.colors.overlay.primaryBorder,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  label: {
    fontSize: 12,
  },
});
