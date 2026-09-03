import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Bike, Check, ChefHat, PartyPopper, Receipt } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatTime } from '@utils/format';
import type { OrderStatus, TrackingStep } from '@api/types';

interface OrderStatusStepperProps {
  steps: TrackingStep[];
  isCancelled?: boolean;
}

const STEP_ICONS: Partial<
  Record<OrderStatus, React.FC<{ size: number; color: string; strokeWidth: number }>>
> = {
  PLACED: Receipt,
  ACCEPTED: Check,
  PREPARING: ChefHat,
  OUT_FOR_DELIVERY: Bike,
  DELIVERED: PartyPopper,
};

/**
 * Vertical status stepper. Completed stages use the accent green, the current
 * one is brand red and pulsing-loud, and everything ahead stays grey — so the
 * order's position reads at a glance without any text.
 */
const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({ steps, isCancelled }) => (
  <View style={styles.container}>
    {steps.map((step, index) => {
      const Icon = STEP_ICONS[step.status] ?? Check;
      const isLast = index === steps.length - 1;

      const circleStyle = step.isDone
        ? styles.circleDone
        : step.isCurrent
        ? styles.circleCurrent
        : styles.circleIdle;

      const iconColor = step.isDone
        ? theme.colors.text.inverse
        : step.isCurrent
        ? theme.colors.text.inverse
        : theme.colors.text.tertiary;

      return (
        <View key={step.status} style={styles.step}>
          <View style={styles.rail}>
            <View style={[styles.circle, circleStyle]}>
              {step.isDone ? (
                <Check size={15} color={iconColor} strokeWidth={3.2} />
              ) : (
                <Icon size={15} color={iconColor} strokeWidth={2.4} />
              )}
            </View>
            {!isLast ? (
              <View style={[styles.connector, step.isDone ? styles.connectorDone : null]} />
            ) : null}
          </View>

          <View style={styles.content}>
            <Text
              style={[
                theme.text.h4,
                step.isCurrent ? styles.labelCurrent : null,
                !step.isDone && !step.isCurrent ? styles.labelIdle : null,
                isCancelled ? styles.labelIdle : null,
              ]}
            >
              {step.label}
            </Text>
            <Text style={[theme.text.bodySmall, styles.description]}>
              {step.at ? `${formatTime(step.at)} · ` : ''}
              {step.description}
            </Text>
          </View>
        </View>
      );
    })}
  </View>
);

export default OrderStatusStepper;

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.xs,
  },
  step: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  rail: {
    alignItems: 'center',
    width: 30,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    backgroundColor: theme.colors.accent[600],
  },
  circleCurrent: {
    backgroundColor: theme.colors.primary[600],
  },
  circleIdle: {
    backgroundColor: theme.colors.neutral[100],
  },
  connector: {
    flex: 1,
    width: 2,
    minHeight: 26,
    marginVertical: 3,
    backgroundColor: theme.colors.neutral[200],
  },
  connectorDone: {
    backgroundColor: theme.colors.accent[400],
  },
  content: {
    flex: 1,
    paddingBottom: theme.spacing.xl,
  },
  labelCurrent: {
    color: theme.colors.primary[600],
  },
  labelIdle: {
    color: theme.colors.text.tertiary,
  },
  description: {
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
});
