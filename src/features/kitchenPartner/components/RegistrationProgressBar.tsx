import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';
import type { OnboardingStepState } from '../kitchenPartner.types';

interface RegistrationProgressBarProps {
  steps: OnboardingStepState[];
  progressPercent: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Sits atop every `KitchenRegister*` screen — a gradient fill bar plus a dot
 * per step, driven directly off the `/partner/onboarding/status` response
 * (`steps`, `progressPercent`) so it never needs its own idea of what step
 * comes next; the backend is the single source of truth for that.
 */
const RegistrationProgressBar: React.FC<RegistrationProgressBarProps> = ({ steps, progressPercent, style }) => {
  const current = steps.find((s) => s.isCurrent) ?? steps.find((s) => !s.isComplete);
  const clamped = Math.min(100, Math.max(0, progressPercent));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.stepLabel} numberOfLines={1}>
          {current?.label ?? 'Getting started'}
        </Text>
        <Text style={styles.percent}>{clamped}%</Text>
      </View>

      <View style={styles.track}>
        <AppGradient
          colors={theme.colors.gradients.brand}
          locations={theme.colors.gradients.brandLocations}
          direction="horizontal"
          style={[styles.fill, { width: `${clamped}%` }]}
        />
      </View>

      {current?.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {current.description}
        </Text>
      ) : null}

      <View style={styles.dotsRow}>
        {steps.map((step) => (
          <View
            key={step.step}
            style={[
              styles.dot,
              step.isComplete ? styles.dotComplete : step.isCurrent ? styles.dotCurrent : styles.dotUpcoming,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default RegistrationProgressBar;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.paddings.sm,
    paddingBottom: theme.spacing.paddings.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.paddings.xs,
  },
  stepLabel: { ...theme.text.h4, color: theme.colors.text.primary, flex: 1, marginRight: theme.spacing.paddings.sm },
  percent: { ...theme.text.label, color: theme.colors.brand.primary },
  track: {
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.neutral[100],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.pill,
  },
  description: {
    ...theme.text.bodySmall,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.paddings.xs,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: theme.spacing.paddings.sm,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: theme.radius.pill,
  },
  dotComplete: { backgroundColor: theme.colors.brand.primary },
  dotCurrent: { backgroundColor: theme.colors.primary[300] },
  dotUpcoming: { backgroundColor: theme.colors.neutral[200] },
});
