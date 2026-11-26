import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Coins } from 'lucide-react-native';
import { formatCurrency } from '@utils/format';
import { Button, Text } from '@components/ui';
import type { Cart } from '@api/types';
import { useTheme } from "@app/theme/useTheme";

interface CoinsPanelProps {
  cart: Cart;
  onApply: () => void;
  onRemove: () => void;
  isApplying?: boolean;
  isRemoving?: boolean;
}

/**
 * A toggle, not a slider — redeeming always claims the most the cart currently
 * qualifies for (see `PRICING.MAX_REDEEMABLE_COINS` on the backend). The rule
 * line stays visible in every state so it never feels like a hidden condition.
 */
const CoinsPanel: React.FC<CoinsPanelProps> = ({ cart, onApply, onRemove, isApplying, isRemoving }) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const { coins } = cart;
  const isApplied = coins.applied > 0;
  const isEligible = cart.pricing.itemsTotal >= coins.minOrderValue;
  const amountNeeded = Math.max(coins.minOrderValue - cart.pricing.itemsTotal, 0);

  const ruleText = `Use coins on orders above ${formatCurrency(coins.minOrderValue)} · up to ${coins.maxPerOrder} coins per order`;

  if (isApplied) {
    return (
      <View style={styles.appliedRow}>
        <View style={styles.appliedIcon}>
          <Coins size={17} color={theme.colors.palette.white} strokeWidth={2.4} />
        </View>
        <View style={styles.appliedText}>
          <Text style={theme.text.label} numberOfLines={1}>
            {coins.applied} FreshBhoj Coins applied
          </Text>
          <Text style={[theme.text.caption, styles.appliedSaving]}>
            You saved {formatCurrency(coins.discount)}
          </Text>
        </View>
        <Pressable
          onPress={onRemove}
          disabled={isRemoving}
          hitSlop={theme.layout.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Remove coins"
        >
          <Text style={[theme.text.label, styles.removeText]}>Remove</Text>
        </Pressable>
      </View>
    );
  }

  const note = !isEligible
    ? `Add ${formatCurrency(amountNeeded)} more to use your coins`
    : coins.maxRedeemable <= 0
    ? 'Refer a friend to earn coins'
    : ruleText;

  return (
    <View style={styles.row}>
      <View style={styles.headerIcon}>
        <Coins size={16} color={theme.colors.text.brand} strokeWidth={2.4} />
      </View>
      <View style={styles.headerText}>
        <Text style={theme.text.label}>FreshBhoj Coins ({coins.balance})</Text>
        <Text style={[theme.text.caption, styles.balance]}>{note}</Text>
      </View>
      {isEligible && coins.maxRedeemable > 0 ? (
        <Button
          title={`Apply ${coins.maxRedeemable}`}
          size="sm"
          variant="secondary"
          onPress={onApply}
          loading={isApplying}
          fullWidth={false}
        />
      ) : null}
    </View>
  );
};

export default CoinsPanel;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  appliedIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedText: {
    flex: 1,
  },
  appliedSaving: {
    color: theme.colors.text.brand,
    marginTop: 2,
  },
  removeText: {
    color: theme.colors.state.error,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.brand.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  balance: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
});
