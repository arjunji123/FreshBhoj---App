import React, { useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, ChipRow, Screen } from '@components/ui';
import Subscriptions from '@features/subscriptions/screens/Subscriptions';
import OrderHistory from './OrderHistory';
import { useTheme } from "@app/theme/useTheme";

type Tab = 'orders' | 'subscriptions';

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'orders', label: 'One-time Orders' },
  { key: 'subscriptions', label: 'Subscriptions' },
];

/**
 * What the "Orders" tab actually renders now. Adds an in-screen segmented
 * toggle above either the existing `OrderHistory` (untouched) or the new
 * Subscriptions hub — same local-`useState` + `ChipRow`/`Chip selected`
 * pattern as `KitchenProfile`'s own in-screen tabs. The tab bar icon/label
 * both stay "Orders"; nothing about the bottom nav itself changes.
 *
 * `Screen`'s `SafeAreaView` only pads edges it actually overlaps, so nesting
 * `OrderHistory`/`Subscriptions` (each with their own top-edge `Screen`)
 * below this one doesn't double the top inset.
 */
const OrdersAndSubscriptions = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const [tab, setTab] = useState<Tab>('orders');

  return (
    <Screen background="base">
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
