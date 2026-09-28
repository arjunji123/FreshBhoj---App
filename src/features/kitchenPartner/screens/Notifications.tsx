import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SectionList, StyleSheet, View } from 'react-native';
import { Bell, CheckCheck, Clapperboard, Package, RotateCw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, AppBarAction, Button, Card, Chip, ChipRow, EmptyState, Screen, Skeleton, Text } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import {
  useAdvanceOrderStatus,
  useKitchenNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '../hooks/useKitchenPortal';
import type { KitchenNotification, NotificationCategory } from '../kitchenPartner.types';

const CATEGORY_FILTERS: { key: NotificationCategory | undefined; label: string }[] = [
  { key: undefined, label: 'All' },
  { key: 'ORDER', label: 'Orders' },
  { key: 'SUBSCRIPTION', label: 'Subscription' },
  { key: 'REEL', label: 'Reels' },
];

const CATEGORY_ICON: Record<NotificationCategory, React.ComponentType<{ size?: number; color?: string }>> = {
  ORDER: Package,
  SUBSCRIPTION: RotateCw,
  REEL: Clapperboard,
  GENERAL: Bell,
};

/**
 * The exact key the backend uses for the order id inside `data` on an
 * ACCEPT_ORDER notification wasn't part of this round's verified surface —
 * try the common candidates and just hide the inline action if none match,
 * rather than guessing wrong and crashing on `.mutate(undefined as any)`.
 */
function extractOrderId(data: Record<string, unknown> | null): string | null {
  if (!data) return null;
  const candidate = data.orderId ?? data.id;
  return typeof candidate === 'string' ? candidate : null;
}

function sectionize(items: KitchenNotification[]): { title: string; data: KitchenNotification[] }[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  const today: KitchenNotification[] = [];
  const yesterday: KitchenNotification[] = [];
  const earlier: KitchenNotification[] = [];

  items.forEach((item) => {
    const t = new Date(item.createdAt).getTime();
    if (t >= startOfToday) today.push(item);
    else if (t >= startOfYesterday) yesterday.push(item);
    else earlier.push(item);
  });

  const sections: { title: string; data: KitchenNotification[] }[] = [];
  if (today.length) sections.push({ title: 'Today', data: today });
  if (yesterday.length) sections.push({ title: 'Yesterday', data: yesterday });
  if (earlier.length) sections.push({ title: 'Earlier', data: earlier });
  return sections;
}

const Notifications = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const [category, setCategory] = useState<NotificationCategory | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pagesMap, setPagesMap] = useState<Record<number, KitchenNotification[]>>({});

  const query = useKitchenNotifications({ category, page });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const advanceOrder = useAdvanceOrderStatus();

  useEffect(() => {
    if (!query.data) return;
    setPagesMap((prev) => ({ ...prev, [page]: query.data!.items }));
  }, [query.data, page]);

  const items = useMemo(() => {
    const pageNumbers = Object.keys(pagesMap)
      .map(Number)
      .sort((a, b) => a - b);
    return pageNumbers.flatMap((p) => pagesMap[p] ?? []);
  }, [pagesMap]);

  const sections = useMemo(() => sectionize(items), [items]);
  const unreadCount = query.data?.unreadCount ?? 0;

  const changeCategory = (next: NotificationCategory | undefined) => {
    setCategory(next);
    setPage(1);
    setPagesMap({});
  };

  const handlePress = (item: KitchenNotification) => {
    if (!item.isRead) markRead.mutate(item.id);
  };

  const handleAccept = (item: KitchenNotification, orderId: string) => {
    advanceOrder.mutate(
      { id: orderId, status: 'ACCEPTED' },
      {
        onSuccess: () => {
          if (!item.isRead) markRead.mutate(item.id);
        },
        onError: (error) =>
          Alert.alert('Could not accept order', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onError: (error) =>
        Alert.alert('Could not mark all as read', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  return (
    <Screen background="page">
      <AppBar
        title="Notifications"
        onBack={() => navigation.goBack()}
        right={
          unreadCount > 0 ? (
            <AppBarAction accessibilityLabel="Mark all as read" onPress={handleMarkAllRead}>
              <CheckCheck size={18} color={theme.colors.text.secondary} strokeWidth={2.5} />
            </AppBarAction>
          ) : undefined
        }
      />

      <ChipRow style={styles.chipRow}>
        {CATEGORY_FILTERS.map((filter) => (
          <Chip
            key={filter.label}
            label={filter.label}
            selected={category === filter.key}
            onPress={() => changeCategory(filter.key)}
          />
        ))}
      </ChipRow>

      {query.isError ? (
        <View style={styles.emptyPadding}>
          <EmptyState title="Something went wrong" description="We couldn't load your notifications." actionLabel="Retry" onAction={() => query.refetch()} />
        </View>
      ) : query.isLoading && page === 1 ? (
        <View style={styles.listPadding}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={76} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.sm }} />
          ))}
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={items.length ? styles.listPadding : styles.emptyPadding}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <EmptyState
              icon={<Bell size={28} color={theme.colors.text.tertiary} />}
              title="No notifications"
              description="You're all caught up."
            />
          }
          renderSectionHeader={({ section }) => (
            <Text variant="overline" color="tertiary" style={styles.sectionHeader}>
              {section.title.toUpperCase()}
            </Text>
          )}
          renderItem={({ item }) => {
            const orderId =
              item.category === 'ORDER' && item.data?.action === 'ACCEPT_ORDER' ? extractOrderId(item.data) : null;
            return (
              <NotificationRow
                item={item}
                Icon={CATEGORY_ICON[item.category] ?? Bell}
                onPress={() => handlePress(item)}
                onAccept={orderId ? () => handleAccept(item, orderId) : undefined}
                isAccepting={advanceOrder.isPending && advanceOrder.variables?.id === orderId}
              />
            );
          }}
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
    </Screen>
  );
};

