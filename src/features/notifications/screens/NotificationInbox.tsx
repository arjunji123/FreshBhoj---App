import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AlertCircle,
  Bell,
  CalendarClock,
  CheckCheck,
  Receipt,
  Settings,
  Wallet,
} from 'lucide-react-native';
import { AppBar, AppBarAction, Chip, ChipRow, EmptyState, Screen, Skeleton, Text } from '@components/ui';
import type { CustomerNotification, CustomerNotificationCategory } from '@api/types';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useTheme } from '@app/theme/useTheme';
import { formatRelativeTime } from '@utils/format';
import { useMarkAllNotificationsRead, useNotificationInbox } from '../hooks/useNotifications';

type Filter = CustomerNotificationCategory | 'ALL';

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'ORDER', label: 'Orders' },
  { key: 'SUBSCRIPTION', label: 'Subscriptions' },
  { key: 'WALLET', label: 'Wallet' },
];

/**
 * The customer notification inbox: order progress, messages from the kitchen,
 * wallet credits and subscription decisions, newest first. The preferences
 * (what you want to be told about) live one tap away behind the cog.
 */
const NotificationInbox = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const [filter, setFilter] = useState<Filter>('ALL');

  const query = useNotificationInbox(filter === 'ALL' ? undefined : filter);
  const markAllRead = useMarkAllNotificationsRead();

  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const unreadCount = query.data?.pages[0]?.unreadCount ?? 0;

  const handleOpen = useCallback(
    (item: CustomerNotification) => {
      const { orderId, subscriptionId } = item.data ?? {};
      if (orderId) {
        navigation.navigate('OrderTracking', { orderId });
      } else if (subscriptionId) {
        navigation.navigate('ManageSubscription', { subscriptionId });
      } else if (item.category === 'WALLET') {
        navigation.navigate('Wallet');
      }
    },
    [navigation],
  );

  const renderIcon = (category: CustomerNotificationCategory) => {
    const props = { size: 18, color: theme.colors.primary[600], strokeWidth: 2.2 };
    if (category === 'WALLET') return <Wallet {...props} />;
    if (category === 'SUBSCRIPTION') return <CalendarClock {...props} />;
    return <Receipt {...props} />;
  };

  const renderItem = ({ item }: { item: CustomerNotification }) => (
    <Pressable
      onPress={() => handleOpen(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.isRead ? '' : 'Unread. '}${item.title}. ${item.body}`}
      style={({ pressed }) => [
        styles.row,
        !item.isRead ? styles.rowUnread : null,
        pressed ? styles.rowPressed : null,
      ]}
    >
      <View style={styles.iconWrap}>{renderIcon(item.category)}</View>
      <View style={styles.rowText}>
        <View style={styles.rowTop}>
          <Text variant="h4" style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text variant="caption" color="tertiary">
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
        <Text variant="bodySmall" color="secondary" numberOfLines={3}>
          {item.body}
        </Text>
      </View>
      {!item.isRead ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );

  const renderBody = () => {
    if (query.isLoading) {
      return (
        <View style={styles.skeletons}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={76} radius={theme.radius.card} />
          ))}
        </View>
      );
    }

    if (query.isError) {
      return (
        <EmptyState
          icon={<AlertCircle size={36} color={theme.colors.state.error} strokeWidth={1.8} />}
          title="Could not load notifications"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => query.refetch()}
        />
      );
    }

    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={items.length ? styles.list : styles.listEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={() => query.refetch()}
            tintColor={theme.colors.primary[600]}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
        }}
        ListEmptyComponent={
          <EmptyState
            icon={<Bell size={36} color={theme.colors.text.tertiary} strokeWidth={1.8} />}
            title="You are all caught up"
            description="Order updates, kitchen messages and wallet activity will show up here."
          />
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} color={theme.colors.primary[600]} />
          ) : null
        }
      />
    );
  };

  return (
    <Screen background="page">
      <AppBar
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
        onBack={navigation.goBack}
        right={
          <View style={styles.barActions}>
            {unreadCount > 0 ? (
              <AppBarAction
                onPress={() => markAllRead.mutate()}
                accessibilityLabel="Mark all as read"
              >
                <CheckCheck size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />
              </AppBarAction>
            ) : null}
            <AppBarAction
              onPress={() => navigation.navigate('Notifications')}
              accessibilityLabel="Notification settings"
            >
              <Settings size={18} color={theme.colors.text.primary} strokeWidth={2.2} />
            </AppBarAction>
          </View>
        }
      />

      <ChipRow>
        {FILTERS.map(({ key, label }) => (
          <Chip key={key} label={label} selected={filter === key} onPress={() => setFilter(key)} />
        ))}
      </ChipRow>

      {renderBody()}
    </Screen>
  );
};

export default NotificationInbox;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    barActions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    skeletons: { padding: theme.layout.screenPadding, gap: theme.spacing.md },
    list: { padding: theme.layout.screenPadding, gap: theme.spacing.sm, paddingBottom: theme.spacing.xxxl },
    listEmpty: { flexGrow: 1, justifyContent: 'center' },
    footer: { paddingVertical: theme.spacing.lg },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      minHeight: 64,
      borderRadius: theme.radius.card,
      backgroundColor: theme.colors.surface.base,
      borderWidth: 1,
      borderColor: theme.colors.borders.subtle,
    },
    rowUnread: { backgroundColor: theme.colors.surface.brandWash, borderColor: theme.colors.primary[100] },
    rowPressed: { opacity: 0.85 },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary[50],
    },
    rowText: { flex: 1, gap: 2 },
    rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
    rowTitle: { flex: 1 },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 6,
      backgroundColor: theme.colors.primary[600],
    },
  });
