import React, { useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BadgeCheck, Clock, Star } from 'lucide-react-native';
import type { KitchenCard } from '@api/types';
import { KitchenCardSkeleton } from '@components/ui';
import { useTheme } from '@app/theme/useTheme';

interface Props {
  kitchens: KitchenCard[];
  loading: boolean;
  onPressKitchen: (kitchen: KitchenCard) => void;
}

const CARD_WIDTH = 210;

/** Horizontal rail of kitchen results; renders skeletons while loading. */
const SearchKitchenRail: React.FC<Props> = ({ kitchens, loading, onPressKitchen }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <FlatList
      horizontal
      data={loading ? [] : kitchens}
      keyExtractor={(kitchen) => kitchen.id}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.rail}
      style={styles.railList}
      ListEmptyComponent={
        loading ? (
          <View style={styles.skeletonRow}>
            <KitchenCardSkeleton />
            <KitchenCardSkeleton />
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPressKitchen(item)}
          style={styles.card}
          accessibilityRole="button"
          accessibilityLabel={`${item.name} kitchen`}
        >
          <View style={styles.coverWrap}>
            {item.coverImage || item.logoUrl ? (
              <Image
                source={{ uri: (item.coverImage ?? item.logoUrl) as string }}
                style={styles.cover}
                resizeMode="cover"
              />
            ) : null}
          </View>
          <View style={styles.nameRow}>
            <Text style={[theme.text.h4, styles.name]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isVerified ? (
              <BadgeCheck size={15} color={theme.colors.primary[600]} strokeWidth={2.2} />
            ) : null}
          </View>
          <View style={styles.metaRow}>
            <Star size={12} color={theme.colors.primary[600]} strokeWidth={2.4} />
            <Text style={[theme.text.caption, styles.meta]}>
              {item.ratingCount > 0 ? item.rating.toFixed(1) : 'New'}
            </Text>
            <Clock size={12} color={theme.colors.text.tertiary} strokeWidth={2.2} />
            <Text style={[theme.text.caption, styles.meta]}>{item.prepTimeMins} min</Text>
          </View>
          <Text style={[theme.text.caption, styles.meta]} numberOfLines={1}>
            {item.locality ? `${item.locality}, ${item.city}` : item.city}
          </Text>
        </Pressable>
      )}
    />
  );
};

export default SearchKitchenRail;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    railList: { flexGrow: 0 },
    rail: {
      paddingHorizontal: theme.layout.screenPadding,
      gap: theme.spacing.md,
    },
    skeletonRow: { flexDirection: 'row', gap: theme.spacing.md },
    card: {
      width: CARD_WIDTH,
      padding: theme.spacing.md,
      borderRadius: theme.radius.card,
      backgroundColor: theme.colors.surface.raised,
      borderWidth: 1,
      borderColor: theme.colors.borders.subtle,
      gap: theme.spacing.xs,
    },
    coverWrap: {
      height: 100,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface.brandWash,
      marginBottom: theme.spacing.xs,
    },
    cover: { width: '100%', height: '100%' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    name: { flex: 1, color: theme.colors.text.primary },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    meta: { color: theme.colors.text.secondary },
  });
