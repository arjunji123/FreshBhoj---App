import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import { theme } from '@app/theme/index';

export type BadgeTone = 'accent' | 'brand' | 'neutral' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: React.ReactNode;
  /** Filled reads louder; use `soft` (default) for dietary tags in a list. */
  variant?: 'soft' | 'solid' | 'outline';
  style?: StyleProp<ViewStyle>;
}

const TONES: Record<BadgeTone, { soft: string; solid: string; text: string; border: string }> = {
  accent: {
    soft: theme.colors.accent[50],
    solid: theme.colors.accent[600],
    text: theme.colors.accent[700],
    border: theme.colors.accent[200],
  },
  brand: {
    soft: theme.colors.primary[50],
    solid: theme.colors.primary[600],
    text: theme.colors.primary[700],
    border: theme.colors.primary[200],
  },
  neutral: {
    soft: theme.colors.neutral[100],
    solid: theme.colors.neutral[700],
    text: theme.colors.neutral[600],
    border: theme.colors.neutral[200],
  },
  warning: {
    soft: theme.colors.amber[50],
    solid: theme.colors.amber[500],
    text: theme.colors.amber[700],
    border: theme.colors.amber[100],
  },
  danger: {
    soft: theme.colors.state.errorBg,
    solid: theme.colors.state.error,
    text: theme.colors.state.error,
    border: theme.colors.primary[200],
  },
  info: {
    soft: theme.colors.state.infoBg,
    solid: theme.colors.state.info,
    text: theme.colors.state.info,
    border: theme.colors.neutral[200],
  },
};

/** Dietary tags, nutrition chips, order-status pills — all the same primitive. */
const Badge: React.FC<BadgeProps> = ({
  label,
  tone = 'accent',
  size = 'sm',
  icon,
  variant = 'soft',
  style,
}) => {
  const palette = TONES[tone];
  const isSolid = variant === 'solid';

  return (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        {
          backgroundColor: isSolid
            ? palette.solid
            : variant === 'outline'
            ? 'transparent'
            : palette.soft,
        },
        variant === 'outline' ? { borderWidth: 1, borderColor: palette.border } : null,
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        style={[
          size === 'sm' ? theme.text.caption : theme.text.label,
          { color: isSolid ? theme.colors.text.inverse : palette.text },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

/**
 * The curated-kitchen trust signal. It appears on kitchen cards, kitchen
 * profiles and reels, so it lives here rather than being redrawn per screen.
 */
export const VerifiedBadge: React.FC<{ size?: number; showLabel?: boolean }> = ({
  size = 14,
  showLabel = true,
}) =>
  showLabel ? (
    <Badge
      label="Verified"
      tone="accent"
      icon={<BadgeCheck size={size} color={theme.colors.accent[600]} strokeWidth={2.5} />}
    />
  ) : (
    <View style={styles.verifiedDot}>
      <BadgeCheck size={size} color={theme.colors.neutral[0]} fill={theme.colors.accent[600]} strokeWidth={2} />
    </View>
  );

export default Badge;

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
  },
  sm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  md: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    gap: 6,
  },
  icon: {
    justifyContent: 'center',
  },
  verifiedDot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
