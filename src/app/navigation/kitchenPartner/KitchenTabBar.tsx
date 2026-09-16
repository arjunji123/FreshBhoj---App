import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LayoutGrid, ClipboardList, UtensilsCrossed, Camera, UserCircle } from 'lucide-react-native';
import { theme } from '@app/theme/index';

const ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  KitchenDashboard: LayoutGrid,
  KitchenOrders: ClipboardList,
  KitchenMenu: UtensilsCrossed,
  KitchenStories: Camera,
  KitchenProfile: UserCircle,
};

const LABELS: Record<string, string> = {
  KitchenDashboard: 'Dashboard',
  KitchenOrders: 'Orders',
  KitchenMenu: 'Menu',
  KitchenStories: 'Stories',
  KitchenProfile: 'Profile',
};

export default function KitchenTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, theme.spacing.paddings.sm) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const Icon = ICONS[route.name] ?? LayoutGrid;
        const color = isFocused ? theme.colors.brand.primary : theme.colors.text.tertiary;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <Icon size={20} color={color} />
            <Text style={[styles.label, { color }]}>{LABELS[route.name] ?? route.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
    paddingTop: theme.spacing.paddings.xs,
    paddingBottom: theme.spacing.paddings.sm,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  label: { ...theme.text.caption, fontSize: 10 },
});
