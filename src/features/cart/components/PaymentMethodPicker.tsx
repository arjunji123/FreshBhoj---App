import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@components/ui';
import { Banknote, CheckCircle2, CreditCard, Smartphone, Wallet } from 'lucide-react-native';
import { formatCurrency } from '@utils/format';
import type { PaymentMethod } from '@api/types';
import { useWalletSummary } from '@features/wallet/hooks/useWallet';
import { useTheme } from "@app/theme/useTheme";

interface PaymentMethodPickerProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const METHODS: Array<{
  key: PaymentMethod;
  label: string;
  hint: string;
  Icon: React.FC<{ size: number; color: string; strokeWidth: number }>;
}> = [
  { key: 'UPI', label: 'UPI', hint: 'GPay / PhonePe / Paytm', Icon: Smartphone },
  { key: 'CARD', label: 'Cards', hint: 'Credit or debit card', Icon: CreditCard },
  { key: 'WALLET', label: 'Wallet', hint: 'FreshBhoj balance', Icon: Wallet },
  { key: 'COD', label: 'Cash on Delivery', hint: 'Pay when it arrives', Icon: Banknote },
];

/**
 * Icon-led selection cards rather than a bare radio list — payment is the step
 * where a cramped, utilitarian UI costs the most conversions.
 */
const PaymentMethodPicker: React.FC<PaymentMethodPickerProps> = ({ value, onChange }) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  // Same "balance: ₹450" idiom `SetupPlanReview.tsx` uses next to its own
  // WALLET option — this picker previously showed a static "FreshBhoj
  // balance" placeholder here instead of the real number.
  const walletSummary = useWalletSummary();
  const walletHint = walletSummary.data
    ? `${formatCurrency(walletSummary.data.balanceRs)} available`
    : 'FreshBhoj balance';

  return (
    <View style={styles.container}>
      {METHODS.map(({ key, label, hint, Icon }, index) => {
        const isSelected = value === key;
        const displayHint = key === 'WALLET' ? walletHint : hint;

        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            style={({ pressed }) => [
              styles.row,
              index > 0 ? styles.rowDivider : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={[styles.iconWrap, isSelected ? styles.iconWrapSelected : null]}>
              <Icon
                size={16}
                color={isSelected ? theme.colors.primary[600] : theme.colors.text.secondary}
                strokeWidth={2.2}
              />
            </View>

            <View style={styles.text}>
              <Text style={theme.text.label}>{label}</Text>
              <Text style={[theme.text.caption, styles.hint]}>{displayHint}</Text>
            </View>

            {isSelected ? (
              <CheckCircle2
                size={19}
                color={theme.colors.text.brand}
                strokeWidth={2.4}
              />
            ) : (
              <View style={styles.radio} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

export default PaymentMethodPicker;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    marginTop: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  pressed: {
    opacity: 0.8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.page,
  },
  iconWrapSelected: {
    backgroundColor: theme.colors.surface.brandWash,
  },
  text: {
    flex: 1,
  },
  hint: {
    color: theme.colors.text.tertiary,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.default,
  },
});
