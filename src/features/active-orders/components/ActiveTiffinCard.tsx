import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarCheck } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { ActiveOrder } from '../active-orders.types';

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

const ActiveTiffinCard: React.FC<ActiveTiffinCardProps> = ({
  order,
  onViewSchedule,
}) => {
  const statusColor = STATUS_COLORS[order.status] ?? STATUS_COLORS.scheduled;

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
              color={theme.colors.gradient2}
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

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    backgroundColor: '#FFF9F5',
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
    backgroundColor: 'rgba(251, 191, 146, 0.2)',
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
    backgroundColor: '#FDEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: theme.colors.palette.black,
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
    color: theme.colors.palette.gray1,
    marginBottom: 2,
  },
  kitchenName: {
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: theme.colors.palette.black,
  },
  scheduleButton: {
    borderWidth: 1.2,
    borderColor: theme.colors.palette.gray3,
    borderRadius: theme.spacing.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.palette.white,
  },
  scheduleButtonText: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: theme.colors.gradient2,
  },
});
