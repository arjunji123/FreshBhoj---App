import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Check, Clock, Receipt, X } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import { Button, Card, Skeleton } from '@components/ui';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { useOrder } from '../hooks/useOrders';

type Route = RouteProp<PrivateStackParamList, 'OrderConfirmation'>;

/**
 * The reassurance moment straight after payment. The tick springs in, the ETA
 * is the biggest thing on screen, and Track Order is the only primary action.
 */
const OrderConfirmation = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();
  const { data: order, isLoading } = useOrder(params.orderId);

  const tickScale = useSharedValue(0);
  const ringScale = useSharedValue(0.6);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    ringScale.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
    tickScale.value = withDelay(160, withSpring(1, { damping: 11, stiffness: 160 }));
    contentOpacity.value = withDelay(360, withTiming(1, { duration: 420 }));
  }, [tickScale, ringScale, contentOpacity]);

  const tickStyle = useAnimatedStyle(() => ({ transform: [{ scale: tickScale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringScale.value,
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  /** Closing lands on Orders, not back into the checkout stack. */
  const goHome = () => navigation.navigate('MainTabs', { screen: 'Orders' });

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={goHome}
          hitSlop={theme.layout.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={22} color={theme.colors.text.primary} strokeWidth={2.4} />
        </Pressable>
        <Text style={[theme.text.h4, styles.brand]}>FreshBhoj</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <View style={styles.successWrap}>
          <Animated.View style={[styles.successRing, ringStyle]} />
          <Animated.View style={[styles.successCircle, tickStyle]}>
            <Check size={38} color={theme.colors.text.inverse} strokeWidth={3.5} />
          </Animated.View>
        </View>

        <Animated.View style={[styles.content, contentStyle]}>
          <Text style={[theme.text.displaySmall, styles.title]}>Order Accepted! 🎉</Text>
          <Text style={[theme.text.bodyLarge, styles.subtitle]}>
            {order
              ? `${order.kitchen.name} has started preparing your feast. Sit back and relax!`
              : 'Your order is on its way.'}
          </Text>

          {isLoading || !order ? (
            <View style={styles.loading}>
              <Skeleton height={110} radius={theme.radius.card} />
              <Skeleton height={74} radius={theme.radius.card} />
            </View>
          ) : (
            <>
              <Card padding="lg" elevation="sm" style={styles.etaCard}>
                <Text style={[theme.text.overline, styles.etaLabel]}>ESTIMATED ARRIVAL</Text>
                <View style={styles.etaRow}>
                  <Clock size={26} color={theme.colors.primary[600]} strokeWidth={2.4} />
                  <Text style={theme.text.displayMedium}>{order.eta.etaMinutes} Mins</Text>
                </View>
              </Card>

              <Card padding="md" elevation="xs" style={styles.orderCard}>
                <View style={styles.orderRow}>
                  <View style={styles.receiptIcon}>
                    <Receipt size={17} color={theme.colors.primary[600]} strokeWidth={2.2} />
                  </View>
                  <View style={styles.orderText}>
                    <Text style={theme.text.h4}>Order #{order.orderNumber}</Text>
                    <Text style={[theme.text.caption, styles.orderMeta]} numberOfLines={1}>
                      {order.kitchen.name} · {order.itemCount}{' '}
                      {order.itemCount === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                  <Text style={theme.text.numeric}>{formatCurrency(order.totalAmount)}</Text>
                </View>
              </Card>
            </>
          )}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Track Live Order"
          onPress={() => navigation.replace('OrderTracking', { orderId: params.orderId })}
          disabled={!order}
        />
        <Text style={[theme.text.overline, styles.guarantee]}>PREMIUM QUALITY GUARANTEED</Text>
      </View>
    </View>
  );
};

export default OrderConfirmation;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
    paddingTop: theme.spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
  },
  brand: {
    color: theme.colors.text.primary,
  },
  headerSpacer: {
    width: 22,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.xxl,
  },
  successWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 60,
    backgroundColor: theme.colors.accent[100],
  },
  successCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: theme.colors.accent[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.md,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  loading: {
    width: '100%',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xxl,
  },
  etaCard: {
    width: '100%',
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  etaLabel: {
    color: theme.colors.text.tertiary,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  orderCard: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  receiptIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    flex: 1,
  },
  orderMeta: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  guarantee: {
    textAlign: 'center',
    color: theme.colors.text.tertiary,
  },
});
