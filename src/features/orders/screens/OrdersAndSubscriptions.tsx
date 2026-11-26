import React, { useState, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, ReceiptText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AppBar, Screen, Text } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import Subscriptions from '@features/subscriptions/screens/Subscriptions';
import OrderHistory from './OrderHistory';
import { useTheme } from "@app/theme/useTheme";

type Tab = 'orders' | 'subscriptions';

const TABS = [
  { key: 'orders' as Tab, label: 'My Orders', Icon: ReceiptText },
  { key: 'subscriptions' as Tab, label: 'Meal Plans', Icon: CalendarDays },
];

/**
 * What the "Orders" stack screen renders (the receipt tab, Home, Profile and
 * Support all open it). A two-tab bar pinned to the bottom switches between
 * `OrderHistory` and the meal-plan (subscriptions) hub.
 *
 * `OrderHistory` renders its `Screen` with no safe-area edges for the same reason.
 */
const OrdersAndSubscriptions = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const [tab, setTab] = useState<Tab>('orders');
  const { bottom } = useSafeAreaInsets();

  // `AppBar` owns the top safe-area inset, so this shell (and the nested
  // `OrderHistory`) take no top edge of their own.
  return (
    <Screen background="base" edges={[]}>
      <AppBar title={tab === 'orders' ? 'My Orders' : 'Meal Plans'} onBack={() => navigation.goBack()} />

      <View style={styles.body}>{tab === 'orders' ? <OrderHistory /> : <Subscriptions />}</View>

      <View style={[styles.tabBar, { paddingBottom: bottom }]} accessibilityRole="tablist">
        {TABS.map(({ key, label, Icon }) => {
          const selected = tab === key;
          const color = selected ? theme.colors.text.brand : theme.colors.text.tertiary;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={label}
            >
              <View style={[styles.indicator, selected ? styles.indicatorActive : null]} />
              <Icon size={22} color={color} strokeWidth={selected ? 2.5 : 2} />
              <Text style={[theme.text.label, { color }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
};

export default OrdersAndSubscriptions;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  body: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.raised,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
    ...theme.elevation.lg,
  },
  tab: {
    flex: 1,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 48,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  indicatorActive: {
    backgroundColor: theme.colors.primary[600],
  },
});
