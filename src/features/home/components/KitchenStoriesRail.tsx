import React, { useMemo } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Play } from 'lucide-react-native';
import AppGradient from '@components/AppGradient';
import LinearGradient from 'react-native-linear-gradient';
import PressableScale from '@animations/PressableScale';
import { theme as staticTheme } from '@app/theme/index';
import HomeSectionHeader from './HomeSectionHeader';
import { Skeleton, VerifiedBadge } from '@components/ui';
import type { KitchenStoryGroup } from '@api/types';
import { useTheme } from "@app/theme/useTheme";

interface KitchenStoriesRailProps {
  groups: KitchenStoryGroup[];
  onPressGroup: (group: KitchenStoryGroup) => void;
  isLoading?: boolean;
}

/**
 * Kitchen Stories rail — scoped server-side to the customer's own city (see
 * `useKitchenStories`), so this component only ever renders what the backend
 * already decided is local. One card per kitchen; a red ring means that
 * kitchen has something the customer hasn't seen yet.
 */
const KitchenStoriesRail: React.FC<KitchenStoriesRailProps> = ({ groups, onPressGroup, isLoading }) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  if (isLoading) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title="Kitchen Stories" />
        <View style={[styles.scrollContent, styles.skeletonRow]}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} width={CARD_WIDTH} height={CARD_HEIGHT} radius={theme.radius.xl} />
          ))}
        </View>
      </View>
    );
  }

  // The header lives here, not in the parent, so an empty city (no stories
  // yet) never shows a floating "Kitchen Stories" title above nothing.
  if (!groups.length) return null;

  return (
    <View style={styles.container}>
      <HomeSectionHeader title="Kitchen Stories" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
      {groups.map((group) => {
        const firstItem = group.items[0];
        const isVideo = firstItem?.mediaType === 'VIDEO';

        const card = (
          <ImageBackground
            source={group.coverImage ? { uri: group.coverImage } : undefined}
            style={[styles.storyCard, !group.coverImage ? styles.storyCardFallback : null]}
            imageStyle={styles.storyImage}
          >
            <LinearGradient
              colors={theme.colors.overlay.imageFade}
              locations={[0.45, 1]}
              style={StyleSheet.absoluteFillObject}
            />
            {isVideo ? (
              <View style={styles.playButton}>
                <Play
                  size={18}
                  color={ON_PHOTO}
                  fill={ON_PHOTO}
                />
              </View>
            ) : null}

            <View style={styles.footer}>
              <View style={styles.nameRow}>
                <Text style={styles.storyName} numberOfLines={1}>
                  {group.kitchen.name}
                </Text>
                {group.kitchen.isVerified ? <VerifiedBadge showLabel={false} size={13} /> : null}
              </View>
              {group.storyCount > 1 ? (
                <Text style={styles.storyCount}>{group.storyCount} updates</Text>
              ) : null}
            </View>
          </ImageBackground>
        );

        return (
          <PressableScale
            key={group.kitchen.id}
            onPress={() => onPressGroup(group)}
            scaleTo={0.97}
            haptic={false}
            accessibilityRole="button"
            accessibilityLabel={`${group.kitchen.name} stories`}
          >
            {group.hasUnseen ? (
              <AppGradient
                colors={theme.colors.gradients.brand}
                locations={theme.colors.gradients.brandLocations}
                direction="diagonal"
                style={styles.unseenRing}
              >
                {card}
              </AppGradient>
            ) : (
              <View style={styles.seenRing}>{card}</View>
            )}
          </PressableScale>
        );
      })}
      </ScrollView>
    </View>
  );
};

export default KitchenStoriesRail;

/** Text over photography stays white in both themes. */
const ON_PHOTO = staticTheme.colors.palette.white;

const CARD_WIDTH = 124;
const CARD_HEIGHT = 176;
const RING_PADDING = 2.5;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    marginTop: theme.spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
  },
  unseenRing: {
    ...theme.elevation.sm,
    padding: RING_PADDING,
    borderRadius: theme.radius.xl + RING_PADDING,
  },
  seenRing: {
    padding: RING_PADDING,
    borderRadius: theme.radius.xl + RING_PADDING,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
  },
  storyCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.neutral[200],
  },
  storyCardFallback: {
    backgroundColor: theme.colors.neutral[200],
  },
  storyImage: {
    borderRadius: theme.radius.xl,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: theme.spacing.sm,
    backgroundColor: theme.colors.overlay.scrimSoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.overlay.glassStrong,
  },
  footer: {
    padding: theme.spacing.sm,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storyName: {
    ...theme.text.bodyMedium,
    color: ON_PHOTO,
    flexShrink: 1,
  },
  storyCount: {
    ...theme.text.caption,
    color: ON_PHOTO,
    opacity: 0.85,
  },
});
