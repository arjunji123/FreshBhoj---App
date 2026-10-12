import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChefHat, ChevronRight, Clock } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { theme as staticTheme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';
import type { OrderDetail } from '@api/types';
import { useTheme } from "@app/theme/useTheme";

interface ActiveOrderStripProps {
  order: OrderDetail;
  onPress: () => void;
}

/**
 * Persistent reminder that food is on its way. Sits high on Home because
 * "where's my order?" is the single most common reason someone reopens the app.
 */
/** Strip sits on the brand gradient in both themes, so its foreground is always white. */
const ON_BRAND = staticTheme.colors.palette.white;

const ActiveOrderStrip: React.FC<ActiveOrderStripProps> = ({ order, onPress }) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  return (
(
  <PressableScale
    onPress={onPress}
    scaleTo={0.98}
    haptic={false}
    accessibilityRole="button"
    accessibilityLabel={`Track order ${order.orderNumber}`}
    style={styles.wrapper}
  >
    <AppGradient
      colors={theme.colors.gradients.brand}
      locations={theme.colors.gradients.brandLocations}
      direction="diagonal"
      style={styles.card}
    >
      <View style={styles.iconWrap}>
        <ChefHat size={20} color={ON_BRAND} strokeWidth={2.2} />
      </View>

      <View style={styles.content}>
        <Text style={[theme.text.overline, styles.status]}>{order.statusLabel}</Text>
        <Text style={[theme.text.h4, styles.kitchen]} numberOfLines={1}>
          {order.kitchen.name}
        </Text>
        <View style={styles.etaRow}>
          <Clock size={12} color={ON_BRAND} strokeWidth={2.4} />
          <Text style={[theme.text.caption, styles.eta]}>
            Arriving in {order.eta.rangeLabel}
          </Text>
        </View>
      </View>

      <ChevronRight size={20} color={ON_BRAND} strokeWidth={2.4} />
    </AppGradient>
  </PressableScale>
)
  );
};

export default ActiveOrderStrip;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  wrapper: {
    marginTop: theme.spacing.lg,
    marginHorizontal: theme.layout.screenPadding,
    borderRadius: theme.radius.xxl,
    overflow: 'hidden',
    ...theme.elevation.primary,
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
    color: ON_BRAND,
    opacity: 0.85,
  },
  kitchen: {
    color: ON_BRAND,
    marginTop: 2,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eta: {
    color: ON_BRAND,
    opacity: 0.9,
  },
});
