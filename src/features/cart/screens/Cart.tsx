import React, { useState, useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { AlertCircle, BadgeCheck, Plus } from 'lucide-react-native';
import { enterRise } from '@animations/motion';
import { TrashIcon } from '@components/icons';
import { formatCurrency } from '@utils/format';
import { ApiError } from '@api';
import { AppBar, AppBarAction, Button, EmptyState, Skeleton, StickyBar, Text } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useRequireAuth } from '@features/authentication/hooks/useRequireAuth';
import { EmptyCart } from '@components/illustrations';
import CartItemRow from '../components/CartItemRow';
import CouponPanel from '../components/CouponPanel';
import CoinsPanel from '../components/CoinsPanel';
import CartNutritionCard from '@features/fit/components/CartNutritionCard';
import BillSummary from '../components/BillSummary';
import {
  useApplyCoins,
  useApplyCoupon,
  useCart,
  useClearCart,
  useCoupons,
  useRemoveCoins,
  useRemoveCoupon,
  useUpdateCartItem,
} from '../hooks/useCart';
import { useTheme } from "@app/theme/useTheme";

const Cart = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const requireAuth = useRequireAuth();
  const [couponError, setCouponError] = useState<string | null>(null);

  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const clearCart = useClearCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const applyCoins = useApplyCoins();
  const removeCoins = useRemoveCoins();
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
          illustration={<EmptyCart size={190} />}
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
        title="Your cart"
        subtitle={`${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'}`}
        onBack={navigation.goBack}
        right={
          <AppBarAction onPress={handleClear} accessibilityLabel="Empty cart">
            <TrashIcon size={18} color={theme.colors.state.error} />
          </AppBarAction>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View entering={enterRise(0)} style={styles.block}>
          {cart.kitchen ? (
            <View style={styles.kitchenRow}>
              <View style={styles.kitchenText}>
                <View style={styles.kitchenNameRow}>
                  <Text style={[theme.text.label, styles.kitchenName]} numberOfLines={1}>
                    {cart.kitchen.name}
                  </Text>
                  {cart.kitchen.isVerified ? (
                    <BadgeCheck size={16} color={theme.colors.primary[600]} strokeWidth={2.4} />
                  ) : null}
                </View>
                <Text style={[theme.text.caption, styles.kitchenMeta]}>
                  Delivery in about {cart.kitchen.prepTimeMins} min
                </Text>
              </View>
            </View>
          ) : null}

          {cart.items.map((line) => (
            <View key={line.id} style={styles.itemLine}>
              <CartItemRow
                line={line}
                isUpdating={updateItem.isPending}
                onChangeQuantity={(quantity) => updateItem.mutate({ itemId: line.id, quantity })}
              />
            </View>
          ))}

          {cart.kitchen ? (
            <Pressable
              onPress={() =>
                navigation.navigate('KitchenProfile', {
                  kitchenId: cart.kitchen!.id,
                  kitchenName: cart.kitchen!.name,
                })
              }
              accessibilityRole="button"
              style={styles.addMore}
            >
              <Plus size={15} color={theme.colors.text.brand} strokeWidth={2.8} />
              <Text style={[theme.text.label, styles.addMoreText]}>Add more items</Text>
            </Pressable>
          ) : null}
        </Animated.View>

        <CartNutritionCard cart={cart} index={2} />

        <View style={styles.block}>
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
          <View style={styles.blockDivider} />
          <CoinsPanel
            cart={cart}
            isApplying={applyCoins.isPending}
            isRemoving={removeCoins.isPending}
            onApply={() => applyCoins.mutate()}
            onRemove={() => removeCoins.mutate()}
          />
        </View>

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
            <Text style={theme.text.h4}>{formatCurrency(cart.pricing.totalAmount)}</Text>
            <Text style={[theme.text.caption, styles.stickyLabel]}>Total to pay</Text>
          </View>
          <Button
            title="Checkout"
            size="sm"
            onPress={() => requireAuth(() => navigation.navigate('Checkout'))}
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

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
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
  // One surface style for every group on the page.
  block: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.raised,
    overflow: 'hidden',
  },
  blockDivider: {
    height: 1,
    marginHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.borders.subtle,
  },
  kitchenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borders.subtle,
  },
  kitchenText: {
    flex: 1,
  },
  kitchenNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kitchenName: {
    flexShrink: 1,
  },
  kitchenMeta: {
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
  itemLine: {
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borders.subtle,
  },
  addMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: theme.spacing.md,
  },
  addMoreText: {
    color: theme.colors.text.brand,
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
    maxWidth: 180,
  },
});
