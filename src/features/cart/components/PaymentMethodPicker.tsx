import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Banknote, CheckCircle2, CreditCard, Smartphone, Wallet } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import type { PaymentMethod } from '@api/types';
import { useWalletSummary } from '@features/wallet/hooks/useWallet';

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
  // Same "balance: ₹450" idiom `SetupPlanReview.tsx` uses next to its own
  // WALLET option — this picker previously showed a static "FreshBhoj
  // balance" placeholder here instead of the real number.
  const walletSummary = useWalletSummary();
  const walletHint = walletSummary.data
    ? `${formatCurrency(walletSummary.data.balanceRs)} available`
    : 'FreshBhoj balance';

  return (
    <View style={styles.container}>
      {METHODS.map(({ key, label, hint, Icon }) => {
        const isSelected = value === key;
        const displayHint = key === 'WALLET' ? walletHint : hint;

        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            style={({ pressed }) => [
              styles.card,
              isSelected ? styles.cardSelected : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={[styles.iconWrap, isSelected ? styles.iconWrapSelected : null]}>
              <Icon
                size={19}
                color={isSelected ? theme.colors.primary[600] : theme.colors.text.secondary}
                strokeWidth={2.2}
              />
            </View>

            <View style={styles.text}>
              <Text style={theme.text.h4}>{label}</Text>
              <Text style={[theme.text.caption, styles.hint]}>{displayHint}</Text>
            </View>

            {isSelected ? (
              <CheckCircle2
                size={20}
                color={theme.colors.primary[600]}
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

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.card,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.surface.raised,
  },
  cardSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.surface.brandWash,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral[100],
  },
  iconWrapSelected: {
    backgroundColor: theme.colors.surface.base,
  },
  text: {
    flex: 1,
  },
  hint: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.borders.default,
  },
});
