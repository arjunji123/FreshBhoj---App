import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AlertCircle, ShoppingBag, Trash2 } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import { ApiError } from '@api';
import {
  AppBar,
  AppBarAction,
  Button,
  Card,
  Divider,
  EmptyState,
  Skeleton,
  StickyBar,
  VerifiedBadge,
} from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import CartItemRow from '../components/CartItemRow';
import CouponPanel from '../components/CouponPanel';
import BillSummary from '../components/BillSummary';
import {
  useApplyCoupon,
  useCart,
  useClearCart,
  useCoupons,
  useRemoveCoupon,
  useUpdateCartItem,
} from '../hooks/useCart';

const Cart = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const [couponError, setCouponError] = useState<string | null>(null);

  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const clearCart = useClearCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const { data: coupons } = useCoupons(cart?.pricing.itemsTotal ?? 0);

  const handleClear = () => {
    Alert.alert('Empty your cart?', 'This removes every item from your cart.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Empty cart', style: 'destructive', onPress: () => clearCart.mutate() },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <AppBar title="Your Cart" onBack={navigation.goBack} />
        <View style={styles.loading}>
          <Skeleton height={92} radius={theme.radius.card} />
          <Skeleton height={92} radius={theme.radius.card} />
          <Skeleton height={180} radius={theme.radius.card} />
        </View>
      </View>
    );
  }

  if (!cart || cart.isEmpty) {
    return (
      <View style={styles.screen}>
        <AppBar title="Your Cart" onBack={navigation.goBack} />
        <EmptyState
          icon={<ShoppingBag size={38} color={theme.colors.primary[600]} strokeWidth={1.8} />}
          title="Your cart is empty"
          description="Fresh, macro-counted meals from verified kitchens near you are a tap away."
          actionLabel="Browse meals"
          onAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppBar
        title="Your Cart"
        subtitle={`${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'}`}
        onBack={navigation.goBack}
        right={
          <AppBarAction onPress={handleClear} accessibilityLabel="Empty cart">
            <Trash2 size={17} color={theme.colors.state.error} strokeWidth={2.2} />
          </AppBarAction>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {cart.kitchen ? (
          <Card padding="md" elevation="xs" style={styles.kitchenCard}>
            <View style={styles.kitchenRow}>
              <View style={styles.kitchenText}>
                <Text style={[theme.text.overline, styles.kitchenLabel]}>ORDERING FROM</Text>
                <View style={styles.kitchenNameRow}>
                  <Text style={theme.text.h4} numberOfLines={1}>
                    {cart.kitchen.name}
                  </Text>
                  {cart.kitchen.isVerified ? <VerifiedBadge /> : null}
                </View>
              </View>
              <Text style={[theme.text.caption, styles.prepTime]}>
                {cart.kitchen.prepTimeMins} min
              </Text>
            </View>
          </Card>
        ) : null}

        <Card padding="md" elevation="xs" style={styles.itemsCard}>
          {cart.items.map((line, index) => (
            <View key={line.id}>
              {index > 0 ? <Divider spacing={theme.spacing.xs} /> : null}
              <CartItemRow
                line={line}
                isUpdating={updateItem.isPending}
                onChangeQuantity={(quantity) =>
                  updateItem.mutate({ itemId: line.id, quantity })
                }
              />
            </View>
          ))}
        </Card>

        <CouponPanel
          cart={cart}
          coupons={coupons ?? []}
          isApplying={applyCoupon.isPending}
          errorMessage={couponError}
          onApply={(code) => {
            setCouponError(null);
            applyCoupon.mutate(code, {
              onError: (error) =>
                setCouponError(
                  error instanceof ApiError ? error.message : 'That coupon could not be applied',
                ),
            });
          }}
          onRemove={() => {
            setCouponError(null);
            removeCoupon.mutate();
          }}
        />

        <BillSummary pricing={cart.pricing} couponCode={cart.coupon.code} />

        {cart.checkout.blockers.length ? (
          <View style={styles.blockers}>
            {cart.checkout.blockers.map((blocker) => (
              <View key={blocker} style={styles.blockerRow}>
                <AlertCircle size={14} color={theme.colors.state.error} strokeWidth={2.4} />
                <Text style={[theme.text.caption, styles.blockerText]}>{blocker}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <StickyBar>
        <View style={styles.stickyRow}>
          <View>
            <Text style={[theme.text.caption, styles.stickyLabel]}>TOTAL</Text>
            <Text style={theme.text.h2}>{formatCurrency(cart.pricing.totalAmount)}</Text>
          </View>
          <Button
            title="Proceed to Checkout"
            onPress={() => navigation.navigate('Checkout')}
            disabled={!cart.checkout.canCheckout}
            fullWidth={false}
            style={styles.checkoutButton}
          />
        </View>
      </StickyBar>
    </View>
  );
};

export default Cart;

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
  kitchenCard: {
    marginTop: theme.spacing.md,
  },
  kitchenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  kitchenText: {
    flex: 1,
  },
  kitchenLabel: {
    color: theme.colors.text.tertiary,
    marginBottom: 3,
  },
  kitchenNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  prepTime: {
    color: theme.colors.text.secondary,
  },
  itemsCard: {
    marginTop: theme.spacing.md,
  },
  blockers: {
    marginTop: theme.spacing.md,
    gap: 6,
  },
  blockerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blockerText: {
    color: theme.colors.state.error,
    flex: 1,
  },
  stickyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  stickyLabel: {
    color: theme.colors.text.tertiary,
  },
  checkoutButton: {
    flex: 1,
    maxWidth: 230,
  },
});
