import React, { useRef, useState, useMemo } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { CalendarDays, Heart, Pause, Play, RefreshCw } from 'lucide-react-native';
import { ApiError } from '@api';
import type { CustomerSubscriptionStatus, SubscriptionDeliveryStatus } from '@api/types';
import { formatCurrency, humanizeEnum } from '@utils/format';
import { AppBar, Badge, Button, Card, Chip, EmptyState, Sheet, Skeleton } from '@components/ui';
import type { BadgeTone, SheetHandle } from '@components/ui';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { useFavorites } from '@features/meals/hooks/useMeals';
import { usePauseSubscription, useResumeSubscription, useSubscriptionDetail } from '../hooks/useSubscriptions';
import SwapMealSheet from '../components/SwapMealSheet';
import { useTheme } from "@app/theme/useTheme";

type Route = RouteProp<PrivateStackParamList, 'ManageSubscription'>;

const STATUS_TONE: Record<CustomerSubscriptionStatus, BadgeTone> = {
  PENDING: 'warning',
  ACTIVE: 'accent',
  PAUSED: 'neutral',
  CANCELLED: 'danger',
  REJECTED: 'danger',
};

const createDeliveryStatusColor = (
  theme: ReturnType<typeof useTheme>,
): Record<SubscriptionDeliveryStatus, string> => ({
  SCHEDULED: theme.colors.neutral[300],
  DISPATCHED: theme.colors.accent[600],
  SKIPPED: theme.colors.state.error,
});

const PAUSE_DAY_OPTIONS = [7, 14, 30];

/**
 * Delivery-calendar strip + current-meal card + pause/resume + swap, for one
 * subscription. Layout borrows the kitchen-partner `SubscriberDetail`'s
 * delivery-schedule strip purely as a reference; this is rebuilt with the
 * customer app's own theme conventions (plain `<Text style={theme.text.*}>`,
 * `theme.colors.primary[600]`), not its `Text variant=`/`theme.spacing.paddings.*` system.
 */
