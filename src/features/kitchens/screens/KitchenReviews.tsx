import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { MessageSquare } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { AppBar, Chip, ChipRow, EmptyState, Skeleton } from '@components/ui';
import ReviewCard from '@features/meals/components/ReviewCard';
import { useMarkReviewHelpful } from '@features/reviews/hooks/useReviews';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import RatingSummary from '../components/RatingSummary';
import { useKitchenReviewSummary, useKitchenReviews } from '../hooks/useKitchens';

type Route = RouteProp<PrivateStackParamList, 'KitchenReviews'>;

const STAR_FILTERS = [0, 5, 4, 3, 2, 1];

const KitchenReviews = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();
  const [starFilter, setStarFilter] = useState(0);

  const { data: summary } = useKitchenReviewSummary(params.kitchenId);
  const { data: reviews, isLoading } = useKitchenReviews(params.kitchenId, 30);
  const markHelpful = useMarkReviewHelpful();

  // Filtering client-side: the page fetches 30 reviews, so a round-trip per
  // star tap would cost more than it saves.
  const items = (reviews?.items ?? []).filter(
    (review) => starFilter === 0 || review.rating === starFilter,
  );

  return (
    <View style={styles.screen}>
      <AppBar
        title="Reviews"
        subtitle={params.kitchenName}
        onBack={navigation.goBack}
      />

      {isLoading ? (
        <View style={styles.loading}>
          <Skeleton height={130} radius={theme.radius.card} />
          <Skeleton height={150} radius={theme.radius.card} />
          <Skeleton height={150} radius={theme.radius.card} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(review) => review.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, items.length === 0 ? styles.listEmpty : null]}
          ListHeaderComponent={
            <View style={styles.header}>
              {summary && summary.total > 0 ? <RatingSummary summary={summary} /> : null}
              <ChipRow style={styles.filters}>
                {STAR_FILTERS.map((star) => (
                  <Chip
                    key={star}
                    label={star === 0 ? 'All' : `${star} ★`}
                    selected={starFilter === star}
                    onPress={() => setStarFilter(star)}
                  />
                ))}
              </ChipRow>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon={
                <MessageSquare size={34} color={theme.colors.primary[600]} strokeWidth={1.8} />
              }
              title={starFilter === 0 ? 'No reviews yet' : `No ${starFilter}-star reviews`}
              description="Order once and your review can be the first."
            />
          }
          renderItem={({ item }) => (
            <View style={styles.item}>
              <ReviewCard review={item} onHelpful={() => markHelpful.mutate(item.id)} />
            </View>
          )}
        />
      )}
    </View>
  );
};

export default KitchenReviews;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  loading: {
    padding: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  header: {
    paddingBottom: theme.spacing.sm,
  },
  filters: {
    paddingVertical: theme.spacing.lg,
  },
  list: {
    paddingBottom: theme.spacing.xxxl,
  },
  listEmpty: {
    flexGrow: 1,
  },
  item: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.md,
  },
});
