import React from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { MapPin, MessageSquare, RotateCcw } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency, formatDateTime } from '@utils/format';
import { ApiError } from '@api';
import {
  AppBar,
  Badge,
  Button,
  Card,
  Divider,
  Skeleton,
  SummaryRow,
} from '@components/ui';
import { StarRow } from '@components/ui/Rating';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import OrderStatusStepper from '../components/OrderStatusStepper';
import { useOrder, useReorder } from '../hooks/useOrders';

type Route = RouteProp<PrivateStackParamList, 'OrderDetail'>;

/**
 * Completed-order view. Same visual language as tracking, but the stepper is
 * fully resolved and the primary actions become rate + reorder.
 */
const OrderDetail = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();

  const { data: order, isLoading } = useOrder(params.orderId);
  const reorder = useReorder();

  if (isLoading || !order) {
    return (
      <View style={styles.screen}>
        <AppBar title="Order details" onBack={navigation.goBack} />
        <View style={styles.loading}>
          <Skeleton height={110} radius={theme.radius.card} />
          <Skeleton height={220} radius={theme.radius.card} />
        </View>
      </View>
    );
  }

  const address = order.address as Record<string, any>;
  const isDelivered = order.status === 'DELIVERED';

  const handleReorder = () =>
    reorder.mutate(order.id, {
      onSuccess: (result) =>
        Alert.alert(
          'Added to cart',
          `${result.addedCount} ${result.addedCount === 1 ? 'item' : 'items'} back in your cart.`,
          [
            { text: 'Later', style: 'cancel' },
            { text: 'View cart', onPress: () => navigation.navigate('Cart') },
          ],
        ),
      onError: (error) =>
        Alert.alert(
          'Could not reorder',
          error instanceof ApiError ? error.message : 'Please try again.',
        ),
    });

  return (
    <View style={styles.screen}>
      <AppBar
        title={`Order #${order.orderNumber}`}
        subtitle={formatDateTime(order.placedAt)}
        onBack={navigation.goBack}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {isDelivered && !order.isRated ? (
          <Card padding="lg" elevation="sm" style={styles.ratePrompt}>
            <Text style={theme.text.h3}>How was your food?</Text>
            <Text style={[theme.text.bodySmall, styles.ratePromptBody]}>
              Your feedback helps {order.kitchen.name} improve
            </Text>
            <StarRow value={0} size={30} style={styles.rateStars} />
            <Button
              title="Share Feedback"
              onPress={() =>
                navigation.navigate('WriteReview', {
                  orderId: order.id,
                  kitchenId: order.kitchen.id,
                  kitchenName: order.kitchen.name,
                  mealId: order.items[0]?.mealId ?? undefined,
                  mealName: order.items[0]?.name,
                  mealImage: order.items[0]?.image,
                })
              }
              style={styles.rateButton}
            />
          </Card>
        ) : null}

        <View style={styles.statusRow}>
          <Badge
            label={order.statusLabel}
            tone={order.status === 'CANCELLED' ? 'danger' : 'accent'}
            size="md"
          />
          {order.deliveredAt ? (
            <Text style={[theme.text.caption, styles.deliveredAt]}>
              Delivered at {formatDateTime(order.deliveredAt)}
            </Text>
          ) : null}
        </View>

        <Card padding="lg" elevation="xs" style={styles.card}>
          <OrderStatusStepper
            steps={order.tracking.steps}
            isCancelled={order.tracking.isCancelled}
          />
        </Card>

        <Text style={[theme.text.overline, styles.sectionLabel]}>ITEMS</Text>
        <Card padding="md" elevation="xs">
          {order.items.map((item, index) => (
            <View key={item.id}>
              {index > 0 ? <Divider spacing={theme.spacing.sm} /> : null}
              <View style={styles.itemRow}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, styles.itemImageFallback]} />
                )}
                <View style={styles.itemText}>
                  <Text style={theme.text.h4} numberOfLines={2}>
                    {item.quantity}× {item.name}
                  </Text>
                  {item.customizations?.length ? (
                    <Text style={[theme.text.caption, styles.itemMeta]} numberOfLines={2}>
                      {item.customizations.map((option) => option.name).join(' · ')}
                    </Text>
                  ) : null}
                  {item.specialInstructions ? (
                    <Text style={[theme.text.caption, styles.itemMeta]} numberOfLines={2}>
                      Note: {item.specialInstructions}
                    </Text>
                  ) : null}
                </View>
                <Text style={theme.text.bodyMedium}>{formatCurrency(item.lineTotal)}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Text style={[theme.text.overline, styles.sectionLabel]}>BILL</Text>
        <Card padding="md" elevation="xs">
          <SummaryRow label="Item total" value={order.pricing.itemsTotal} />
          <SummaryRow
            label="Delivery fee"
            value={order.pricing.deliveryFee === 0 ? 'FREE' : order.pricing.deliveryFee}
            tone={order.pricing.deliveryFee === 0 ? 'free' : 'default'}
          />
          <SummaryRow label="Taxes & charges" value={order.pricing.taxes} tone="muted" />
          {order.pricing.discount > 0 ? (
            <SummaryRow
              label={order.pricing.couponCode ?? 'Discount'}
              value={order.pricing.discount}
              tone="discount"
            />
          ) : null}
          <Divider dashed spacing={theme.spacing.sm} />
          <SummaryRow label="Total paid" value={order.pricing.totalAmount} tone="total" />
          <Text style={[theme.text.caption, styles.paymentMeta]}>
            Paid via {order.paymentMethod} · {order.paymentStatus.toLowerCase()}
          </Text>
        </Card>

        <Text style={[theme.text.overline, styles.sectionLabel]}>DELIVERED TO</Text>
        <Card padding="md" elevation="xs">
          <View style={styles.addressRow}>
            <MapPin size={16} color={theme.colors.primary[600]} strokeWidth={2.4} />
            <Text style={[theme.text.body, styles.addressText]}>
              {[address?.line1, address?.line2, address?.locality, address?.city, address?.pincode]
                .filter(Boolean)
                .join(', ')}
            </Text>
          </View>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Report an issue"
            variant="outline"
            onPress={() =>
              Linking.openURL(
                `https://wa.me/${order.support.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hi FreshBhoj, I need help with order ${order.orderNumber}`,
                )}`,
              ).catch(() => Alert.alert('Could not open WhatsApp'))
            }
            leftIcon={
              <MessageSquare size={16} color={theme.colors.text.primary} strokeWidth={2.2} />
            }
            fullWidth={false}
            style={styles.actionButton}
          />

          {order.canReorder ? (
            <Button
              title="Reorder"
              onPress={handleReorder}
              loading={reorder.isPending}
              leftIcon={
                <RotateCcw size={16} color={theme.colors.text.inverse} strokeWidth={2.4} />
              }
              fullWidth={false}
              style={styles.actionButton}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderDetail;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  loading: {
    padding: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  scroll: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxl,
  },
  ratePrompt: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.primary[50],
  },
  ratePromptBody: {
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  rateStars: {
    marginTop: theme.spacing.md,
  },
  rateButton: {
    marginTop: theme.spacing.lg,
    alignSelf: 'stretch',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  deliveredAt: {
    color: theme.colors.text.tertiary,
    flex: 1,
  },
  card: {
    marginTop: theme.spacing.md,
  },
  sectionLabel: {
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  itemImage: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutral[100],
  },
  itemImageFallback: {
    backgroundColor: theme.colors.primary[50],
  },
  itemText: {
    flex: 1,
  },
  itemMeta: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  paymentMeta: {
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
    textTransform: 'capitalize',
  },
  addressRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  addressText: {
    flex: 1,
    color: theme.colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
});
