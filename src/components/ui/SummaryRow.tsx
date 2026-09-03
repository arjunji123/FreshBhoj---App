import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';

interface SummaryRowProps {
  label: string;
  value: number | string;
  /** `discount` renders green with a leading minus; `total` is bold and larger. */
  tone?: 'default' | 'muted' | 'discount' | 'free' | 'total';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** One line of an order/price summary. Keeps every bill in the app identical. */
const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, tone = 'default', icon, style }) => {
  const isTotal = tone === 'total';

  const displayValue =
    typeof value === 'string'
      ? value
      : tone === 'discount'
      ? `− ${formatCurrency(Math.abs(value))}`
      : formatCurrency(value);

  return (
    <View style={[styles.row, style]}>
      <View style={styles.labelWrap}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text
          style={[
            isTotal ? theme.text.h4 : theme.text.body,
            { color: tone === 'muted' ? theme.colors.text.secondary : theme.colors.text.primary },
          ]}
        >
          {label}
        </Text>
      </View>

      <Text
        style={[
          isTotal ? theme.text.numeric : theme.text.bodyMedium,
          { color: VALUE_COLOR[tone] },
        ]}
      >
        {displayValue}
      </Text>
    </View>
  );
};

const VALUE_COLOR: Record<NonNullable<SummaryRowProps['tone']>, string> = {
  default: theme.colors.text.primary,
  muted: theme.colors.text.secondary,
  discount: theme.colors.accent[600],
  free: theme.colors.accent[600],
  total: theme.colors.text.primary,
};

export default SummaryRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  icon: {
    justifyContent: 'center',
  },
});
