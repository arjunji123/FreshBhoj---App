import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';
import { Eye, Flame, Play } from 'lucide-react-native';
import HomeSectionHeader from './HomeSectionHeader';
import { Skeleton } from '@components/ui';
import PressableScale from '@animations/PressableScale';
import { enterRise } from '@animations/motion';
import { theme as staticTheme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import type { Reel } from '@api/types';
import { HOME_COPY } from '../home.constants';
import { useTheme } from "@app/theme/useTheme";

interface ReelsRailProps {
  reels: Reel[];
  isLoading?: boolean;
  onPressReel: (reel: Reel) => void;
  /** One-tap order: opens the reel's dish. Only shown when the reel has a meal. */
  onOrderReel?: (reel: Reel) => void;
  onSeeAll?: () => void;
}

const CARD_WIDTH = 166;
const CARD_HEIGHT = 295; // ~9:16
const CARD_GAP = staticTheme.spacing.md;

/** Text over photography must stay white in both themes (theme inverse flips in dark mode). */
const ON_PHOTO = staticTheme.colors.palette.white;

/**
 * "Watch & Order" — the reels hook, placed right under the stories. Tall
 * 9:16 cards snap one at a time; tapping a card opens the full-screen player
 * at that reel, the Order pill jumps straight to the dish.
 */
const ReelsRail: React.FC<ReelsRailProps> = ({
  reels,
  isLoading,
  onPressReel,
  onOrderReel,
  onSeeAll,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (isLoading && !reels.length) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title={HOME_COPY.reelsTitle} subtitle={HOME_COPY.reelsSubtitle} />
        <View style={styles.scroll}>
          {[0, 1].map((i) => (
            <Skeleton key={i} width={CARD_WIDTH} height={CARD_HEIGHT} radius={theme.radius.xxl} />
          ))}
        </View>
      </View>
    );
  }

  if (!reels.length) return null;

  return (
    <View style={styles.container}>
      <HomeSectionHeader
        title={HOME_COPY.reelsTitle}
        subtitle={HOME_COPY.reelsSubtitle}
        onSeeAll={onSeeAll}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
      >
        {reels.map((reel, index) => (
          <Animated.View key={reel.id} entering={enterRise(index)}>
            <PressableScale
              onPress={() => onPressReel(reel)}
              scaleTo={0.96}
              haptic={false}
              accessibilityRole="button"
              accessibilityLabel={reel.caption ?? `Reel from ${reel.kitchen.name}`}
              style={styles.card}
            >
              {reel.thumbnailUrl ? (
                <Image
                  source={{ uri: reel.thumbnailUrl }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
              ) : (
                <View style={[StyleSheet.absoluteFillObject, styles.fallback]} />
              )}

              <LinearGradient
                colors={theme.colors.overlay.imageFade}
                locations={[0.35, 1]}
                style={StyleSheet.absoluteFillObject}
              />

              <View style={styles.viewsPill}>
                <Eye size={11} color={ON_PHOTO} strokeWidth={2.4} />
                <Text style={styles.viewsText}>{reel.stats.viewsLabel}</Text>
              </View>

              <View style={styles.playButton}>
                <Play size={18} color={ON_PHOTO} fill={ON_PHOTO} strokeWidth={0} />
              </View>

              <View style={styles.footer}>
                <Text style={styles.kitchenName} numberOfLines={1}>
                  {reel.kitchen.name}
                </Text>
                {reel.meal ? (
                  <>
                    <Text style={styles.mealName} numberOfLines={1}>
                      {reel.meal.name}
                    </Text>
                    {reel.meal.calories ? (
                      <View style={styles.kcalRow}>
                        <Flame size={10} color={ON_PHOTO} strokeWidth={2.4} />
                        <Text style={styles.kcalText}>
                          {Math.round(reel.meal.calories)} kcal
                          {reel.meal.proteinG ? ` · ${Math.round(reel.meal.proteinG)}g protein` : ''}
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.orderRow}>
                      <Text style={styles.price}>{formatCurrency(reel.meal.price)}</Text>
                      {onOrderReel && reel.meal.isAvailable ? (
                        <PressableScale
                          onPress={() => onOrderReel(reel)}
                          scaleTo={0.9}
                          accessibilityRole="button"
                          accessibilityLabel={`Order ${reel.meal.name}`}
                          style={styles.orderButton}
                        >
                          <Text style={styles.orderText}>Order</Text>
                        </PressableScale>
                      ) : null}
                    </View>
                  </>
                ) : null}
              </View>
            </PressableScale>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ReelsRail;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    marginTop: theme.spacing.xl,
  },
  scroll: {
    flexDirection: 'row',
    paddingHorizontal: theme.layout.screenPadding,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: theme.radius.xxl,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[200],
    ...theme.elevation.md,
  },
  fallback: {
    backgroundColor: theme.colors.primary[800],
  },
  viewsPill: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
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
  viewsText: {
    ...theme.text.caption,
    fontSize: 10,
    lineHeight: 13,
    color: ON_PHOTO,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.overlay.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.overlay.glassStrong,
    paddingLeft: 2,
  },
  footer: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: theme.spacing.md,
  },
  kitchenName: {
    ...theme.text.caption,
    color: ON_PHOTO,
    opacity: 0.85,
  },
  mealName: {
    ...theme.text.h4,
    color: ON_PHOTO,
    marginTop: 2,
  },
  kcalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  kcalText: {
    ...theme.text.caption,
    fontSize: 10,
    lineHeight: 13,
    color: ON_PHOTO,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  price: {
    ...theme.text.numeric,
    color: ON_PHOTO,
  },
  orderButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.base,
  },
  orderText: {
    ...theme.text.label,
    color: theme.colors.text.brand,
  },
});
