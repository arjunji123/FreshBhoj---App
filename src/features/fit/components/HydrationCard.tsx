import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';
import { useThemeStore } from '@app/theme/themeStore';
import { useFitStore, useWaterToday, WATER_GOAL } from '../store/fitStore';
import WaterDrop from './WaterDrop';

const GLASS_LITRES = 0.25;

/** Water-blue surfaces for each theme; drops and the progress bar look the same in both. */
const SURFACE = {
  light: { card: ['#E8F6FF', '#CDE9FF'], title: '#0B3A66', sub: '#3F6C94', track: 'rgba(255,255,255,0.85)' },
  dark: { card: ['#0E2A44', '#0A1F35'], title: '#E6F4FF', sub: '#9CC5E6', track: 'rgba(255,255,255,0.14)' },
};

const message = (glasses: number) => {
  if (glasses >= WATER_GOAL) return 'Goal reached. Great job!';
  if (glasses === 0) return 'Tap a drop after every glass';
  const left = WATER_GOAL - glasses;
  return `${left} ${left === 1 ? 'glass' : 'glasses'} to go`;
};

/** Tap a drop to log a glass of water. Resets by itself each day. */
const HydrationCard: React.FC = () => {
  const theme = useTheme();
  const scheme = useThemeStore((s) => s.resolvedScheme) === 'dark' ? 'dark' : 'light';
  const colors = SURFACE[scheme];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const glasses = useWaterToday();
  const setWater = useFitStore((s) => s.setWater);
  const percent = Math.min(100, Math.round((glasses / WATER_GOAL) * 100));

  return (
    <LinearGradient colors={colors.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={[styles.title, { color: colors.title }]}>Hydration</Text>
          <Text style={[styles.sub, { color: colors.sub }]}>{message(glasses)}</Text>
        </View>
        <Text style={[styles.amount, { color: colors.title }]}>
          {(glasses * GLASS_LITRES).toFixed(2).replace(/0$/, '')}
          <Text style={[styles.amountUnit, { color: colors.sub }]}> / {WATER_GOAL * GLASS_LITRES} L</Text>
        </Text>
      </View>

      <View style={styles.drops}>
        {Array.from({ length: WATER_GOAL }).map((_, i) => {
          const filled = i < glasses;
          return (
            <PressableScale
              key={i}
              haptic
              scaleTo={0.85}
              hitSlop={4}
              // Tapping the last filled drop undoes it.
              onPress={() => setWater(filled && i === glasses - 1 ? i : i + 1)}
              accessibilityRole="button"
              accessibilityLabel={`Glass ${i + 1}`}
              accessibilityState={{ selected: filled }}
              style={styles.drop}
            >
              <WaterDrop filled={filled} width={20} />
            </PressableScale>
          );
        })}
      </View>

      <View style={[styles.track, { backgroundColor: colors.track }]}>
        <LinearGradient
          colors={['#7FD4FF', '#2E9BFF', '#0A5FD1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${percent}%` }]}
        />
      </View>
    </LinearGradient>
  );
};

export default HydrationCard;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      marginHorizontal: theme.layout.screenPadding,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      borderRadius: theme.radius.xl,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    headText: { flex: 1 },
    title: { ...theme.text.h4 },
    sub: { ...theme.text.caption, marginTop: 1 },
    amount: { fontSize: 20, fontWeight: '800' },
    amountUnit: { fontSize: 12, fontWeight: '600' },
    drops: { flexDirection: 'row', justifyContent: 'space-between' },
    drop: { alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
    track: { height: 6, borderRadius: 3, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 3 },
  });
