import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Coins, X } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import { Button, Card } from '@components/ui';
import type { Cart } from '@api/types';

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
  const { coins } = cart;
  const isApplied = coins.applied > 0;
  const isEligible = cart.pricing.itemsTotal >= coins.minOrderValue;
  const amountNeeded = Math.max(coins.minOrderValue - cart.pricing.itemsTotal, 0);

  const ruleText = `Use coins on orders above ${formatCurrency(coins.minOrderValue)} · up to ${coins.maxPerOrder} coins per order`;

  if (isApplied) {
    return (
      <Card padding="md" elevation="xs" style={styles.appliedCard}>
        <View style={styles.appliedRow}>
          <View style={styles.appliedIcon}>
            <Coins size={16} color={theme.colors.accent[600]} strokeWidth={2.4} />
          </View>
          <View style={styles.appliedText}>
            <Text style={[theme.text.h4, styles.appliedTitle]}>
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
            accessibilityLabel="Remove coins"
          >
            <X size={18} color={theme.colors.text.tertiary} strokeWidth={2.4} />
          </Pressable>
        </View>
      </Card>
    );
  }

  return (
    <Card padding="lg" elevation="xs" style={styles.card}>
      <View style={styles.row}>
        <View style={styles.headerIcon}>
          <Coins size={16} color={theme.colors.primary[600]} strokeWidth={2.4} />
        </View>
        <View style={styles.headerText}>
          <Text style={theme.text.h4}>FreshBhoj Coins</Text>
          <Text style={[theme.text.caption, styles.balance]}>
            You have {coins.balance} coins
          </Text>
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

      <Text style={[theme.text.caption, styles.rule]}>
        {!isEligible
          ? `Add ${formatCurrency(amountNeeded)} more to use your coins`
          : coins.maxRedeemable <= 0
          ? "You don't have any coins yet — refer a friend to earn some"
          : ruleText}
      </Text>
    </Card>
  );
};

export default CoinsPanel;

const styles = StyleSheet.create({
  card: {
    marginTop: theme.spacing.md,
  },
  appliedCard: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.accent[50],
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  appliedIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedText: {
    flex: 1,
  },
  appliedTitle: {
    color: theme.colors.accent[700],
  },
  appliedSaving: {
    color: theme.colors.accent[600],
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary[50],
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
  rule: {
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.md,
  },
});
