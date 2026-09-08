import React from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Play } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import type { KitchenMedia } from '@api/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GUTTER = theme.layout.screenPadding;
const REEL_GAP = theme.spacing.sm;
const REEL_TILE = (SCREEN_WIDTH - GUTTER * 2 - REEL_GAP * 3) / 4;
const POST_WIDTH = 140;

interface KitchenFoodFeedSectionProps {
  media: KitchenMedia[];
  /** Opens the full-screen viewer at this item's position in the original `media` array. */
  onPressItem: (index: number) => void;
}

/**
 * A kitchen's Food Feed tab: photo posts in one horizontally-scrolling row,
 * video reels below in their own 4-across grid — two different rhythms
 * because a wall of mixed thumbnails made it hard to tell which clips were
 * actually reels.
 */
const KitchenFoodFeedSection: React.FC<KitchenFoodFeedSectionProps> = ({ media, onPressItem }) => {
  if (!media.length) return null;

  const posts = media.filter((item) => item.type === 'IMAGE');
  const reels = media.filter((item) => item.type === 'VIDEO');
  const indexOf = (item: KitchenMedia) => media.findIndex((candidate) => candidate.id === item.id);

  return (
    <View style={styles.container}>
      {posts.length ? (
        <View style={styles.section}>
          <Text style={[theme.text.h4, styles.sectionTitle]}>Posts</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.postsRow}
          >
            {posts.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onPressItem(indexOf(item))}
                accessibilityRole="imagebutton"
                accessibilityLabel={item.caption ?? 'Kitchen photo'}
                style={({ pressed }) => [styles.postCard, pressed ? styles.pressed : null]}
              >
                <Image
                  source={{ uri: item.thumbnailUrl ?? item.url }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
                {item.caption ? (
                  <View style={styles.captionOverlay}>
                    <Text style={styles.caption} numberOfLines={2}>
                      {item.caption}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {reels.length ? (
        <View style={styles.section}>
          <Text style={[theme.text.h4, styles.sectionTitle]}>Reels</Text>
          <View style={styles.reelsGrid}>
            {reels.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onPressItem(indexOf(item))}
                accessibilityRole="imagebutton"
                accessibilityLabel={item.caption ?? 'Kitchen reel'}
                style={({ pressed }) => [styles.reelTile, pressed ? styles.pressed : null]}
              >
                <Image
                  source={{ uri: item.thumbnailUrl ?? item.url }}
                  style={styles.reelImage}
                  resizeMode="cover"
                />
                <View style={styles.playBadge}>
                  <Play size={11} color={theme.colors.text.inverse} fill={theme.colors.text.inverse} strokeWidth={0} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default KitchenFoodFeedSection;

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xl,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    paddingHorizontal: GUTTER,
  },
  postsRow: {
    paddingHorizontal: GUTTER,
    gap: theme.spacing.md,
  },
  postCard: {
    width: POST_WIDTH,
    height: POST_WIDTH * 1.25,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.neutral[100],
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  captionOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  caption: {
    ...theme.text.caption,
    fontSize: 10,
    lineHeight: 13,
    color: theme.colors.text.inverse,
  },
  reelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: REEL_GAP,
    paddingHorizontal: GUTTER,
  },
  reelTile: {
    width: REEL_TILE,
    height: REEL_TILE * 1.5,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.neutral[100],
  },
  reelImage: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
