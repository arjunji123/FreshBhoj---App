import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Briefcase, Check, Home, MapPin, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { AppBar, Badge, Button, Card, EmptyState, Skeleton } from '@components/ui';
import type { Address } from '@api/types';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from '../hooks/useProfile';

type Route = RouteProp<PrivateStackParamList, 'Addresses'>;

const LABEL_ICONS = {
  HOME: Home,
  WORK: Briefcase,
  OTHER: MapPin,
} as const;

const Addresses = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();

  const { data: addresses, isLoading } = useAddresses();
  const setDefault = useSetDefaultAddress();
  const remove = useDeleteAddress();

  const handleDelete = (address: Address) => {
    Alert.alert('Delete this address?', 'You can always add it again later.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(address.id) },
    ]);
  };

  const handleSelect = (address: Address) => {
    // From checkout this screen doubles as a picker: choosing sets the default,
    // which is what checkout reads back.
    if (params?.selectMode) {
      setDefault.mutate(address.id, { onSuccess: () => navigation.goBack() });
      return;
    }
    setDefault.mutate(address.id);
  };

  return (
    <View style={styles.screen}>
      <AppBar
        title={params?.selectMode ? 'Choose address' : 'Saved Addresses'}
        onBack={navigation.goBack}
      />

      {isLoading ? (
        <View style={styles.loading}>
          <Skeleton height={112} radius={theme.radius.card} />
          <Skeleton height={112} radius={theme.radius.card} />
        </View>
      ) : !addresses?.length ? (
        <EmptyState
          icon={<MapPin size={34} color={theme.colors.primary[600]} strokeWidth={1.8} />}
          title="No saved addresses"
          description="Add where you want your food delivered and checkout gets a lot faster."
          actionLabel="Add address"
          onAction={() => navigation.navigate('AddressForm')}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {addresses.map((address) => {
            const Icon = LABEL_ICONS[address.label] ?? MapPin;
            return (
              <Card
                key={address.id}
                padding="md"
                elevation="xs"
                onPress={() => handleSelect(address)}
                style={[styles.card, address.isDefault ? styles.cardDefault : null]}
              >
                <View style={styles.row}>
                  <View style={styles.iconWrap}>
                    <Icon size={17} color={theme.colors.primary[600]} strokeWidth={2.2} />
                  </View>

                  <View style={styles.text}>
                    <View style={styles.labelRow}>
                      <Text style={theme.text.h4}>
                        {address.customLabel ?? titleCase(address.label)}
                      </Text>
                      {address.isDefault ? <Badge label="Default" tone="accent" /> : null}
                    </View>
                    <Text style={[theme.text.bodySmall, styles.line]}>
                      {[address.line1, address.line2, address.locality]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                    <Text style={[theme.text.caption, styles.line]}>
                      {address.city} - {address.pincode}
                    </Text>
                    {address.receiverName ? (
                      <Text style={[theme.text.caption, styles.line]}>
                        {address.receiverName}
                        {address.receiverPhone ? ` · ${address.receiverPhone}` : ''}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => navigation.navigate('AddressForm', { addressId: address.id })}
                      accessibilityLabel="Edit address"
                    >
                      <Pencil size={16} color={theme.colors.text.tertiary} strokeWidth={2.2} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(address)}
                      accessibilityLabel="Delete address"
                    >
                      <Trash2 size={16} color={theme.colors.state.error} strokeWidth={2.2} />
                    </Pressable>
                  </View>
                </View>

                {params?.selectMode && address.isDefault ? (
                  <View style={styles.selectedRow}>
                    <Check size={14} color={theme.colors.accent[600]} strokeWidth={2.6} />
                    <Text style={[theme.text.caption, styles.selectedText]}>
                      Delivering here
                    </Text>
                  </View>
                ) : null}
              </Card>
            );
          })}

          <Button
            title="Add new address"
            variant="outline"
            onPress={() => navigation.navigate('AddressForm')}
            leftIcon={<Plus size={17} color={theme.colors.primary[600]} strokeWidth={2.6} />}
            style={styles.addButton}
          />
        </ScrollView>
      )}
    </View>
  );
};

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default Addresses;

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
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl,
  },
  card: {
    marginBottom: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardDefault: {
    borderColor: theme.colors.borders.brand,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  line: {
    color: theme.colors.text.secondary,
    marginTop: 3,
  },
  actions: {
    gap: theme.spacing.lg,
    alignItems: 'center',
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: theme.spacing.md,
  },
  selectedText: {
    color: theme.colors.accent[600],
  },
  addButton: {
    marginTop: theme.spacing.sm,
  },
});
