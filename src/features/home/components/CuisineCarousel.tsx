import React, { useMemo } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Check } from 'lucide-react-native';
import { Skeleton } from '@components/ui';
import PressableScale from '@animations/PressableScale';
import { theme as staticTheme } from '@app/theme/index';
import type { Cuisine } from '@api/types';
import { useTheme } from '@app/theme/useTheme';
import HomeSectionHeader from './HomeSectionHeader';

const CARD_WIDTH = 112;
const CARD_HEIGHT = 140;
const GAP = staticTheme.spacing.md;

/** Text over photography stays white in both themes. */
const ON_PHOTO = staticTheme.colors.palette.white;

interface CuisineCarouselProps {
  cuisines: Cuisine[];
  onSelect: (cuisine: Cuisine) => void;
  /** Currently applied cuisine filter, if any. */
  selectedSlug?: string;
  isLoading?: boolean;
}

/** Image-first cuisine cards with a bottom scrim. Tapping toggles the feed filter. */
const CuisineCarousel: React.FC<CuisineCarouselProps> = ({
  cuisines,
  onSelect,
  selectedSlug,
  isLoading,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <HomeSectionHeader title="Explore cuisines" />
        <View style={styles.skeletonRow}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} width={CARD_WIDTH} height={CARD_HEIGHT} radius={theme.radius.xxl} />
          ))}
        </View>
      </View>
    );
  }

  if (!cuisines.length) return null;

  return (
    <View style={styles.container}>
      <HomeSectionHeader
        title="Explore cuisines"
        subtitle={selectedSlug ? 'Filtering the feed below' : 'Tap one to filter the feed'}
      />
      <FlatList
        data={cuisines}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => {
          const isSelected = item.slug === selectedSlug;
          return (
            <PressableScale
              onPress={() => onSelect(item)}
              scaleTo={0.96}
              haptic={false}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={item.name}
              style={[styles.card, isSelected ? styles.cardSelected : null]}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFillObject, styles.fallback]} />
              )}
              <LinearGradient
                colors={theme.colors.overlay.imageFade}
                locations={[0.4, 1]}
                style={StyleSheet.absoluteFillObject}
              />
              {isSelected ? (
                <View style={styles.check}>
                  <Check size={12} color={ON_PHOTO} strokeWidth={3} />
                </View>
              ) : null}
              <Text style={[theme.text.label, styles.name]} numberOfLines={2}>
                {item.name}
              </Text>
            </PressableScale>
          );
        }}
      />
    </View>
  );
};

const Separator = () => <View style={separatorStyle.gap} />;
const separatorStyle = StyleSheet.create({ gap: { width: GAP } });

export default CuisineCarousel;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing.xl,
    },
    skeletonRow: {
      flexDirection: 'row',
      gap: GAP,
      paddingHorizontal: theme.layout.screenPadding,
    },
    list: {
      paddingHorizontal: theme.layout.screenPadding,
      paddingBottom: theme.spacing.sm,
    },
    card: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      borderRadius: theme.radius.xxl,
      overflow: 'hidden',
      justifyContent: 'flex-end',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.neutral[200],
      borderWidth: 2,
      borderColor: 'transparent',
      ...theme.elevation.sm,
    },
    cardSelected: {
      borderColor: theme.colors.primary[500],
    },
    fallback: {
      backgroundColor: theme.colors.primary[800],
    },
    check: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary[600],
    },
    name: {
      color: ON_PHOTO,
    },
  });
