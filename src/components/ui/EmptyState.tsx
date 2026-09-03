import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '@app/theme/index';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
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
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
}) => (
  <View style={[styles.container, style]}>
    {icon ? <View style={styles.iconCircle}>{icon}</View> : null}

    <Text style={[theme.text.h2, styles.title]} numberOfLines={2}>
      {title}
    </Text>

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
);

export default EmptyState;

const styles = StyleSheet.create({
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
