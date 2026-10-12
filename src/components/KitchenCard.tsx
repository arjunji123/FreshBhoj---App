import React, { useMemo } from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Clock, MapPin } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { theme as staticTheme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import type { KitchenCard as KitchenCardType } from '@api/types';
import { VerifiedBadge } from './ui/Badge';
import { RatingPill } from './ui/Rating';
import { useTheme } from "@app/theme/useTheme";

interface KitchenCardProps {
  kitchen: KitchenCardType;
  onPress?: () => void;
  /** `rail` is the horizontal Home carousel; `full` is a full-width list row. */
  layout?: 'rail' | 'full';
  style?: StyleProp<ViewStyle>;
}

/**
 * Curated-kitchen card. The Verified badge is deliberately the loudest thing
 * after the name — it is the trust signal the whole product is built on.
 */
/** Text over photography stays white in both themes. */
const ON_PHOTO = staticTheme.colors.palette.white;

const KitchenCard: React.FC<KitchenCardProps> = ({
  kitchen,
  onPress,
  layout = 'rail',
  style,
}) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const isRail = layout === 'rail';
  const image = kitchen.signatureDish?.image ?? kitchen.coverImage;

  return (
    <PressableScale
      onPress={onPress}
      haptic={false}
      scaleTo={0.975}
      accessibilityRole="button"
      accessibilityLabel={kitchen.name}
      style={[styles.card, isRail ? styles.cardRail : styles.cardFull, style]}
    >
      <View style={[styles.imageWrap, isRail ? styles.imageRail : styles.imageFull]}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imageFallback]} />
        )}

        {/* Bottom fade so the signature-dish caption stays legible on any photo. */}
        <LinearGradient
          colors={theme.colors.overlay.imageFade}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.topPills}>
          <RatingPill value={kitchen.rating} count={kitchen.ratingCount} variant="solid" />
          <View style={styles.timePill}>
            <Clock size={11} color={ON_PHOTO} strokeWidth={2.4} />
            <Text style={styles.timeText}>{kitchen.prepTimeMins} min</Text>
          </View>
        </View>

        {!kitchen.isOpenNow ? (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Closed · opens {kitchen.openingHours.opensAt}</Text>
          </View>
        ) : null}

        {kitchen.signatureDish ? (
          <View style={styles.dishStrip}>
            <Text style={[theme.text.caption, styles.dishLabel]}>SIGNATURE</Text>
            <View style={styles.dishRow}>
              <Text style={[theme.text.label, styles.dishName]} numberOfLines={1}>
                {kitchen.signatureDish.name}
              </Text>
              <Text style={[theme.text.label, styles.dishPrice]}>
                {formatCurrency(kitchen.signatureDish.price)}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={[theme.text.h4, styles.name]} numberOfLines={1}>
            {kitchen.name}
          </Text>
          {kitchen.isVerified ? <VerifiedBadge /> : null}
        </View>

        {kitchen.tagline ? (
          <Text style={[theme.text.bodySmall, styles.tagline]} numberOfLines={1}>
            {kitchen.tagline}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          {kitchen.locality ? (
            <View style={styles.metaItem}>
              <MapPin size={12} color={theme.colors.text.tertiary} strokeWidth={2.2} />
              <Text style={[theme.text.caption, styles.metaText]} numberOfLines={1}>
                {kitchen.locality}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
};

export default KitchenCard;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface.raised,
    borderRadius: theme.radius.xxl,
    overflow: 'hidden',
    ...theme.elevation.md,
  },
  cardRail: {
    width: 248,
  },
  cardFull: {
    width: '100%',
  },
  topPills: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.overlay.scrimSoft,
    borderWidth: 1,
    borderColor: theme.colors.overlay.glass,
  },
  timeText: {
    ...theme.text.caption,
    fontSize: 10,
    lineHeight: 13,
    color: ON_PHOTO,
  },
  imageWrap: {
    width: '100%',
    backgroundColor: theme.colors.neutral[100],
  },
  imageRail: { height: 150 },
  imageFull: { height: 168 },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    backgroundColor: theme.colors.neutral[200],
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: {
    ...theme.text.label,
    color: ON_PHOTO,
  },
  dishStrip: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: theme.spacing.md,
  },
  dishLabel: {
    color: ON_PHOTO,
    opacity: 0.8,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  dishName: {
    flex: 1,
    color: ON_PHOTO,
  },
  dishPrice: {
    color: ON_PHOTO,
  },
  body: {
    padding: theme.spacing.md,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  name: {
    flex: 1,
    color: theme.colors.text.primary,
  },
  tagline: {
    color: theme.colors.text.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    color: theme.colors.text.tertiary,
  },
});
