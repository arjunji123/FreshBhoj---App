import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { FitStreak } from '@api/endpoints/orders.api';
import { useTheme } from '@app/theme/useTheme';
import { FIT } from '../fit.constants';
import FitBadge from './FitBadge';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const message = ({ current, todayDone }: FitStreak) => {
  if (todayDone) return 'Done for today. Come back tomorrow to keep it going.';
  if (current > 0) return 'Order a Fit meal today to keep your streak.';
  return 'Order a Fit meal to start your streak.';
};

/** Daily streak with the last seven days; today is the right-most circle. */
const StreakCard: React.FC<{ streak: FitStreak }> = ({ streak }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <FitBadge size={46} />
        <View style={styles.headText}>
          <Text style={styles.title}>
            {streak.current} day streak
          </Text>
          <Text style={styles.sub} numberOfLines={2}>{message(streak)}</Text>
        </View>
        <View style={styles.best}>
          <Text style={styles.bestValue}>{streak.best}</Text>
          <Text style={styles.bestLabel}>best</Text>
        </View>
      </View>

      <View style={styles.week}>
        {streak.week.map((day, index) => {
          const isToday = index === streak.week.length - 1;
          // `date` is a plain calendar day, so read its weekday in UTC.
          const letter = DAY_LETTERS[new Date(`${day.date}T00:00:00Z`).getUTCDay()];
          return (
            <View key={day.date} style={styles.day}>
              <View style={[styles.dot, isToday ? styles.dotToday : null, day.done ? styles.dotDone : null]}>
                {day.done ? <Check size={14} color={FIT.forest} strokeWidth={3} /> : null}
              </View>
              <Text style={[styles.dayLetter, isToday ? styles.dayLetterToday : null]}>{letter}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default StreakCard;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      marginHorizontal: theme.layout.screenPadding,
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      gap: theme.spacing.md,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface.raised,
      ...theme.elevation.sm,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    headText: { flex: 1 },
    title: { ...theme.text.h4, color: theme.colors.text.primary },
    sub: { ...theme.text.caption, color: theme.colors.text.secondary, marginTop: 1 },
    best: { alignItems: 'center' },
    bestValue: { ...theme.text.h3, color: theme.colors.text.brand },
    bestLabel: { ...theme.text.caption, color: theme.colors.text.tertiary },
    week: { flexDirection: 'row', justifyContent: 'space-between' },
    day: { alignItems: 'center', gap: 4 },
    dot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.subtle,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    dotToday: { borderColor: theme.colors.primary[600] },
    dotDone: { backgroundColor: FIT.lime },
    dayLetter: { ...theme.text.caption, color: theme.colors.text.tertiary },
    dayLetterToday: { color: theme.colors.text.brand, fontWeight: '800' },
  });
