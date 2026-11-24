import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Droplet } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';
import { MACRO_COLORS } from '../fit.constants';
import { useFitStore, useWaterToday, WATER_GOAL } from '../store/fitStore';

/** Tap a drop to log a glass of water. Resets by itself each day. */
const HydrationCard: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const glasses = useWaterToday();
  const setWater = useFitStore((s) => s.setWater);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Hydration</Text>
          <Text style={styles.sub}>
            {glasses >= WATER_GOAL ? 'Goal reached. Great job!' : `${glasses} of ${WATER_GOAL} glasses today`}
          </Text>
        </View>
        <Text style={styles.big}>{(glasses * 0.25).toFixed(1)}L</Text>
      </View>
      <View style={styles.drops}>
        {Array.from({ length: WATER_GOAL }).map((_, i) => {
          const filled = i < glasses;
          return (
            <PressableScale
              key={i}
              haptic
              scaleTo={0.85}
              hitSlop={6}
              // Tapping the last filled drop undoes it.
              onPress={() => setWater(filled && i === glasses - 1 ? i : i + 1)}
              accessibilityRole="button"
              accessibilityLabel={`Glass ${i + 1}`}
              style={[styles.drop, filled ? styles.dropOn : null]}
            >
              <Droplet
                size={18}
                color={filled ? MACRO_COLORS.fat : theme.colors.text.tertiary}
                fill={filled ? MACRO_COLORS.fat : 'none'}
                strokeWidth={2.2}
              />
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
};

export default HydrationCard;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      marginHorizontal: theme.layout.screenPadding,
      padding: theme.spacing.md,
      gap: theme.spacing.md,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface.raised,
      borderWidth: 1,
      borderColor: theme.colors.borders.subtle,
    },
    head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { ...theme.text.h4, color: theme.colors.text.primary },
    sub: { ...theme.text.caption, color: theme.colors.text.secondary },
    big: { fontSize: 24, fontWeight: '800', color: MACRO_COLORS.fat },
    drops: { flexDirection: 'row', justifyContent: 'space-between' },
    drop: {
      width: 36,
      height: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.subtle,
    },
    dropOn: { backgroundColor: 'rgba(59,130,246,0.16)' },
  });
