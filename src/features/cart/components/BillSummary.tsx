import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Info, Sparkles } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import { Card, Divider, SummaryRow } from '@components/ui';
import type { PriceBreakdown } from '@api/types';

interface BillSummaryProps {
  pricing: PriceBreakdown;
  couponCode?: string | null;
  title?: string;
}

/** The bill. Identical on the cart, checkout and order-detail screens. */
const BillSummary: React.FC<BillSummaryProps> = ({
  pricing,
  couponCode,
  title = 'Bill details',
}) => (
  <View style={styles.container}>
    <Text style={[theme.text.h3, styles.title]}>{title}</Text>

    <Card padding="md" elevation="xs">
      <SummaryRow label="Item total" value={pricing.itemsTotal} />

      <SummaryRow
        label="Delivery fee"
        value={pricing.freeDeliveryApplied ? 'FREE' : pricing.deliveryFee}
        tone={pricing.freeDeliveryApplied ? 'free' : 'default'}
        icon={<Info size={13} color={theme.colors.text.tertiary} strokeWidth={2.2} />}
      />

      <SummaryRow label="Taxes & charges" value={pricing.taxes} tone="muted" />

      {pricing.discount > 0 ? (
        <SummaryRow
          label={couponCode ? `Coupon ${couponCode}` : 'Discount'}
          value={pricing.discount}
          tone="discount"
          icon={<Sparkles size={13} color={theme.colors.accent[600]} strokeWidth={2.2} />}
        />
      ) : null}

      <Divider dashed spacing={theme.spacing.sm} />

      <SummaryRow label="Total amount" value={pricing.totalAmount} tone="total" />

      {pricing.discount > 0 ? (
        <View style={styles.savingsBanner}>
          <Text style={[theme.text.caption, styles.savingsText]}>
            You saved {formatCurrency(pricing.discount)} on this order
          </Text>
        </View>
      ) : null}
    </Card>

    {!pricing.freeDeliveryApplied && pricing.amountToFreeDelivery > 0 ? (
      <View style={styles.freeDeliveryHint}>
        <Text style={[theme.text.caption, styles.freeDeliveryText]}>
          Add {formatCurrency(pricing.amountToFreeDelivery)} more for free delivery
        </Text>
      </View>
    ) : null}
  </View>
);

export default BillSummary;

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  savingsBanner: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent[50],
    alignItems: 'center',
  },
  savingsText: {
    color: theme.colors.accent[700],
  },
  freeDeliveryHint: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.amber[50],
    alignItems: 'center',
  },
  freeDeliveryText: {
    color: theme.colors.amber[700],
  },
});
