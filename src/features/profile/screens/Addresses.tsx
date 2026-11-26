import React, { useMemo } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { AlertCircle, Briefcase, CircleCheck, Home, MapPin, Plus } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import AppGradient from '@components/AppGradient';
import Animated from 'react-native-reanimated';
import { enterRise } from '@animations/motion';
import { AddressIcon, PencilIcon, TrashIcon } from '@components/icons';
import { AppBar, EmptyState, Skeleton, Text } from '@components/ui';
import { ApiError } from '@api';
import type { Address } from '@api/types';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from '../hooks/useProfile';
import { useTheme } from "@app/theme/useTheme";

type Route = RouteProp<PrivateStackParamList, 'Addresses'>;

const LABEL_ICONS = {
  HOME: Home,
  WORK: Briefcase,
  OTHER: MapPin,
} as const;

const Addresses = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();

  const { data: addresses, isLoading, isError, isRefetching, refetch } = useAddresses();
  const setDefault = useSetDefaultAddress();
  const remove = useDeleteAddress();

  const handleDelete = (address: Address) => {
    Alert.alert('Delete this address?', 'You can always add it again later.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          remove.mutate(address.id, {
            onError: (error) =>
              Alert.alert(
                'Could not delete',
                error instanceof ApiError ? error.message : 'Please try again.',
              ),
          }),
      },
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
      ) : isError && !addresses ? (
        <EmptyState
          icon={<AlertCircle size={34} color={theme.colors.state.error} strokeWidth={1.8} />}
          title="Could not load your addresses"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : !addresses?.length ? (
        <EmptyState
          icon={<AddressIcon size={44} color={theme.colors.primary[600]} />}
          title="No saved addresses"
          description="Add where you want your food delivered and checkout gets a lot faster."
          actionLabel="Add address"
          onAction={() => navigation.navigate('AddressForm')}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={theme.colors.primary[600]}
            />
          }
        >
          {addresses.map((address, index) => {
            const Icon = LABEL_ICONS[address.label] ?? MapPin;
            return (
              <Animated.View key={address.id} entering={enterRise(index)}>
              <PressableScale
                onPress={() => handleSelect(address)}
                scaleTo={0.98}
                haptic={false}
                accessibilityRole="radio"
                accessibilityState={{ selected: address.isDefault }}
                style={[styles.card, address.isDefault ? styles.cardDefault : null]}
              >
                {address.isDefault ? (
                  <AppGradient colors={theme.colors.gradients.brandSoft} style={styles.iconWrap}>
                    <Icon size={20} color={theme.colors.palette.white} strokeWidth={2.2} />
                  </AppGradient>
                ) : (
                  <View style={[styles.iconWrap, styles.iconWrapIdle]}>
                    <Icon size={20} color={theme.colors.primary[600]} strokeWidth={2.2} />
                  </View>
                )}

                <View style={styles.text}>
                  <View style={styles.titleRow}>
                    <Text style={[theme.text.h4, styles.title]} numberOfLines={1}>
                      {address.customLabel ?? titleCase(address.label)}
                    </Text>
                    {address.isDefault ? (
                      <CircleCheck
                        size={18}
                        color={theme.colors.palette.white}
                        fill={theme.colors.primary[600]}
                        strokeWidth={2.4}
                      />
                    ) : null}
                  </View>
                  <Text style={[theme.text.bodySmall, styles.line]} numberOfLines={2}>
                    {[address.line1, address.line2, address.locality, address.city]
                      .filter(Boolean)
                      .join(', ')}{' '}
                    - {address.pincode}
                  </Text>
                  {address.receiverName ? (
                    <Text style={[theme.text.caption, styles.receiver]} numberOfLines={1}>
                      {address.receiverName}
                      {address.receiverPhone ? ` · ${address.receiverPhone}` : ''}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.actions}>
                  <Pressable
                    onPress={() => navigation.navigate('AddressForm', { addressId: address.id })}
                    accessibilityRole="button"
                    accessibilityLabel="Edit address"
                    hitSlop={6}
                    style={styles.actionButton}
                  >
                    <PencilIcon size={16} color={theme.colors.text.secondary} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(address)}
                    accessibilityRole="button"
                    accessibilityLabel="Delete address"
                    hitSlop={6}
                    style={styles.actionButton}
                  >
                    <TrashIcon size={16} color={theme.colors.state.error} />
                  </Pressable>
                </View>
              </PressableScale>
              </Animated.View>
            );
          })}

          <PressableScale
            onPress={() => navigation.navigate('AddressForm')}
            scaleTo={0.98}
            haptic={false}
            accessibilityRole="button"
            accessibilityLabel="Add new address"
            style={styles.addTile}
          >
            <Plus size={18} color={theme.colors.primary[600]} strokeWidth={2.6} />
            <Text style={[theme.text.label, styles.addText]}>Add new address</Text>
          </PressableScale>
        </ScrollView>
      )}
    </View>
  );
};

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default Addresses;

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
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.surface.raised,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...theme.elevation.sm,
  },
  cardDefault: {
    borderColor: theme.colors.primary[600],
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapIdle: {
    backgroundColor: theme.colors.surface.brandWash,
  },
  text: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    flexShrink: 1,
  },
  line: {
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  receiver: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  actions: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.page,
  },
  addTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    height: 56,
    marginTop: theme.spacing.xs,
    borderRadius: theme.radius.xxl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.surface.brandWash,
  },
  addText: {
    color: theme.colors.text.brand,
  },
});
