import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCompact } from '@utils/format';

interface RatingPillProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  /** `solid` is the green chip on a photo; `plain` is inline text. */
  variant?: 'solid' | 'plain';
  style?: StyleProp<ViewStyle>;
}

/** Compact "★ 4.8" chip used on meal and kitchen cards. */
export const RatingPill: React.FC<RatingPillProps> = ({
  value,
  count,
  size = 'sm',
  variant = 'plain',
  style,
}) => {
  const isSolid = variant === 'solid';
  const iconSize = size === 'sm' ? 12 : 14;
  const textStyle = size === 'sm' ? theme.text.caption : theme.text.label;

  return (
    <View style={[styles.pill, isSolid ? styles.solid : styles.plain, style]}>
      <Star
        size={iconSize}
        color={isSolid ? theme.colors.text.inverse : theme.colors.accent[600]}
        fill={isSolid ? theme.colors.text.inverse : theme.colors.accent[600]}
        strokeWidth={0}
      />
      <Text
        style={[
          textStyle,
          { color: isSolid ? theme.colors.text.inverse : theme.colors.text.primary },
        ]}
      >
        {value.toFixed(1)}
      </Text>
      {typeof count === 'number' && count > 0 ? (
        <Text
          style={[
            theme.text.caption,
            { color: isSolid ? theme.colors.text.inverse : theme.colors.text.tertiary },
          ]}
        >
          ({formatCompact(count)})
        </Text>
      ) : null}
    </View>
  );
};

interface StarRowProps {
  value: number;
  size?: number;
  onChange?: (next: number) => void;
  style?: StyleProp<ViewStyle>;
}

/** Five stars. Interactive when `onChange` is supplied (the feedback screen). */
export const StarRow: React.FC<StarRowProps> = ({ value, size = 20, onChange, style }) => (
  <View style={[styles.starRow, style]}>
    {[1, 2, 3, 4, 5].map((star) => {
      const filled = star <= Math.round(value);
      return (
        <Star
          key={star}
          size={size}
          color={filled ? theme.colors.primary[600] : theme.colors.neutral[300]}
          fill={filled ? theme.colors.primary[600] : 'transparent'}
          strokeWidth={1.8}
          onPress={onChange ? () => onChange(star) : undefined}
        />
      );
    })}
  </View>
);

export default RatingPill;

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
  },
  solid: {
    backgroundColor: theme.colors.accent[600],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  plain: {},
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
