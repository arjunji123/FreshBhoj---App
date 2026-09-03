import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RotateCcw, Star } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency, formatDateTime } from '@utils/format';
import { Badge, Button, Card, Divider, type BadgeTone } from '@components/ui';
import type { OrderCard, OrderStatus } from '@api/types';

interface OrderHistoryCardProps {
  order: OrderCard;
  onPress: () => void;
  onReorder?: () => void;
  onRate?: () => void;
  isReordering?: boolean;
}

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  PENDING_PAYMENT: 'warning',
  PLACED: 'info',
  ACCEPTED: 'info',
  PREPARING: 'brand',
  OUT_FOR_DELIVERY: 'brand',
  DELIVERED: 'accent',
  CANCELLED: 'danger',
};

/** Scannable past-order row: what, from whom, when, how much, and what next. */
const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({
  order,
  onPress,
  onReorder,
  onRate,
  isReordering,
}) => (
  <Card padding="md" elevation="sm" onPress={onPress} style={styles.card}>
    <View style={styles.header}>
      <View style={styles.thumbnails}>
        {order.thumbnails.length ? (
          order.thumbnails.slice(0, 2).map((uri, index) => (
            <Image
              key={`${uri}-${index}`}
              source={{ uri }}
              style={[styles.thumbnail, index > 0 ? styles.thumbnailStacked : null]}
              resizeMode="cover"
            />
          ))
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailFallback]} />
        )}
      </View>

      <View style={styles.headerText}>
        <Text style={theme.text.h4} numberOfLines={1}>
          {order.kitchen.name}
        </Text>
        <Text style={[theme.text.caption, styles.meta]} numberOfLines={1}>
          {formatDateTime(order.placedAt)}
        </Text>
        <Text style={[theme.text.bodySmall, styles.items]} numberOfLines={2}>
          {order.itemSummary}
        </Text>
      </View>

      <View style={styles.headerRight}>
        <Badge label={order.statusLabel} tone={STATUS_TONE[order.status]} />
        <Text style={[theme.text.numeric, styles.amount]}>
          {formatCurrency(order.totalAmount)}
        </Text>
      </View>
    </View>

    {onReorder || (order.status === 'DELIVERED' && !order.isRated && onRate) ? (
      <>
        <Divider spacing={theme.spacing.md} />
        <View style={styles.actions}>
          {order.status === 'DELIVERED' && !order.isRated && onRate ? (
            <Button
              title="Rate order"
              variant="outline"
              size="sm"
              onPress={onRate}
              leftIcon={<Star size={14} color={theme.colors.amber[500]} strokeWidth={2.4} />}
              fullWidth={false}
              style={styles.action}
            />
          ) : null}

          {order.canReorder && onReorder ? (
            <Button
              title="Reorder"
              size="sm"
              onPress={onReorder}
              loading={isReordering}
              leftIcon={
                <RotateCcw size={14} color={theme.colors.text.inverse} strokeWidth={2.6} />
              }
              fullWidth={false}
              style={styles.action}
            />
          ) : null}
        </View>
      </>
    ) : null}
  </Card>
);

export default OrderHistoryCard;

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  thumbnails: {
    flexDirection: 'row',
    width: 56,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutral[100],
  },
  thumbnailStacked: {
    marginLeft: -22,
    borderWidth: 2,
    borderColor: theme.colors.surface.base,
  },
  thumbnailFallback: {
    backgroundColor: theme.colors.primary[50],
  },
  headerText: {
    flex: 1,
  },
  meta: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  items: {
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  amount: {
    color: theme.colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  action: {
    paddingHorizontal: theme.spacing.lg,
  },
});
