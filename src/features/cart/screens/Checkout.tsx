import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Lock, MapPin, Plus } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import { ApiError } from '@api';
import type { PaymentMethod } from '@api/types';
import { AppBar, Button, Card, Divider, StickyBar } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useAddresses, useDefaultAddress } from '@features/profile/hooks/useProfile';
import { usePlaceOrder } from '@features/orders/hooks/useOrders';
import BillSummary from '../components/BillSummary';
import PaymentMethodPicker from '../components/PaymentMethodPicker';
import DeliverySlotPicker, { type SlotChoice } from '../components/DeliverySlotPicker';
import { useCart } from '../hooks/useCart';

/**
 * Checkout. Address → time → payment → bill, in that order: each answer
 * narrows the next, and nothing competes with Place Order at the bottom.
 */
const Checkout = () => {
  const navigation = useNavigation<PrivateNavigation>();

  const { data: cart } = useCart();
  const { data: addresses } = useAddresses();
  const { data: defaultAddress } = useDefaultAddress();
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
        <View style={styles.sectionHeader}>
          <Text style={[theme.text.overline, styles.sectionLabel]}>DELIVERY ADDRESS</Text>
          <Text
            style={[theme.text.label, styles.link]}
            onPress={() => navigation.navigate('Addresses', { selectMode: true })}
          >
            {selectedAddress ? 'Change' : 'Add'}
          </Text>
        </View>

        {selectedAddress ? (
          <Card padding="md" elevation="xs">
            <View style={styles.addressRow}>
              <View style={styles.addressIcon}>
                <MapPin size={16} color={theme.colors.primary[600]} strokeWidth={2.4} />
              </View>
              <View style={styles.addressText}>
                <Text style={theme.text.h4}>
                  {selectedAddress.customLabel ?? titleCase(selectedAddress.label)}
                </Text>
                <Text style={[theme.text.bodySmall, styles.addressLine]}>
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
            </View>
          </Card>
        ) : (
          <Card
            padding="md"
            elevation="xs"
            onPress={() => navigation.navigate('AddressForm')}
            style={styles.addAddressCard}
          >
            <Plus size={18} color={theme.colors.primary[600]} strokeWidth={2.4} />
            <Text style={[theme.text.h4, styles.link]}>Add a delivery address</Text>
          </Card>
        )}

        {/* ── Delivery time ───────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[theme.text.overline, styles.sectionLabel]}>DELIVERY TIME</Text>
        </View>
        <DeliverySlotPicker
          value={slot}
          onChange={setSlot}
          prepTimeMins={cart.kitchen?.prepTimeMins ?? 25}
        />

        {/* ── Notes ───────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[theme.text.overline, styles.sectionLabel]}>ORDER NOTES</Text>
        </View>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Any instructions for the chef? (e.g. less spicy, no onions)"
          placeholderTextColor={theme.colors.text.tertiary}
          multiline
          maxLength={300}
          style={[theme.text.body, styles.notes]}
        />

        {/* ── Order summary ───────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[theme.text.overline, styles.sectionLabel]}>ORDER SUMMARY</Text>
        </View>
        <Card padding="md" elevation="xs">
          {cart.items.map((line, index) => (
            <View key={line.id}>
              {index > 0 ? <Divider spacing={theme.spacing.sm} /> : null}
              <View style={styles.summaryRow}>
                <View style={styles.quantityChip}>
                  <Text style={[theme.text.caption, styles.quantityText]}>{line.quantity}x</Text>
                </View>
                <Text style={[theme.text.body, styles.summaryName]} numberOfLines={2}>
                  {line.meal.name}
                </Text>
                <Text style={theme.text.bodyMedium}>{formatCurrency(line.lineTotal)}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* ── Payment ─────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[theme.text.overline, styles.sectionLabel]}>PAYMENT METHOD</Text>
        </View>
        <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />

        <BillSummary pricing={cart.pricing} couponCode={cart.coupon.code} title="Bill details" />
      </KeyboardAwareScrollView>

      <StickyBar>
        <View style={styles.stickyRow}>
          <View>
            <Text style={[theme.text.caption, styles.stickyLabel]}>TOTAL TO PAY</Text>
            <Text style={theme.text.h2}>{formatCurrency(cart.pricing.totalAmount)}</Text>
          </View>
          <Button
            title="Place Order"
            onPress={handlePlaceOrder}
            loading={placeOrder.isPending}
            disabled={!selectedAddress || !cart.checkout.canCheckout}
            fullWidth={false}
            style={styles.placeButton}
          />
        </View>

        <View style={styles.secureRow}>
          <Lock size={11} color={theme.colors.text.tertiary} strokeWidth={2.4} />
          <Text style={[theme.text.caption, styles.secureText]}>
            Secure payments by FreshBhoj
          </Text>
        </View>
      </StickyBar>
    </View>
  );
};

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default Checkout;

const styles = StyleSheet.create({
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    color: theme.colors.text.tertiary,
  },
  link: {
    color: theme.colors.primary[600],
  },
  addressRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  addressIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    flex: 1,
  },
  addressLine: {
    color: theme.colors.text.secondary,
    marginTop: 3,
  },
  addAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.borders.brand,
  },
  notes: {
    minHeight: 84,
    borderRadius: theme.radius.control,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.neutral[50],
    padding: theme.spacing.md,
    textAlignVertical: 'top',
    color: theme.colors.text.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  quantityChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borders.brand,
  },
  quantityText: {
    color: theme.colors.primary[600],
  },
  summaryName: {
    flex: 1,
    color: theme.colors.text.primary,
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
  placeButton: {
    flex: 1,
    maxWidth: 190,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: theme.spacing.sm,
  },
  secureText: {
    color: theme.colors.text.tertiary,
  },
});
