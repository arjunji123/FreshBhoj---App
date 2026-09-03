import React from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Share2,
  ShieldCheck,
  XCircle,
} from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { ApiError } from '@api';
import {
  AppBar,
  AppBarAction,
  Button,
  Card,
  Divider,
  Skeleton,
  SummaryRow,
} from '@components/ui';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import OrderStatusStepper from '../components/OrderStatusStepper';
import { useCancelOrder, useOrder, useOrderTracking } from '../hooks/useOrders';

type Route = RouteProp<PrivateStackParamList, 'OrderTracking'>;

/**
 * Live tracking. The stepper comes from `/orders/:id/tracking`, which polls on
 * its own and stops once the order is delivered or cancelled; the fuller order
 * detail is a separate cached query so the two don't refetch in lockstep.
 */
const OrderTracking = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();

  const { data: tracking, isLoading } = useOrderTracking(params.orderId);
  const { data: order } = useOrder(params.orderId);
  const cancelOrder = useCancelOrder();

  const openWhatsApp = () => {
    const number = tracking?.support?.whatsapp?.replace(/\D/g, '');
    if (!number) return;
    Linking.openURL(
      `https://wa.me/${number}?text=${encodeURIComponent(
        `Hi FreshBhoj, I need help with order ${tracking?.orderNumber ?? ''}`,
      )}`,
    ).catch(() => Alert.alert('Could not open WhatsApp'));
  };

  const callKitchen = () => {
    const phone = tracking?.kitchen?.contactPhone ?? tracking?.deliveryPartner?.phone;
    if (!phone) {
      Alert.alert('No number available', 'Reach us on WhatsApp and we will connect you.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Could not start the call'));
  };

  const handleCancel = () => {
    Alert.alert('Cancel this order?', 'The kitchen has not started cooking yet.', [
      { text: 'Keep order', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: () =>
          cancelOrder.mutate(
            { orderId: params.orderId, reason: 'Cancelled by customer' },
            {
              onError: (error) =>
                Alert.alert(
                  'Could not cancel',
                  error instanceof ApiError ? error.message : 'Please contact support.',
                ),
            },
          ),
      },
    ]);
  };

  if (isLoading || !tracking) {
    return (
      <View style={styles.screen}>
        <AppBar title="Track Order" onBack={navigation.goBack} />
        <View style={styles.loading}>
          <Skeleton height={92} radius={theme.radius.card} />
          <Skeleton height={260} radius={theme.radius.card} />
        </View>
      </View>
    );
  }

  const isCancelled = tracking.tracking.isCancelled;

  return (
    <View style={styles.screen}>
      <AppBar
        title="Track Order"
        subtitle={`Order #${tracking.orderNumber}`}
        onBack={navigation.goBack}
        right={
          <AppBarAction onPress={openWhatsApp} accessibilityLabel="Get help">
            <HelpCircle size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />
          </AppBarAction>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── ETA banner ─────────────────────────────────────────────── */}
        <Card
          padding="lg"
          elevation="sm"
          style={[styles.etaCard, isCancelled ? styles.etaCardCancelled : null]}
        >
          <View>
            <Text style={[theme.text.caption, styles.etaLabel]}>
              {isCancelled ? 'Order status' : 'Estimated delivery'}
            </Text>
            <Text style={theme.text.h1}>
              {isCancelled ? 'Cancelled' : tracking.eta.rangeLabel}
            </Text>
          </View>
          <View style={styles.etaBadge}>
            <Text style={[theme.text.caption, styles.etaBadgeText]}>
              {tracking.statusLabel ?? tracking.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </Card>

        {/* ── Stepper ────────────────────────────────────────────────── */}
        <Text style={[theme.text.overline, styles.sectionLabel]}>DELIVERY PROGRESS</Text>
        <Card padding="lg" elevation="xs">
          <OrderStatusStepper steps={tracking.tracking.steps} isCancelled={isCancelled} />
        </Card>

        {/* ── Kitchen + summary ──────────────────────────────────────── */}
        <Card padding="lg" elevation="xs" style={styles.kitchenCard}>
          <View style={styles.kitchenRow}>
            {tracking.kitchen.logoUrl ? (
              <Image source={{ uri: tracking.kitchen.logoUrl }} style={styles.kitchenLogo} />
            ) : (
              <View style={[styles.kitchenLogo, styles.kitchenLogoFallback]} />
            )}

            <View style={styles.kitchenText}>
              <Text style={theme.text.h4} numberOfLines={1}>
                {tracking.kitchen.name}
              </Text>
              <Text style={[theme.text.caption, styles.kitchenMeta]}>
                ★ {tracking.kitchen.rating?.toFixed(1)} · {tracking.kitchen.locality}
              </Text>
            </View>

            <Pressable
              onPress={callKitchen}
              style={styles.contactButton}
              accessibilityRole="button"
              accessibilityLabel="Call kitchen"
            >
              <Phone size={16} color={theme.colors.primary[600]} strokeWidth={2.4} />
            </Pressable>
            <Pressable
              onPress={openWhatsApp}
              style={styles.contactButton}
              accessibilityRole="button"
              accessibilityLabel="Message support"
            >
              <MessageSquare size={16} color={theme.colors.primary[600]} strokeWidth={2.4} />
            </Pressable>
          </View>

          {order ? (
            <>
              <Divider spacing={theme.spacing.md} />
              <Text style={[theme.text.overline, styles.summaryLabel]}>ORDER SUMMARY</Text>
              {order.items.map((item) => (
                <SummaryRow
                  key={item.id}
                  label={`${item.quantity}× ${item.name}`}
                  value={item.lineTotal}
                  tone="muted"
                />
              ))}
              <Divider dashed spacing={theme.spacing.sm} />
              <SummaryRow label="Total" value={order.totalAmount} tone="total" />
            </>
          ) : null}
        </Card>

        {/* ── Delivery partner ───────────────────────────────────────── */}
        {tracking.deliveryPartner ? (
          <Card padding="lg" elevation="xs" style={styles.partnerCard}>
            <View style={styles.kitchenRow}>
              <View style={[styles.kitchenLogo, styles.kitchenLogoFallback]} />
              <View style={styles.kitchenText}>
                <Text style={[theme.text.overline, styles.kitchenMeta]}>DELIVERY PARTNER</Text>
                <Text style={theme.text.h4}>{tracking.deliveryPartner.name}</Text>
                {tracking.deliveryPartner.vehicleNumber ? (
                  <Text style={[theme.text.caption, styles.kitchenMeta]}>
                    {tracking.deliveryPartner.vehicleNumber}
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={() => Linking.openURL(`tel:${tracking.deliveryPartner?.phone}`)}
                style={styles.contactButton}
                accessibilityRole="button"
                accessibilityLabel="Call delivery partner"
              >
                <Phone size={16} color={theme.colors.primary[600]} strokeWidth={2.4} />
              </Pressable>
            </View>
          </Card>
        ) : null}

        <View style={styles.hygieneBanner}>
          <ShieldCheck size={16} color={theme.colors.accent[600]} strokeWidth={2.2} />
          <Text style={[theme.text.caption, styles.hygieneText]}>
            Your food is handled following all safety and hygiene protocols.
          </Text>
        </View>

        <View style={styles.actions}>
          {order?.canCancel ? (
            <Button
              title="Cancel Order"
              variant="outline"
              onPress={handleCancel}
              loading={cancelOrder.isPending}
              leftIcon={
                <XCircle size={16} color={theme.colors.state.error} strokeWidth={2.2} />
              }
              style={styles.actionButton}
              fullWidth={false}
            />
          ) : null}

          <Button
            title="Share Live Tracking"
            onPress={openWhatsApp}
            leftIcon={<Share2 size={16} color={theme.colors.text.inverse} strokeWidth={2.2} />}
            style={styles.actionButton}
            fullWidth={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderTracking;

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
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  etaCardCancelled: {
    backgroundColor: theme.colors.state.errorBg,
  },
  etaLabel: {
    color: theme.colors.text.tertiary,
  },
  etaBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.brandWash,
  },
  etaBadgeText: {
    color: theme.colors.primary[600],
    textTransform: 'capitalize',
  },
  sectionLabel: {
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  kitchenCard: {
    marginTop: theme.spacing.md,
  },
  partnerCard: {
    marginTop: theme.spacing.md,
  },
  kitchenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  kitchenLogo: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutral[100],
  },
  kitchenLogoFallback: {
    backgroundColor: theme.colors.primary[50],
  },
  kitchenText: {
    flex: 1,
  },
  kitchenMeta: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  hygieneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent[50],
  },
  hygieneText: {
    flex: 1,
    color: theme.colors.accent[700],
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
