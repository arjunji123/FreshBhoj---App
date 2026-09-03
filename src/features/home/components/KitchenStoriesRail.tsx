import React from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Play } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';
import SectionHeader from '@components/SectionHeader';
import { VerifiedBadge } from '@components/ui';
import type { KitchenStoryGroup } from '@api/types';

interface KitchenStoriesRailProps {
  groups: KitchenStoryGroup[];
  onPressGroup: (group: KitchenStoryGroup) => void;
}

/**
 * Kitchen Stories rail — scoped server-side to the customer's own city (see
 * `useKitchenStories`), so this component only ever renders what the backend
 * already decided is local. One card per kitchen; a red ring means that
 * kitchen has something the customer hasn't seen yet.
 */
const KitchenStoriesRail: React.FC<KitchenStoriesRailProps> = ({ groups, onPressGroup }) => {
  // The header lives here, not in the parent, so an empty city (no stories
  // yet) never shows a floating "Kitchen Stories" title above nothing.
  if (!groups.length) return null;

  return (
    <View style={styles.container}>
      <SectionHeader title="Kitchen Stories" />
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
            {isVideo ? (
              <View style={styles.playButton}>
                <Play
                  size={18}
                  color={theme.colors.text.inverse}
                  fill={theme.colors.text.inverse}
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
          <Pressable
            key={group.kitchen.id}
            onPress={() => onPressGroup(group)}
            accessibilityRole="button"
            accessibilityLabel={`${group.kitchen.name} stories`}
            style={({ pressed }) => [pressed ? styles.pressed : null]}
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
          </Pressable>
        );
      })}
      </ScrollView>
    </View>
  );
};

export default KitchenStoriesRail;

const CARD_WIDTH = 159;
const CARD_HEIGHT = 239;
const RING_PADDING = 3;

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  unseenRing: {
    padding: RING_PADDING,
    borderRadius: theme.radius.lg + RING_PADDING,
  },
  seenRing: {
    padding: RING_PADDING,
    borderRadius: theme.radius.lg + RING_PADDING,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
  },
  storyCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.neutral[200],
  },
  storyCardFallback: {
    backgroundColor: theme.colors.neutral[200],
  },
  storyImage: {
    borderRadius: theme.radius.lg,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
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
    color: theme.colors.text.inverse,
    flexShrink: 1,
  },
  storyCount: {
    ...theme.text.caption,
    color: 'rgba(255,255,255,0.8)',
  },
});
