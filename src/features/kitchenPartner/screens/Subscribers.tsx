import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ListChecks, Phone, Search, Users } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, AppBarAction, Avatar, Badge, Button, Card, Chip, ChipRow, EmptyState, FoodTypeDot, Input, Screen, Sheet, Skeleton, Text } from '@components/ui';
import type { SheetHandle } from '@components/ui';
import type { BadgeTone } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useApproveSubscription, useRejectSubscription, useSubscriptions } from '../hooks/useKitchenPortal';
import type { Subscription, SubscriptionCounts, SubscriptionStatus } from '../kitchenPartner.types';
import { callPhone } from '../utils/contact';

type FilterTab = 'ALL' | SubscriptionStatus;

const FILTER_LABEL: Record<FilterTab, string> = {
  ALL: 'All',
  PENDING: 'Pending',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
};

const STATUS_TONE: Record<SubscriptionStatus, BadgeTone> = {
  PENDING: 'warning',
  ACTIVE: 'accent',
  PAUSED: 'neutral',
  CANCELLED: 'danger',
  REJECTED: 'danger',
};

function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

const Subscribers = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const [tab, setTab] = useState<FilterTab>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagesMap, setPagesMap] = useState<Record<number, Subscription[]>>({});

  const rejectSheetRef = useRef<SheetHandle>(null);
  const [rejectTarget, setRejectTarget] = useState<Subscription | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const approveSubscription = useApproveSubscription();
  const rejectSubscription = useRejectSubscription();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
    setPagesMap({});
  }, [tab, debouncedSearch]);

  const query = useSubscriptions({ status: tab === 'ALL' ? undefined : tab, q: debouncedSearch || undefined, page });

  useEffect(() => {
    if (!query.data) return;
    setPagesMap((prev) => ({ ...prev, [page]: query.data!.items }));
  }, [query.data, page]);

  const items = useMemo(() => {
    const pageNumbers = Object.keys(pagesMap).map(Number).sort((a, b) => a - b);
    return pageNumbers.flatMap((p) => pagesMap[p] ?? []);
  }, [pagesMap]);

  const counts: SubscriptionCounts | undefined = query.data?.counts;

  const handleRefresh = () => {
    if (page === 1) {
      query.refetch();
    } else {
      setPage(1);
      setPagesMap({});
    }
  };

  const openReject = (subscription: Subscription) => {
    setRejectTarget(subscription);
    setRejectReason('');
    rejectSheetRef.current?.open();
  };

  const submitReject = () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      Alert.alert('Reason required', 'Let the customer know why this plan was rejected.');
      return;
    }
    rejectSubscription.mutate(
      { id: rejectTarget.id, reason: rejectReason.trim() },
      {
        onSuccess: () => rejectSheetRef.current?.close(),
        onError: (error) => Alert.alert('Could not reject', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  const handleApprove = (subscription: Subscription) => {
    approveSubscription.mutate(subscription.id, {
      onError: (error) => Alert.alert('Could not approve', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  return (
    <Screen background="page">
      <AppBar
        title="Subscribers"
        onBack={() => navigation.goBack()}
        right={
          <AppBarAction accessibilityLabel="Manage subscription plans" onPress={() => navigation.navigate('ManagePlans')}>
            <ListChecks size={18} color={theme.colors.text.primary} />
          </AppBarAction>
        }
      />
      <View style={styles.header}>
        <Input
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Search by name or phone"
          leftIcon={<Search size={16} color={theme.colors.text.tertiary} />}
          size="md"
          containerStyle={styles.searchInput}
        />
        <ChipRow>
          {(Object.keys(FILTER_LABEL) as FilterTab[]).map((key) => (
            <Chip
              key={key}
              label={key === 'ALL' ? FILTER_LABEL[key] : `${FILTER_LABEL[key]}${counts ? ` (${counts[key]})` : ''}`}
              selected={tab === key}
              onPress={() => setTab(key)}
            />
          ))}
        </ChipRow>
      </View>

      {query.isLoading && page === 1 ? (
        <View style={styles.listPadding}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={140} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.sm }} />
          ))}
        </View>
      ) : query.isError ? (
        <View style={styles.emptyPadding}>
          <EmptyState title="Something went wrong" description="We couldn't load your subscribers." actionLabel="Retry" onAction={() => query.refetch()} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={items.length ? styles.listPadding : styles.emptyPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={query.isRefetching && page === 1} onRefresh={handleRefresh} tintColor={theme.colors.primary[600]} />}
          ListEmptyComponent={
            <EmptyState icon={<Users size={28} color={theme.colors.text.tertiary} />} title="No subscribers here" description="Subscription requests will show up here." />
          }
          renderItem={({ item }) => (
            <SubscriberRow
              subscription={item}
              onPress={() => navigation.navigate('SubscriberDetail', { subscriptionId: item.id })}
              onApprove={() => handleApprove(item)}
              onReject={() => openReject(item)}
              isBusy={
                (approveSubscription.isPending && approveSubscription.variables === item.id) ||
                (rejectSubscription.isPending && rejectSubscription.variables?.id === item.id)
              }
            />
          )}
          ListFooterComponent={
            query.data?.meta.hasNextPage ? (
              <View style={styles.loadMoreWrap}>
                {query.isFetching && page > 1 ? (
                  <ActivityIndicator color={theme.colors.brand.primary} />
                ) : (
                  <Button title="Load more" variant="outline" size="sm" fullWidth={false} onPress={() => setPage((p) => p + 1)} />
                )}
              </View>
            ) : null
          }
        />
      )}

      <Sheet ref={rejectSheetRef} title="Reject subscription" eyebrow={rejectTarget ? rejectTarget.planName : undefined}>
        <View style={styles.rejectSheetBody}>
          <Text style={styles.rejectSheetHint}>Let the customer know why — this is shown to them along with the rejection.</Text>
          <Input
            label="Reason"
            value={rejectReason}
            onChangeText={setRejectReason}
            placeholder="e.g. Can't accommodate this delivery time"
            multiline
            containerStyle={styles.rejectInput}
          />
          <Button
            title={rejectSubscription.isPending ? 'Rejecting…' : 'Reject subscription'}
            variant="danger"
            onPress={submitReject}
            loading={rejectSubscription.isPending}
          />
        </View>
      </Sheet>
    </Screen>
  );
};

function SubscriberRow({
  subscription,
  onPress,
  onApprove,
  onReject,
  isBusy,
}: {
  subscription: Subscription;
  onPress: () => void;
  onApprove: () => void;
  onReject: () => void;
  isBusy: boolean;
}) {
  return (
    <Card style={styles.subCard} onPress={onPress}>
      <View style={styles.topRow}>
        <Avatar uri={subscription.customer.profileImage} name={subscription.customer.fullName} size={40} />
        <View style={styles.customerInfo}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {subscription.customer.fullName || subscription.customer.phone}
          </Text>
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {subscription.planName}
          </Text>
        </View>
        <Badge label={subscription.status} tone={STATUS_TONE[subscription.status]} size="sm" />
      </View>

      <View style={styles.metaRow}>
        <FoodTypeDot type={subscription.foodType} size={13} />
        <Text variant="caption" color="tertiary">
          {subscription.mealsPerDay}× daily · {subscription.deliveryTime.charAt(0) + subscription.deliveryTime.slice(1).toLowerCase()} ·{' '}
          {formatRupees(subscription.pricePerCycle)}/{subscription.billingCycle === 'WEEKLY' ? 'wk' : 'mo'}
        </Text>
      </View>

      {subscription.status === 'PENDING' ? (
        <View style={styles.approveRow}>
          <Button title="Approve" size="sm" fullWidth={false} style={styles.approveButton} onPress={onApprove} loading={isBusy} />
          <Button title="Reject" size="sm" variant="outline" fullWidth={false} style={styles.approveButton} onPress={onReject} disabled={isBusy} />
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.callRow}
        onPress={() => callPhone(subscription.customer.phone)}
        accessibilityRole="button"
        accessibilityLabel={`Call ${subscription.customer.fullName || subscription.customer.phone}`}
      >
        <Phone size={14} color={theme.colors.brand.primary} />
        <Text variant="label" color="brand">
          Call customer
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

export default Subscribers;

const styles = StyleSheet.create({
  header: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.sm, gap: theme.spacing.paddings.sm },
  searchInput: { marginBottom: 0 },
  listPadding: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl },
  emptyPadding: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.layout.screenPadding },
  subCard: { marginBottom: theme.spacing.paddings.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm },
  customerInfo: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: theme.spacing.paddings.sm },
  approveRow: {
    flexDirection: 'row',
    gap: theme.spacing.paddings.sm,
    marginTop: theme.spacing.paddings.sm,
    paddingTop: theme.spacing.paddings.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  approveButton: { flex: 1 },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.paddings.xs,
    minHeight: 44,
    marginTop: theme.spacing.paddings.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  rejectSheetBody: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  rejectSheetHint: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginBottom: theme.spacing.paddings.md },
  rejectInput: { marginBottom: theme.spacing.paddings.lg },
  loadMoreWrap: { alignItems: 'center', paddingVertical: theme.spacing.paddings.lg },
});
