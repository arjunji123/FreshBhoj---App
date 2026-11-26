import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Lock, MapPin, NotebookPen, Plus } from 'lucide-react-native';
import { formatCurrency } from '@utils/format';
import { ApiError } from '@api';
import type { PaymentMethod } from '@api/types';
import { AppBar, Button, Skeleton, StickyBar, Text } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useAddresses, useDefaultAddress } from '@features/profile/hooks/useProfile';
import { useRequireAuth } from '@features/authentication/hooks/useRequireAuth';
import { usePlaceOrder } from '@features/orders/hooks/useOrders';
import BillSummary from '../components/BillSummary';
import PaymentMethodPicker from '../components/PaymentMethodPicker';
import DeliverySlotPicker, { type SlotChoice } from '../components/DeliverySlotPicker';
import { useCart } from '../hooks/useCart';
import { useTheme } from "@app/theme/useTheme";

/**
 * Checkout. Address → time → payment → bill, in that order: each answer
 * narrows the next, and nothing competes with Place Order at the bottom.
 */
const Checkout = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const requireAuth = useRequireAuth();

  const { data: cart, isLoading: isCartLoading } = useCart();
  const { data: addresses, isLoading: isAddressesLoading } = useAddresses();
  const { data: defaultAddress, isLoading: isDefaultAddressLoading } = useDefaultAddress();
  const placeOrder = usePlaceOrder();

  const [addressId, setAddressId] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [slot, setSlot] = useState<SlotChoice>({ type: 'NOW' });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!addressId && defaultAddress) setAddressId(defaultAddress.id);
  }, [defaultAddress, addressId]);

  const selectedAddress = useMemo(
    () => addresses?.find((address) => address.id === addressId) ?? defaultAddress ?? null,
    [addresses, addressId, defaultAddress],
  );

  const handlePlaceOrder = () => {
    if (!requireAuth(handlePlaceOrder)) return;

    if (!selectedAddress) {
      Alert.alert('Add a delivery address', 'We need somewhere to send your food.');
      return;
    }

    placeOrder.mutate(
      {
        addressId: selectedAddress.id,
        paymentMethod,
        slotType: slot.type,
        scheduledFor: slot.type === 'SCHEDULED' ? slot.isoTime : undefined,
        orderNotes: notes.trim() || undefined,
      },
      {
        onSuccess: (order) => {
          // COD skips the gateway and is already PLACED; everything else goes
          // through the processing screen, which drives the payment call.
          if (order.status === 'PENDING_PAYMENT') {
            navigation.replace('PaymentProcessing', { orderId: order.id, paymentMethod });
          } else {
            navigation.replace('OrderConfirmation', { orderId: order.id });
          }
        },
        onError: (error) =>
          Alert.alert(
            'Could not place your order',
            error instanceof ApiError ? error.message : 'Please try again.',
          ),
      },
    );
  };

  const isLoading = isCartLoading || isAddressesLoading || isDefaultAddressLoading;

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <AppBar title="Checkout" onBack={navigation.goBack} />
        <View style={styles.scroll}>
          <Skeleton height={80} radius={theme.radius.card} style={styles.loadingBlock} />
          <Skeleton height={64} radius={theme.radius.card} style={styles.loadingBlock} />
          <Skeleton height={140} radius={theme.radius.card} style={styles.loadingBlock} />
          <Skeleton height={100} radius={theme.radius.card} style={styles.loadingBlock} />
        </View>
      </View>
    );
  }

  if (!cart || cart.isEmpty) {
    return (
      <View style={styles.screen}>
        <AppBar title="Checkout" onBack={navigation.goBack} />
        <View style={styles.emptyState}>
          <Text style={theme.text.h3}>Your cart is empty</Text>
          <Button
            title="Browse meals"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            fullWidth={false}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppBar title="Checkout" onBack={navigation.goBack} />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        {/* ── Address ─────────────────────────────────────────────────── */}
        {selectedAddress ? (
          <View style={[styles.block, styles.addressRow]}>
            <View style={styles.iconWrap}>
              <MapPin size={16} color={theme.colors.text.brand} strokeWidth={2.4} />
            </View>
            <View style={styles.addressText}>
              <Text style={theme.text.label} numberOfLines={1}>
                Deliver to {selectedAddress.customLabel ?? titleCase(selectedAddress.label)}
              </Text>
              <Text style={[theme.text.caption, styles.addressLine]} numberOfLines={2}>
                {[
                  selectedAddress.line1,
                  selectedAddress.line2,
                  selectedAddress.locality,
                  `${selectedAddress.city} - ${selectedAddress.pincode}`,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </View>
            <Text
              style={[theme.text.label, styles.link]}
              onPress={() => navigation.navigate('Addresses', { selectMode: true })}
              suppressHighlighting
            >
              Change
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={() => navigation.navigate('AddressForm')}
            accessibilityRole="button"
            style={[styles.block, styles.addAddress]}
          >
            <Plus size={16} color={theme.colors.text.brand} strokeWidth={2.6} />
            <Text style={[theme.text.label, styles.link]}>Add a delivery address</Text>
          </Pressable>
        )}

        {/* ── Delivery time ───────────────────────────────────────────── */}
        <View style={[styles.block, styles.padded]}>
          <Text style={[theme.text.label, styles.blockTitle]}>Delivery time</Text>
          <DeliverySlotPicker
            value={slot}
            onChange={setSlot}
            prepTimeMins={cart.kitchen?.prepTimeMins ?? 25}
          />
        </View>

        {/* ── Items and instructions ──────────────────────────────────── */}
        <View style={[styles.block, styles.padded]}>
          <Text style={[theme.text.label, styles.blockTitle]} numberOfLines={1}>
            Your order{cart.kitchen ? ` from ${cart.kitchen.name}` : ''}
          </Text>
          {cart.items.map((line) => (
            <View key={line.id} style={styles.summaryRow}>
              <View style={styles.quantityChip}>
                <Text style={[theme.text.caption, styles.quantityText]}>{line.quantity}x</Text>
              </View>
              <Text style={[theme.text.bodySmall, styles.summaryName]} numberOfLines={1}>
                {line.meal.name}
              </Text>
              <Text style={theme.text.label}>{formatCurrency(line.lineTotal)}</Text>
            </View>
          ))}
          <View style={styles.notesRow}>
            <NotebookPen size={15} color={theme.colors.text.tertiary} strokeWidth={2.2} />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Cooking instructions, e.g. less spicy"
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              maxLength={300}
              style={[theme.text.bodySmall, styles.notes]}
            />
          </View>
        </View>

        {/* ── Payment ─────────────────────────────────────────────────── */}
        <View style={[styles.block, styles.padded]}>
          <Text style={theme.text.label}>Payment method</Text>
          <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
        </View>

        <BillSummary pricing={cart.pricing} couponCode={cart.coupon.code} title="Bill details" />
      </KeyboardAwareScrollView>

      <StickyBar>
        <View style={styles.stickyRow}>
          <View>
            <Text style={theme.text.h4}>{formatCurrency(cart.pricing.totalAmount)}</Text>
            <View style={styles.secureRow}>
              <Lock size={10} color={theme.colors.text.tertiary} strokeWidth={2.4} />
              <Text style={[theme.text.caption, styles.secureText]}>Secure payment</Text>
            </View>
          </View>
          <Button
            title="Place order"
            size="sm"
            onPress={handlePlaceOrder}
            loading={placeOrder.isPending}
            disabled={!selectedAddress || !cart.checkout.canCheckout}
            fullWidth={false}
            style={styles.placeButton}
          />
        </View>
      </StickyBar>
    </View>
  );
};

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default Checkout;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  scroll: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  loadingBlock: {
    marginTop: theme.spacing.lg,
  },
  // One surface style for every group, matching the cart.
  block: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.raised,
  },
  padded: {
    padding: theme.spacing.md,
  },
  blockTitle: {
    marginBottom: theme.spacing.sm,
  },
  link: {
    color: theme.colors.text.brand,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.surface.brandWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    flex: 1,
  },
  addressLine: {
    color: theme.colors.text.secondary,
    marginTop: 1,
  },
  addAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borders.brand,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  quantityChip: {
    paddingHorizontal: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.brandWash,
  },
  quantityText: {
    color: theme.colors.text.brand,
  },
  summaryName: {
    flex: 1,
    color: theme.colors.text.primary,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.page,
  },
  notes: {
    flex: 1,
    minHeight: 40,
    maxHeight: 90,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  stickyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  placeButton: {
    flex: 1,
    maxWidth: 190,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  secureText: {
    color: theme.colors.text.tertiary,
  },
});
