import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChefHat, ChevronRight, Clock } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';
import type { OrderDetail } from '@api/types';

interface ActiveOrderStripProps {
  order: OrderDetail;
  onPress: () => void;
}

/**
 * Persistent reminder that food is on its way. Sits high on Home because
 * "where's my order?" is the single most common reason someone reopens the app.
 */
const ActiveOrderStrip: React.FC<ActiveOrderStripProps> = ({ order, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Track order ${order.orderNumber}`}
    style={({ pressed }) => [styles.wrapper, pressed ? styles.pressed : null]}
  >
    <AppGradient
      colors={theme.colors.gradients.brand}
      locations={theme.colors.gradients.brandLocations}
      direction="diagonal"
      style={styles.card}
    >
      <View style={styles.iconWrap}>
        <ChefHat size={20} color={theme.colors.text.inverse} strokeWidth={2.2} />
      </View>

      <View style={styles.content}>
        <Text style={[theme.text.overline, styles.status]}>{order.statusLabel}</Text>
        <Text style={[theme.text.h4, styles.kitchen]} numberOfLines={1}>
          {order.kitchen.name}
        </Text>
        <View style={styles.etaRow}>
          <Clock size={12} color="rgba(255,255,255,0.85)" strokeWidth={2.4} />
          <Text style={[theme.text.caption, styles.eta]}>
            Arriving in {order.eta.rangeLabel}
          </Text>
        </View>
      </View>

      <ChevronRight size={20} color={theme.colors.text.inverse} strokeWidth={2.4} />
    </AppGradient>
  </Pressable>
);

export default ActiveOrderStrip;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: theme.spacing.lg,
    marginHorizontal: theme.layout.screenPadding,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    ...theme.elevation.primary,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.overlay.glassStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  status: {
    color: 'rgba(255,255,255,0.8)',
  },
  kitchen: {
    color: theme.colors.text.inverse,
    marginTop: 2,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eta: {
    color: 'rgba(255,255,255,0.85)',
  },
});
