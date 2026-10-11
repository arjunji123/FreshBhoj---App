import React, { useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppBar, Chip, ChipRow, Screen } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import Subscriptions from '@features/subscriptions/screens/Subscriptions';
import OrderHistory from './OrderHistory';
import { useTheme } from "@app/theme/useTheme";

type Tab = 'orders' | 'subscriptions';

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'orders', label: 'One-time Orders' },
  { key: 'subscriptions', label: 'Subscriptions' },
];

/**
 * What the "Orders" stack screen renders (reached from Home, Profile and Support; no longer a tab). Adds an in-screen segmented
 * toggle above either the existing `OrderHistory` (untouched) or the new
 * Subscriptions hub — same local-`useState` + `ChipRow`/`Chip selected`
 * pattern as `KitchenProfile`'s own in-screen tabs.
 *
 * `OrderHistory` renders its `Screen` with no safe-area edges for the same reason.
 */
const OrdersAndSubscriptions = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const [tab, setTab] = useState<Tab>('orders');

  // `AppBar` owns the top safe-area inset, so this shell (and the nested
  // `OrderHistory`) take no top edge of their own.
  return (
    <Screen background="base" edges={[]}>
      <AppBar title="Orders" onBack={() => navigation.goBack()} />
      <View style={styles.toggleWrap}>
        <ChipRow>
          {TABS.map((item) => (
            <Chip key={item.key} label={item.label} selected={tab === item.key} onPress={() => setTab(item.key)} />
          ))}
        </ChipRow>
      </View>

      <View style={styles.body}>{tab === 'orders' ? <OrderHistory /> : <Subscriptions />}</View>
    </Screen>
  );
};

export default OrdersAndSubscriptions;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  toggleWrap: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borders.subtle,
  },
  body: {
    flex: 1,
  },
});
