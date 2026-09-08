import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, ShoppingBag } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import { useCart } from '@features/cart/hooks/useCart';
import { useAuthStore } from '@features/authentication/store/authStore';
import { getActiveRouteNames, navigationRef } from '@app/navigation/navigationRef';
import AppGradient from './AppGradient';

const GAP_ABOVE_BAR = theme.spacing.md;
const BAR_HEIGHT = 52;

/** Extra bottom padding a scrollable screen should add so its own content
 * never sits behind the floating cart bar when the cart has items. */
export const MINI_CART_BAR_CLEARANCE = BAR_HEIGHT + GAP_ABOVE_BAR + theme.spacing.lg;

// Screens that already own their own cart / checkout action at the bottom —
// a second floating bar there would just duplicate the primary CTA.
const HIDDEN_ROUTES = new Set([
  'Cart',
  'Checkout',
  'PaymentProcessing',
  'OrderConfirmation',
  'MealDetail',
  'FoodFeed',
  'ReelViewer',
  'WriteReview',
]);

/**
 * The persistent "N items · View Cart" row every screen in the app shares —
 * so adding a dish from Home, Search or a kitchen menu always has a visible,
 * one-tap way back to the cart, instead of a bare CTA link that looked like
 * plain text and was easy to miss.
 */
const MiniCartBar = () => {
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);
  const { data: cart } = useCart();
  const [routeNames, setRouteNames] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      if (navigationRef.isReady()) setRouteNames(getActiveRouteNames(navigationRef.getRootState()));
    };
    sync();
    const unsubscribe = navigationRef.addListener('state', sync);
    return unsubscribe;
  }, []);

  if ((!isAuthenticated && !isGuest) || !cart || cart.isEmpty) return null;
  if (routeNames.some((name) => HIDDEN_ROUTES.has(name))) return null;

  // Bottom tabs are only on screen when the focused route sits inside them.
  const isOnTabScreen = routeNames[0] === 'MainTabs';
  const bottom =
    (isOnTabScreen ? theme.layout.tabBarHeight + insets.bottom : insets.bottom) + GAP_ABOVE_BAR;

  return (
    <Pressable
      onPress={() => navigationRef.isReady() && navigationRef.navigate('Cart')}
      accessibilityRole="button"
      accessibilityLabel={`View cart, ${cart.itemCount} items`}
      style={[styles.wrap, { bottom }]}
    >
      <AppGradient
        colors={theme.colors.gradients.brand}
        locations={theme.colors.gradients.brandLocations}
        direction="diagonal"
        style={styles.bar}
      >
        <View style={styles.iconWrap}>
          <ShoppingBag size={16} color={theme.colors.text.inverse} strokeWidth={2.2} />
        </View>
        <Text style={[theme.text.label, styles.text]} numberOfLines={1}>
          {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} · {formatCurrency(cart.pricing.totalAmount)}
        </Text>
        <View style={styles.viewCartRow}>
          <Text style={[theme.text.buttonSmall, styles.viewCartText]}>View Cart</Text>
          <ChevronRight size={16} color={theme.colors.text.inverse} strokeWidth={2.6} />
        </View>
      </AppGradient>
    </Pressable>
  );
};

export default MiniCartBar;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: theme.layout.screenPadding,
    right: theme.layout.screenPadding,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    height: BAR_HEIGHT,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    ...theme.elevation.primary,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    color: theme.colors.text.inverse,
  },
  viewCartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewCartText: {
    color: theme.colors.text.inverse,
  },
});
