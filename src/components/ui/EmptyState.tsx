import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Button from './Button';
import { enterRise, enterPop } from '@animations/motion';
import { useTheme } from "@app/theme/useTheme";

interface EmptyStateProps {
  icon?: React.ReactNode;
  /** Full illustration (e.g. <EmptyCart />). Replaces the icon circle when given. */
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Warm, on-brand empty/blocked state. Every "nothing here" moment in the app
 * routes through this so none of them read as a dead-end error page.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  illustration,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
}) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
      return (
    (
      <View style={[styles.container, style]}>
        {illustration ? (
          <Animated.View entering={enterPop(0)} style={styles.illustration}>
            {illustration}
          </Animated.View>
        ) : icon ? (
          <Animated.View entering={enterPop(0)} style={styles.iconCircle}>
            {icon}
          </Animated.View>
        ) : null}

        <Animated.Text entering={enterRise(1)} style={[theme.text.h2, styles.title]} numberOfLines={2}>
          {title}
        </Animated.Text>

        {description ? (
          <Text style={[theme.text.body, styles.description]}>{description}</Text>
        ) : null}

        {actionLabel && onAction ? (
          <Button title={actionLabel} onPress={onAction} fullWidth={false} style={styles.action} />
        ) : null}

        {secondaryActionLabel && onSecondaryAction ? (
          <Button
            title={secondaryActionLabel}
            onPress={onSecondaryAction}
            variant="ghost"
            size="md"
            fullWidth={false}
          />
        ) : null}
      </View>
    )
      );
    };

export default EmptyState;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
  description: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    maxWidth: 300,
  },
  action: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xxl,
  },
});
