import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '@app/theme/index';
import type { MealDetail } from '@api/types';

interface NutritionPanelProps {
  nutrition: MealDetail['nutrition'];
  servingSize?: string | null;
}

const RING_SIZE = 116;
const STROKE = 12;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MACROS = [
  { key: 'proteinPercent', label: 'Protein', gramKey: 'proteinG', color: theme.colors.accent[600] },
  { key: 'carbsPercent', label: 'Carbs', gramKey: 'carbsG', color: theme.colors.amber[500] },
  { key: 'fatPercent', label: 'Fat', gramKey: 'fatG', color: theme.colors.primary[500] },
] as const;

/**
 * The nutrition block — the most visually important part of the detail page.
 *
 * Calories lead as a single big number, and the macro split is a stacked donut
 * rather than a table: three arcs read faster than three rows, and the ratio
 * (not the raw grams) is what people actually compare between meals.
 */
const NutritionPanel: React.FC<NutritionPanelProps> = ({ nutrition, servingSize }) => {
  const { macroSplit } = nutrition;
  const hasMacros =
    macroSplit.proteinPercent + macroSplit.carbsPercent + macroSplit.fatPercent > 0;

  // Each arc starts where the previous one ended, walking around the circle.
  let offsetPercent = 0;
  const arcs = MACROS.map((macro) => {
    const percent = macroSplit[macro.key];
    const arc = {
      ...macro,
      percent,
      dashArray: `${(percent / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`,
      rotation: (offsetPercent / 100) * 360 - 90,
    };
    offsetPercent += percent;
    return arc;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={theme.text.h3}>Nutrition</Text>
        {servingSize ? (
          <Text style={[theme.text.caption, styles.serving]}>per {servingSize}</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <View style={styles.ringWrap}>
          {hasMacros ? (
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke={theme.colors.neutral[100]}
                strokeWidth={STROKE}
                fill="none"
              />
              {arcs.map((arc) => (
                <Circle
                  key={arc.key}
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke={arc.color}
                  strokeWidth={STROKE}
                  strokeDasharray={arc.dashArray}
                  strokeLinecap="butt"
                  fill="none"
                  originX={RING_SIZE / 2}
                  originY={RING_SIZE / 2}
                  rotation={arc.rotation}
                />
              ))}
            </Svg>
          ) : (
            <View style={styles.ringPlaceholder} />
          )}

          <View style={styles.ringCenter} pointerEvents="none">
            <Text style={[theme.text.displaySmall, styles.calories]}>
              {nutrition.calories ?? '—'}
            </Text>
            <Text style={[theme.text.caption, styles.caloriesLabel]}>kcal</Text>
          </View>
        </View>

        <View style={styles.legend}>
          {arcs.map((arc) => (
            <View key={arc.key} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: arc.color }]} />
              <Text style={[theme.text.bodyMedium, styles.legendLabel]}>{arc.label}</Text>
              <Text style={[theme.text.bodyMedium, styles.legendGrams]}>
                {formatGrams(nutrition[arc.gramKey])}
              </Text>
              <Text style={[theme.text.caption, styles.legendPercent]}>{arc.percent}%</Text>
            </View>
          ))}

          {typeof nutrition.fiberG === 'number' && nutrition.fiberG > 0 ? (
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, styles.fibreDot]} />
              <Text style={[theme.text.bodyMedium, styles.legendLabel]}>Fibre</Text>
              <Text style={[theme.text.bodyMedium, styles.legendGrams]}>
                {formatGrams(nutrition.fiberG)}
              </Text>
              <Text style={[theme.text.caption, styles.legendPercent]} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

function formatGrams(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value)}g`;
}

export default NutritionPanel;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.layout.screenPadding,
    marginTop: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  serving: {
    color: theme.colors.text.tertiary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xl,
    backgroundColor: theme.colors.surface.raised,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    ...theme.elevation.sm,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPlaceholder: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: STROKE,
    borderColor: theme.colors.neutral[100],
  },
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calories: {
    color: theme.colors.text.primary,
  },
  caloriesLabel: {
    color: theme.colors.text.tertiary,
    marginTop: -2,
  },
  legend: {
    flex: 1,
    gap: theme.spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  fibreDot: {
    backgroundColor: theme.colors.neutral[300],
  },
  legendLabel: {
    flex: 1,
    color: theme.colors.text.secondary,
  },
  legendGrams: {
    color: theme.colors.text.primary,
  },
  legendPercent: {
    width: 34,
    textAlign: 'right',
    color: theme.colors.text.tertiary,
  },
});
