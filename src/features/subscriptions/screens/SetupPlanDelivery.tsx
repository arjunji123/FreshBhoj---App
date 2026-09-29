import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { MapPin, Plus } from 'lucide-react-native';
import { AppBar, Button, Card, Chip, ChipRow, Screen, StickyBar } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useAddresses, useDefaultAddress } from '@features/profile/hooks/useProfile';
import { useSetupPlanStore } from '../store/setupPlanStore';
import { useTheme } from "@app/theme/useTheme";

const START_DATE_COUNT = 14;

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

/** Step 2 of 3 — address, start date, special instructions. */
const SetupPlanDelivery = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();

  const kitchenId = useSetupPlanStore((s) => s.kitchenId);
  const addressId = useSetupPlanStore((s) => s.addressId);
  const startDate = useSetupPlanStore((s) => s.startDate);
  const specialInstructions = useSetupPlanStore((s) => s.specialInstructions);
  const setDelivery = useSetupPlanStore((s) => s.setDelivery);

  useEffect(() => {
    if (!kitchenId) navigation.goBack();
  }, [kitchenId, navigation]);

  const { data: addresses, isLoading: isAddressesLoading } = useAddresses();
  const { data: defaultAddress } = useDefaultAddress();

  // Same pattern as `Checkout.tsx`: only seed from the account default once,
  // so a later "Change" from the address picker isn't stomped on.
  useEffect(() => {
    if (!addressId && defaultAddress) setDelivery({ addressId: defaultAddress.id });
  }, [defaultAddress, addressId, setDelivery]);

  const selectedAddress = useMemo(
    () => addresses?.find((address) => address.id === addressId) ?? defaultAddress ?? null,
    [addresses, addressId, defaultAddress],
  );

  const dateOptions = useMemo(
    () => Array.from({ length: START_DATE_COUNT }).map((_, index) => dayjs().add(index, 'day')),
    [],
  );

  // The wizard always has a start date pre-picked so the customer isn't
  // blocked on a choice that most people will just leave at "today".
  useEffect(() => {
    if (!startDate) setDelivery({ startDate: dayjs().format('YYYY-MM-DD') });
  }, [startDate, setDelivery]);

  const canContinue = Boolean(addressId);

  return (
    <Screen background="page">
      <AppBar title="Delivery & Schedule" subtitle="Step 2 of 3" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={[theme.text.overline, styles.sectionLabel]}>DELIVERY ADDRESS</Text>
          <Text
            style={[theme.text.label, styles.link]}
            onPress={() => navigation.navigate('Addresses', { selectMode: true })}
          >
            {selectedAddress ? 'Change' : 'Add'}
          </Text>
        </View>

        {isAddressesLoading ? null : selectedAddress ? (
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

        <View style={styles.sectionHeader}>
          <Text style={[theme.text.overline, styles.sectionLabel]}>START DATE</Text>
        </View>
        <ChipRow style={styles.dateRow}>
          {dateOptions.map((date) => {
            const iso = date.format('YYYY-MM-DD');
            return (
              <Chip
                key={iso}
                label={date.isSame(dayjs(), 'day') ? 'Today' : date.format('ddd, D MMM')}
                selected={startDate === iso}
                onPress={() => setDelivery({ startDate: iso })}
              />
            );
          })}
        </ChipRow>

        <View style={styles.sectionHeader}>
          <Text style={[theme.text.overline, styles.sectionLabel]}>SPECIAL INSTRUCTIONS</Text>
        </View>
        <TextInput
          value={specialInstructions}
          onChangeText={(text) => setDelivery({ specialInstructions: text })}
          placeholder="Anything the kitchen should know? (e.g. less spicy, no onions)"
          placeholderTextColor={theme.colors.text.tertiary}
          multiline
          maxLength={300}
          style={[theme.text.body, styles.notes]}
        />
      </ScrollView>

      <StickyBar>
        <Button title="Continue" onPress={() => navigation.navigate('SetupPlanReview')} disabled={!canContinue} />
      </StickyBar>
    </Screen>
  );
};

export default SetupPlanDelivery;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  scroll: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxl,
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
  dateRow: {
    paddingHorizontal: 0,
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
});
