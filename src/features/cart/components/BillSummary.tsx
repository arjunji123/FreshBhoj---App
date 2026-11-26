import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Bike, Coins, Landmark, ReceiptText, ShoppingBag, TicketPercent } from 'lucide-react-native';
import { formatCurrency } from '@utils/format';
import { Text } from '@components/ui';
import type { PriceBreakdown } from '@api/types';
import { useTheme } from "@app/theme/useTheme";

interface BillSummaryProps {
  pricing: PriceBreakdown;
  couponCode?: string | null;
  title?: string;
}

type RowIcon = React.FC<{ size: number; color: string; strokeWidth: number }>;

/** The bill, shared by the cart and checkout screens. */
const BillSummary: React.FC<BillSummaryProps> = ({ pricing, couponCode, title = 'Bill details' }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const row = (label: string, value: string, Icon: RowIcon, saving = false) => (
    <View style={styles.row}>
      <Icon size={15} color={saving ? theme.colors.text.brand : theme.colors.text.tertiary} strokeWidth={2.2} />
      <Text
        style={[theme.text.bodySmall, styles.rowLabel, saving ? styles.saving : styles.label]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text style={[theme.text.label, saving ? styles.saving : styles.value]}>{value}</Text>
    </View>
  );

  const toFreeDelivery = pricing.freeDeliveryApplied ? 0 : pricing.amountToFreeDelivery;
  const freeProgress = pricing.itemsTotal / Math.max(1, pricing.itemsTotal + toFreeDelivery);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <ReceiptText size={15} color={theme.colors.text.brand} strokeWidth={2.2} />
        <Text style={theme.text.label}>{title}</Text>
      </View>

      <View style={styles.rows}>
        {row('Item total', formatCurrency(pricing.itemsTotal), ShoppingBag)}
        {row(
          'Delivery fee',
          pricing.freeDeliveryApplied ? 'Free' : formatCurrency(pricing.deliveryFee),
          Bike,
          pricing.freeDeliveryApplied,
        )}
        {row('Taxes & charges', formatCurrency(pricing.taxes), Landmark)}
        {pricing.couponDiscount > 0
          ? row(
              couponCode ? `Coupon ${couponCode}` : 'Discount',
              `− ${formatCurrency(pricing.couponDiscount)}`,
              TicketPercent,
              true,
            )
          : null}
        {pricing.coinDiscount > 0
          ? row('FreshBhoj Coins', `− ${formatCurrency(pricing.coinDiscount)}`, Coins, true)
          : null}
      </View>

      <View style={styles.totalRow}>
        <Text style={theme.text.label}>To pay</Text>
        <Text style={theme.text.h4}>{formatCurrency(pricing.totalAmount)}</Text>
      </View>

      {pricing.discount > 0 ? (
        <View style={styles.banner}>
          <Text style={[theme.text.label, styles.saving]}>
            You saved {formatCurrency(pricing.discount)} on this order
          </Text>
        </View>
      ) : null}

      {toFreeDelivery > 0 ? (
        <View style={styles.banner}>
          <Text style={[theme.text.caption, styles.bannerText]}>
            Add {formatCurrency(toFreeDelivery)} more for free delivery
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(freeProgress * 100)}%` }]} />
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default BillSummary;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.raised,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  rows: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: 4,
  },
  rowLabel: {
    flex: 1,
  },
  label: {
    color: theme.colors.text.secondary,
  },
  value: {
    color: theme.colors.text.primary,
  },
  saving: {
    color: theme.colors.text.brand,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.default,
  },
  banner: {
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface.brandWash,
  },
  bannerText: {
    color: theme.colors.text.brand,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surface.raised,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: theme.colors.primary[600],
  },
});
