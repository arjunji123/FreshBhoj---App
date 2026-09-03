import React, { useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Receipt } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { ApiError } from '@api';
import type { OrderCard, OrderStatus } from '@api/types';
import { Chip, ChipRow, EmptyState, Screen, Skeleton } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import OrderHistoryCard from '../components/OrderHistoryCard';
import { useOrderHistory, useReorder } from '../hooks/useOrders';

type Filter = { label: string; statuses?: OrderStatus[] };

const FILTERS: Filter[] = [
  { label: 'All' },
  {
    label: 'Active',
    statuses: ['PLACED', 'ACCEPTED', 'PREPARING', 'OUT_FOR_DELIVERY'],
  },
  { label: 'Delivered', statuses: ['DELIVERED'] },
  { label: 'Cancelled', statuses: ['CANCELLED'] },
];

/** Order history. Used quickly, so it stays a flat scannable list. */
const OrderHistory = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const [filterIndex, setFilterIndex] = useState(0);

  const filter = FILTERS[filterIndex];
  const query = useOrderHistory(filter.statuses);
  const reorder = useReorder();

  const orders = query.data?.pages.flatMap((page) => page.items) ?? [];

  const handleReorder = (order: OrderCard) => {
    reorder.mutate(order.id, {
      onSuccess: (result) => {
        const skipped = result.skippedItems.length
          ? `\n\nUnavailable and skipped: ${result.skippedItems.join(', ')}`
          : '';
        Alert.alert(
          'Added to cart',
          `${result.addedCount} ${result.addedCount === 1 ? 'item' : 'items'} from ${order.kitchen.name} are back in your cart.${skipped}`,
          [
            { text: 'Keep browsing', style: 'cancel' },
            { text: 'View cart', onPress: () => navigation.navigate('Cart') },
          ],
        );
      },
      onError: (error) =>
        Alert.alert(
          'Could not reorder',
          error instanceof ApiError ? error.message : 'Please try again.',
        ),
    });
  };

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Text style={theme.text.h1}>Your Orders</Text>
        <Text style={[theme.text.bodySmall, styles.subtitle]}>
          Track what is on the way, and reorder what you loved
        </Text>
      </View>

      <ChipRow style={styles.filters}>
        {FILTERS.map((option, index) => (
          <Chip
            key={option.label}
            label={option.label}
            selected={index === filterIndex}
            onPress={() => setFilterIndex(index)}
          />
        ))}
      </ChipRow>

      {query.isLoading ? (
        <View style={styles.loading}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height={128} radius={theme.radius.card} />
          ))}
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(order) => order.id}
          contentContainerStyle={[styles.list, orders.length === 0 ? styles.listEmpty : null]}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching && !query.isLoading}
              onRefresh={query.refetch}
              tintColor={theme.colors.primary[600]}
              colors={[theme.colors.primary[600]]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Receipt size={36} color={theme.colors.primary[600]} strokeWidth={1.8} />}
              title={filterIndex === 0 ? 'No orders yet' : `No ${filter.label.toLowerCase()} orders`}
              description={
                filterIndex === 0
                  ? 'Your first FreshBhoj meal is waiting. Verified kitchens, real nutrition numbers, no guesswork.'
                  : 'Try another filter to see the rest of your orders.'
              }
              actionLabel={filterIndex === 0 ? 'Browse meals' : undefined}
              onAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            />
          }
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <Skeleton height={128} radius={theme.radius.card} />
            ) : null
          }
          renderItem={({ item }) => (
            <OrderHistoryCard
              order={item}
              isReordering={reorder.isPending && reorder.variables === item.id}
              onPress={() =>
                item.isActive
                  ? navigation.navigate('OrderTracking', { orderId: item.id })
                  : navigation.navigate('OrderDetail', { orderId: item.id })
              }
              onReorder={() => handleReorder(item)}
              onRate={() =>
                navigation.navigate('WriteReview', {
                  orderId: item.id,
                  kitchenId: item.kitchen.id,
                  kitchenName: item.kitchen.name,
                })
              }
            />
          )}
        />
      )}
    </Screen>
  );
};

export default OrderHistory;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.md,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  filters: {
    paddingVertical: theme.spacing.lg,
  },
  loading: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  list: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