const ManageSubscription = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const deliveryStatusColor = useMemo(() => createDeliveryStatusColor(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();
  const { subscriptionId } = params;

  const query = useSubscriptionDetail(subscriptionId);
  const pauseSubscription = usePauseSubscription();
  const resumeSubscription = useResumeSubscription();
  const favorites = useFavorites();

  const pauseSheetRef = useRef<SheetHandle>(null);
  const swapSheetRef = useRef<SheetHandle>(null);
  const [pauseDays, setPauseDays] = useState<number | null>(7);
  const [swapInitialMealId, setSwapInitialMealId] = useState<string | null>(null);

  const subscription = query.data;

  const nextDelivery =
    subscription?.deliverySchedule.find((entry) => entry.status === 'SCHEDULED') ??
    subscription?.deliverySchedule[0] ??
    null;
  const swapDate = nextDelivery?.date.slice(0, 10) ?? null;

  const kitchenFavorites = subscription
    ? (favorites.data?.items ?? []).filter((meal) => meal.kitchen.id === subscription.kitchen.id)
    : [];

  const openSwap = (mealId?: string) => {
    if (!swapDate) return;
    setSwapInitialMealId(mealId ?? null);
    swapSheetRef.current?.open();
  };

  const handlePause = (days: number | null) => {
    pauseSubscription.mutate(
      { id: subscriptionId, days: days ?? undefined },
      {
        onSuccess: () => pauseSheetRef.current?.close(),
        onError: (error) =>
          Alert.alert('Could not pause', error instanceof ApiError ? error.message : 'Please try again.'),
      },
    );
  };

  const handleResume = () => {
    resumeSubscription.mutate(subscriptionId, {
      onError: (error) =>
        Alert.alert('Could not resume', error instanceof ApiError ? error.message : 'Please try again.'),
    });
  };

  return (
    <View style={styles.screen}>
      <AppBar title={subscription?.planName ?? 'Subscription'} subtitle={subscription?.kitchen.name} onBack={navigation.goBack} />

      {query.isLoading ? (
        <View style={styles.loadingWrap}>
          <Skeleton height={140} radius={theme.radius.card} />
          <Skeleton height={100} radius={theme.radius.card} />
          <Skeleton height={100} radius={theme.radius.card} />
        </View>
      ) : query.isError || !subscription ? (
        <EmptyState
          title="Something went wrong"
          description="We couldn't load this subscription."
          actionLabel="Retry"
          onAction={() => query.refetch()}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <View style={styles.headerRow}>
              {subscription.kitchen.logoUrl ? (
                <Image source={{ uri: subscription.kitchen.logoUrl }} style={styles.kitchenLogo} resizeMode="cover" />
              ) : (
                <View style={[styles.kitchenLogo, styles.kitchenLogoFallback]} />
              )}
              <View style={styles.headerText}>
                <Text style={theme.text.h3} numberOfLines={1}>
                  {subscription.kitchen.name}
                </Text>
                <Text style={[theme.text.bodySmall, styles.headerMeta]} numberOfLines={1}>
                  {subscription.mealsPerDay}× daily · {humanizeEnum(subscription.deliveryTime)} ·{' '}
                  {formatCurrency(subscription.pricePerCycle)}/
                  {subscription.billingCycle === 'WEEKLY' ? 'week' : 'month'}
                </Text>
              </View>
              <Badge label={humanizeEnum(subscription.status)} tone={STATUS_TONE[subscription.status]} />
            </View>

            {subscription.status === 'REJECTED' && subscription.rejectionReason ? (
              <Text style={[theme.text.bodySmall, styles.rejectionText]}>{subscription.rejectionReason}</Text>
            ) : null}

            {subscription.status === 'ACTIVE' || subscription.status === 'PAUSED' ? (
              <View style={styles.actionsRow}>
                {subscription.status === 'ACTIVE' ? (
                  <Button
                    title="Pause"
                    variant="outline"
                    size="sm"
                    leftIcon={<Pause size={14} color={theme.colors.text.primary} strokeWidth={2.2} />}
                    onPress={() => pauseSheetRef.current?.open()}
                    style={styles.actionButton}
                  />
                ) : (
                  <Button
                    title={resumeSubscription.isPending ? 'Resuming…' : 'Resume'}
                    size="sm"
                    leftIcon={<Play size={14} color={theme.colors.text.inverse} strokeWidth={2.2} />}
                    onPress={handleResume}
                    loading={resumeSubscription.isPending}
                    style={styles.actionButton}
                  />
                )}
              </View>
            ) : null}
          </Card>

          {subscription.deliverySchedule.length > 0 ? (
            <Card style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <CalendarDays size={15} color={theme.colors.text.secondary} strokeWidth={2.2} />
                <Text style={[theme.text.overline, styles.sectionLabel]}>DELIVERY SCHEDULE</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scheduleStrip}>
                {subscription.deliverySchedule.map((entry) => (
                  <View key={entry.date} style={styles.scheduleCell}>
                    <Text style={[theme.text.caption, styles.scheduleDay]}>
                      {new Date(entry.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                    </Text>
                    <View style={[styles.scheduleDot, { backgroundColor: deliveryStatusColor[entry.status] }]}>
                      <Text style={[theme.text.label, styles.scheduleDotLabel]}>
                        {new Date(entry.date).getDate()}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </Card>
          ) : null}

          <Card style={styles.card}>
            <Text style={[theme.text.overline, styles.sectionLabel]}>
              {nextDelivery ? 'NEXT DELIVERY' : 'DELIVERY'}
            </Text>
            <View style={styles.mealRow}>
              {nextDelivery?.meal?.images?.[0] ? (
                <Image source={{ uri: nextDelivery.meal.images[0] }} style={styles.mealImage} resizeMode="cover" />
              ) : (
                <View style={[styles.mealImage, styles.mealImageFallback]} />
              )}
              <View style={styles.mealText}>
                <Text style={theme.text.h4} numberOfLines={2}>
                  {nextDelivery?.meal?.name ?? "Kitchen's choice"}
                </Text>
                <Text style={[theme.text.caption, styles.mealHint]}>
                  {nextDelivery
                    ? new Date(nextDelivery.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : 'No upcoming delivery scheduled'}
                </Text>
              </View>
            </View>
            <Button
              title="Swap Dish"
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} color={theme.colors.text.primary} strokeWidth={2.2} />}
              onPress={() => openSwap()}
              disabled={!swapDate}
              style={styles.swapButton}
            />
          </Card>

          {kitchenFavorites.length > 0 ? (
            <Card style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Heart size={14} color={theme.colors.text.secondary} strokeWidth={2.2} />
                <Text style={[theme.text.overline, styles.sectionLabel]}>SWAP WITH A FAVOURITE</Text>
              </View>
              {kitchenFavorites.map((meal) => (
                <View key={meal.id} style={styles.favoriteRow}>
                  {meal.image ? (
                    <Image source={{ uri: meal.image }} style={styles.favoriteImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.favoriteImage, styles.favoriteImageFallback]} />
                  )}
                  <Text style={[theme.text.bodySmall, styles.favoriteName]} numberOfLines={1}>
                    {meal.name}
                  </Text>
                  <Button
                    title="Use this"
                    variant="ghost"
                    size="sm"
                    fullWidth={false}
                    onPress={() => openSwap(meal.id)}
                    disabled={!swapDate}
                  />
                </View>
              ))}
            </Card>
          ) : null}
        </ScrollView>
      )}

      {subscription ? (
        <>
          <Sheet ref={pauseSheetRef} title="Pause this subscription" heightRatio={0.45}>
            <View style={styles.sheetBody}>
              <Text style={[theme.text.bodySmall, styles.sheetHint]}>
                Pick how long to pause, or leave it open-ended.
              </Text>
              <View style={styles.dayChipsRow}>
                {PAUSE_DAY_OPTIONS.map((days) => (
                  <Chip
                    key={days}
                    label={`${days} days`}
                    selected={pauseDays === days}
                    onPress={() => setPauseDays(days)}
                  />
                ))}
                <Chip label="Indefinite" selected={pauseDays === null} onPress={() => setPauseDays(null)} />
              </View>
              <Button
                title={pauseSubscription.isPending ? 'Pausing…' : 'Pause Subscription'}
                onPress={() => handlePause(pauseDays)}
                loading={pauseSubscription.isPending}
                style={styles.sheetSubmit}
              />
            </View>
          </Sheet>

          {swapDate ? (
            <SwapMealSheet
              sheetRef={swapSheetRef}
              subscriptionId={subscriptionId}
              kitchenId={subscription.kitchen.id}
              date={swapDate}
              initialMealId={swapInitialMealId}
            />
          ) : null}
        </>
      ) : null}
    </View>
  );
};

export default ManageSubscription;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  loadingWrap: {
    padding: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  scroll: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  card: {
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  kitchenLogo: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutral[100],
  },
  kitchenLogoFallback: {
    backgroundColor: theme.colors.primary[100],
  },
  headerText: {
    flex: 1,
  },
  headerMeta: {
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  rejectionText: {
    color: theme.colors.state.error,
    marginTop: theme.spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  actionButton: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    color: theme.colors.text.tertiary,
  },
  scheduleStrip: {
    gap: theme.spacing.lg,
    paddingRight: theme.spacing.sm,
  },
  scheduleCell: {
    alignItems: 'center',
    gap: 4,
  },
  scheduleDay: {
    color: theme.colors.text.tertiary,
  },
  scheduleDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleDotLabel: {
    color: theme.colors.text.inverse,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  mealImage: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.md,
  },
  mealImageFallback: {
    backgroundColor: theme.colors.neutral[100],
  },
  mealText: {
    flex: 1,
  },
  mealHint: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  swapButton: {
    marginTop: theme.spacing.md,
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  favoriteImage: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
  },
  favoriteImageFallback: {
    backgroundColor: theme.colors.neutral[100],
  },
  favoriteName: {
    flex: 1,
    color: theme.colors.text.primary,
  },
  sheetBody: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.sm,
  },
  sheetHint: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  dayChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  sheetSubmit: {
    marginTop: theme.spacing.xl,
  },
});
