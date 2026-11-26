import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Pencil, Target } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';
import { FIT } from '../fit.constants';
import type { CartNutrition, FitTargets } from '../fit.utils';
import ProgressRing from './ProgressRing';

interface TodayCardProps {
  targets: FitTargets | null;
  inCart: CartNutrition;
  onSetTarget: () => void;
}

/** The day at a glance: how much of the calorie and protein target the cart covers. */
const TodayCard: React.FC<TodayCardProps> = ({ targets, inCart, onSetTarget }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const kcalLeft = targets ? Math.max(0, targets.kcal - inCart.kcal) : 0;
  const proteinLeft = targets ? Math.max(0, targets.proteinG - inCart.proteinG) : 0;

  return (
    <LinearGradient
      colors={[FIT.forest, FIT.deep, FIT.emerald]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {targets ? (
        <>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>Today</Text>
            <PressableScale
              onPress={onSetTarget}
              haptic={false}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Edit daily target"
              style={styles.edit}
            >
              <Pencil size={13} color={FIT.onHero} strokeWidth={2.4} />
            </PressableScale>
          </View>
          <View style={styles.row}>
            <ProgressRing
              size={88}
              stroke={8}
              progress={inCart.kcal / targets.kcal}
              color={FIT.lime}
              trackColor={FIT.glass}
            >
              <Text style={styles.ringValue}>{kcalLeft}</Text>
              <Text style={styles.ringLabel}>kcal left</Text>
            </ProgressRing>

            <View style={styles.bars}>
              <Bar label="Calories" value={inCart.kcal} target={targets.kcal} unit="kcal" styles={styles} />
              <Bar label="Protein" value={inCart.proteinG} target={targets.proteinG} unit="g" styles={styles} />
            </View>
          </View>

          <Text style={styles.summary}>
            {inCart.kcal === 0
              ? `Nothing in your cart yet. You need ${proteinLeft}g of protein today.`
              : proteinLeft === 0
              ? 'Your cart covers your protein for the day.'
              : `Your cart still leaves ${proteinLeft}g of protein to go.`}
          </Text>
        </>
      ) : (
        <View style={styles.setup}>
          <Text style={styles.setupTitle}>Know what to eat today</Text>
          <Text style={styles.setupSub}>
            Answer a few questions and get your daily calories and protein. Every meal then shows how
            well it fits.
          </Text>
          <PressableScale
            onPress={onSetTarget}
            accessibilityRole="button"
            accessibilityLabel="Set my daily target"
            style={styles.cta}
          >
            <Target size={16} color={FIT.forest} strokeWidth={2.6} />
            <Text style={styles.ctaText}>Set my daily target</Text>
          </PressableScale>
        </View>
      )}

    </LinearGradient>
  );
};

interface BarProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  styles: ReturnType<typeof createStyles>;
}

const Bar: React.FC<BarProps> = ({ label, value, target, unit, styles }) => {
  const percent = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <View>
      <View style={styles.barHead}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>
          {value}/{target}
          {unit === 'g' ? 'g' : ''}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
};

export default TodayCard;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      marginHorizontal: theme.layout.screenPadding,
      borderRadius: theme.radius.xxl,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg },
    ringValue: { color: FIT.onHero, fontSize: 18, fontWeight: '800' },
    ringLabel: { color: FIT.heroMuted, fontSize: 10, fontWeight: '600' },
    bars: { flex: 1, gap: theme.spacing.sm },
    barHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    barLabel: { color: FIT.onHero, fontSize: 13, fontWeight: '700' },
    barValue: { color: FIT.heroMuted, fontSize: 12, fontWeight: '600' },
    track: { height: 7, borderRadius: 4, backgroundColor: FIT.glass, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 4, backgroundColor: FIT.lime },
    summary: { color: FIT.onHero, fontSize: 12, lineHeight: 17, fontWeight: '600' },
    setup: { gap: theme.spacing.sm },
    setupTitle: { color: FIT.onHero, fontSize: 18, fontWeight: '800' },
    setupSub: { color: FIT.heroMuted, fontSize: 13, lineHeight: 19 },
    cta: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: theme.spacing.xs,
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: theme.radius.pill,
      backgroundColor: FIT.lime,
    },
    ctaText: { color: FIT.forest, fontSize: 14, fontWeight: '800' },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { color: FIT.onHero, fontSize: 15, fontWeight: '800' },
    edit: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: FIT.glass,
    },
  });
