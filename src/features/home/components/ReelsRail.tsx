import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Eye, Play } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import SectionHeader from '@components/SectionHeader';
import type { Reel } from '@api/types';
import { HOME_COPY } from '../home.constants';

interface ReelsRailProps {
  reels: Reel[];
  onPressReel: (reel: Reel) => void;
  onSeeAll?: () => void;
}

/**
 * "Behind the scenes" rail — the ordering app's hook into the reels feed.
 * Tapping a card opens the full-screen vertical player at that reel.
 */
const ReelsRail: React.FC<ReelsRailProps> = ({ reels, onPressReel, onSeeAll }) => {
  if (!reels.length) return null;

  return (
    <View style={styles.container}>
      <SectionHeader
        title={HOME_COPY.reelsTitle}
        actionLabel="See all"
        onActionPress={onSeeAll}
      />
      <Text style={[theme.text.bodySmall, styles.subtitle]}>{HOME_COPY.reelsSubtitle}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {reels.map((reel) => (
          <Pressable
            key={reel.id}
            onPress={() => onPressReel(reel)}
            accessibilityRole="button"
            accessibilityLabel={reel.caption ?? `Reel from ${reel.kitchen.name}`}
            style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
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
              style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.viewsPill}>
              <Eye size={11} color={theme.colors.text.inverse} strokeWidth={2.4} />
              <Text style={styles.viewsText}>{reel.stats.viewsLabel}</Text>
            </View>

            <View style={styles.playButton}>
              <Play
                size={16}
                color={theme.colors.text.inverse}
                fill={theme.colors.text.inverse}
                strokeWidth={0}
              />
            </View>

            <View style={styles.footer}>
              <Text style={[theme.text.label, styles.kitchenName]} numberOfLines={1}>
                {reel.kitchen.name}
              </Text>
              {reel.meal ? (
                <Text style={[theme.text.caption, styles.mealName]} numberOfLines={1}>
                  {reel.meal.name} · ₹{reel.meal.price}
                </Text>
              ) : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default ReelsRail;

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xl,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.layout.screenPadding,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  scroll: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  card: {
    width: 148,
    height: 214,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.neutral[200],
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  fallback: {
    backgroundColor: theme.colors.neutral[300],
  },
  viewsPill: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  viewsText: {
    ...theme.text.caption,
    fontSize: 9,
    lineHeight: 12,
    color: theme.colors.text.inverse,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  footer: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: theme.spacing.md,
  },
  kitchenName: {
    color: theme.colors.text.inverse,
  },
  mealName: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
