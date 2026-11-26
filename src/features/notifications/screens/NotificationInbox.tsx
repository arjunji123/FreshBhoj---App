import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  AlertCircle,
  Bell,
  CalendarClock,
  Receipt,
  Settings,
  Wallet,
} from 'lucide-react-native';
import { AppBar, AppBarAction, EmptyState, Screen, Skeleton, Text } from '@components/ui';
import type { CustomerNotification, CustomerNotificationCategory } from '@api/types';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useTheme } from '@app/theme/useTheme';
import { formatRelativeTime } from '@utils/format';
import { useMarkAllNotificationsRead, useNotificationInbox } from '../hooks/useNotifications';

type Filter = CustomerNotificationCategory | 'ALL';

/** Heading under which a notification is grouped. */
const dayLabel = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return date.toDateString() === yesterday.toDateString() ? 'Yesterday' : 'Earlier';
};

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'ORDER', label: 'Orders' },
  { key: 'SUBSCRIPTION', label: 'Meal plans' },
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

  // No "mark all read" button: whatever was on the page counts as read once the
  // customer leaves it, so the unread dots stay visible while they are looking.
  const unreadRef = useRef(unreadCount);
  unreadRef.current = unreadCount;
  const { mutate: markRead } = markAllRead;
  useFocusEffect(
    useCallback(
      () => () => {
        if (unreadRef.current > 0) markRead();
      },
      [markRead],
    ),
  );

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
    const props = { size: 16, color: theme.colors.primary[600], strokeWidth: 2.2 };
    if (category === 'WALLET') return <Wallet {...props} />;
    if (category === 'SUBSCRIPTION') return <CalendarClock {...props} />;
    return <Receipt {...props} />;
  };

  const renderItem = ({ item, index }: { item: CustomerNotification; index: number }) => {
    const day = dayLabel(item.createdAt);
    const showDay = index === 0 || dayLabel(items[index - 1].createdAt) !== day;
    return (
      <View>
        {showDay ? <Text style={[theme.text.label, styles.day]}>{day}</Text> : null}
        <Pressable
          onPress={() => handleOpen(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.isRead ? '' : 'Unread. '}${item.title}. ${item.body}`}
          style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
        >
          <View style={styles.iconWrap}>
            {renderIcon(item.category)}
            {!item.isRead ? <View style={styles.unreadDot} /> : null}
          </View>
          <View style={styles.rowText}>
            <View style={styles.rowTop}>
              <Text
                style={[theme.text.label, styles.rowTitle, item.isRead ? styles.titleRead : null]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={[theme.text.caption, styles.time]}>{formatRelativeTime(item.createdAt)}</Text>
            </View>
            <Text style={[theme.text.caption, styles.message]} numberOfLines={2}>
              {item.body}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };

  const renderBody = () => {
    if (query.isLoading) {
      return (
        <View style={styles.skeletons}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={60} radius={theme.radius.lg} />
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
    <Screen background="page" edges={[]}>
      <AppBar
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
        onBack={navigation.goBack}
        right={
          <AppBarAction
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel="Notification settings"
          >
            <Settings size={18} color={theme.colors.text.primary} strokeWidth={2.2} />
          </AppBarAction>
        }
      />

      <View style={styles.tabs} accessibilityRole="tablist">
        {FILTERS.map(({ key, label }) => {
          const selected = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={[styles.tab, selected ? styles.tabActive : null]}
            >
              <Text
                style={[theme.text.label, selected ? styles.tabTextActive : styles.tabText]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {renderBody()}
    </Screen>
  );
};

export default NotificationInbox;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    // Segmented control, set apart from the header above and the list below.
    tabs: {
      flexDirection: 'row',
      marginHorizontal: theme.layout.screenPadding,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xs,
      padding: 4,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface.raised,
    },
    tab: {
      flex: 1,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.pill,
    },
    tabActive: { backgroundColor: theme.colors.primary[600] },
    tabText: { color: theme.colors.text.secondary },
    tabTextActive: { color: theme.colors.palette.white },
    skeletons: { padding: theme.layout.screenPadding, gap: theme.spacing.sm },
    list: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.xxxl },
    listEmpty: { flexGrow: 1, justifyContent: 'center' },
    footer: { paddingVertical: theme.spacing.lg },
    day: { color: theme.colors.text.secondary, marginTop: theme.spacing.md, marginBottom: theme.spacing.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface.raised,
    },
    rowPressed: { opacity: 0.85 },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.brandWash,
    },
    unreadDot: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: theme.colors.surface.raised,
      backgroundColor: theme.colors.primary[600],
    },
    rowText: { flex: 1 },
    rowTop: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    rowTitle: { flex: 1, color: theme.colors.text.primary },
    titleRead: { color: theme.colors.text.secondary },
    time: { color: theme.colors.text.tertiary },
    message: { color: theme.colors.text.secondary, marginTop: 1 },
  });
