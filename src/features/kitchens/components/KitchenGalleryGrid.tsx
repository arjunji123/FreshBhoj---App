import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Play } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import type { KitchenMedia } from '@api/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GUTTER = theme.layout.screenPadding;
const GAP = theme.spacing.sm;
const TILE = (SCREEN_WIDTH - GUTTER * 2 - GAP * 2) / 3;

interface KitchenGalleryGridProps {
  media: KitchenMedia[];
  onPressItem: (index: number) => void;
}

/**
 * Phase-1 gallery: a plain 3-across grid of "fresh made today" photos and short
 * clips. Deliberately not a feed — no follow, no comments — until there is
 * enough real content to justify one.
 */
const KitchenGalleryGrid: React.FC<KitchenGalleryGridProps> = ({ media, onPressItem }) => {
  if (!media.length) return null;

  return (
    <View style={styles.grid}>
      {media.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => onPressItem(index)}
          accessibilityRole="imagebutton"
          accessibilityLabel={item.caption ?? 'Kitchen photo'}
          style={({ pressed }) => [styles.tile, pressed ? styles.pressed : null]}
        >
          <Image
            source={{ uri: item.thumbnailUrl ?? item.url }}
            style={styles.image}
            resizeMode="cover"
          />

          {item.type === 'VIDEO' ? (
            <View style={styles.playBadge}>
              <Play
                size={12}
                color={theme.colors.text.inverse}
                fill={theme.colors.text.inverse}
                strokeWidth={0}
              />
            </View>
          ) : null}

          {item.caption ? (
            <View style={styles.captionOverlay}>
              <Text style={styles.caption} numberOfLines={2}>
                {item.caption}
              </Text>
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
};

export default KitchenGalleryGrid;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingHorizontal: GUTTER,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.neutral[100],
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 6,
    paddingVertical: 5,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  caption: {
    ...theme.text.caption,
    fontSize: 9,
    lineHeight: 12,
    color: theme.colors.text.inverse,
  },
});
