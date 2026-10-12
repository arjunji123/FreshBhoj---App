import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { CalendarCheck } from 'lucide-react-native';
import { ActiveOrder } from '../active-orders.types';
import { useTheme } from "@app/theme/useTheme";
import { useThemeStore } from '@app/theme/themeStore';

interface ActiveTiffinCardProps {
  order: ActiveOrder;
  onViewSchedule?: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  delivering_today: { bg: '#D1FAE5', text: '#065F46' },
  preparing: { bg: '#FEF3C7', text: '#92400E' },
  scheduled: { bg: '#DBEAFE', text: '#1E40AF' },
  paused: { bg: '#F3F4F6', text: '#6B7280' },
};

const STATUS_COLORS_DARK: Record<string, { bg: string; text: string }> = {
  delivering_today: { bg: 'rgba(15, 157, 107, 0.18)', text: '#6EE7B7' },
  preparing: { bg: 'rgba(255, 194, 26, 0.16)', text: '#FFD866' },
  scheduled: { bg: 'rgba(30, 123, 216, 0.2)', text: '#6FB6FF' },
  paused: { bg: 'rgba(255, 255, 255, 0.08)', text: '#9DB2B5' },
};

const ActiveTiffinCard: React.FC<ActiveTiffinCardProps> = ({
  order,
  onViewSchedule,
}) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const isDark = useThemeStore((s) => s.resolvedScheme) === 'dark';
  const statusMap = isDark ? STATUS_COLORS_DARK : STATUS_COLORS;
  const statusColor = statusMap[order.status] ?? statusMap.scheduled;

  return (
    <View style={styles.card}>
      {/* Decorative circle */}
      <View style={styles.decorCircle} />

      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={styles.iconBox}>
            <CalendarCheck
              size={22}
              color={theme.colors.text.brand}
              strokeWidth={1.8}
            />
          </View>
          <Text style={styles.title}>{order.title}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusText, { color: statusColor.text }]}>
            {order.statusLabel}
          </Text>
        </View>
      </View>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.deliveryTime}>
            Next Delivery: {order.nextDeliveryTime}
          </Text>
          <Text style={styles.kitchenName}>{order.kitchenName}</Text>
        </View>
        <TouchableOpacity
          style={styles.scheduleButton}
          activeOpacity={0.7}
          onPress={onViewSchedule}
        >
          <Text style={styles.scheduleButtonText}>View Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ActiveTiffinCard;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    marginHorizontal: 20,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.spacing.borderRadius.xl,
    padding: 18,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(8, 127, 120, 0.1)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: theme.spacing.borderRadius.lg,
    backgroundColor: theme.colors.brand.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: theme.colors.text.primary,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.spacing.borderRadius.round,
  },
  statusText: {
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    letterSpacing: 0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  deliveryTime: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  kitchenName: {
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: theme.colors.text.primary,
  },
  scheduleButton: {
    borderWidth: 1.2,
    borderColor: theme.colors.borders.default,
    borderRadius: theme.spacing.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface.raised,
  },
  scheduleButtonText: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: theme.colors.text.brand,
  },
});