function NotificationRow({
  item,
  Icon,
  onPress,
  onAccept,
  isAccepting,
}: {
  item: KitchenNotification;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress: () => void;
  onAccept?: () => void;
  isAccepting: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => (pressed ? styles.pressed : null)}>
      <Card style={[styles.row, !item.isRead ? styles.rowUnread : null]} padding="md" bordered>
        <View style={styles.rowTop}>
          <View style={styles.iconWrap}>
            <Icon size={16} color={theme.colors.brand.primary} />
          </View>
          <View style={styles.rowText}>
            <Text variant={item.isRead ? 'bodyMedium' : 'label'}>{item.title}</Text>
            <Text variant="bodySmall" color="secondary" numberOfLines={2} style={styles.rowBody}>
              {item.body}
            </Text>
            <Text variant="caption" color="tertiary" style={styles.rowTime}>
              {new Date(item.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          {!item.isRead ? <View style={styles.unreadDot} /> : null}
        </View>
        {onAccept ? (
          <Button title={isAccepting ? 'Accepting…' : 'Accept'} size="sm" fullWidth={false} loading={isAccepting} onPress={onAccept} style={styles.acceptButton} />
        ) : null}
      </Card>
    </Pressable>
  );
}

export default Notifications;

const styles = StyleSheet.create({
  chipRow: { paddingVertical: theme.spacing.paddings.sm },
  listPadding: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl },
  emptyPadding: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.layout.screenPadding },
  sectionHeader: { marginTop: theme.spacing.paddings.md, marginBottom: theme.spacing.paddings.xs },
  row: { marginBottom: theme.spacing.paddings.sm },
  rowUnread: { backgroundColor: theme.colors.brand.primarySubtle },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.paddings.sm },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowBody: { marginTop: 2 },
  rowTime: { marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.brand.primary, marginTop: 4 },
  acceptButton: { marginTop: theme.spacing.paddings.sm, alignSelf: 'flex-start' },
  loadMoreWrap: { alignItems: 'center', paddingVertical: theme.spacing.paddings.lg },
  pressed: { opacity: 0.85 },
});
