import React, { useRef, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CalendarClock, CalendarOff, Plus } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { ApiError } from '@api';
import type { CustomerSubscriptionStatus, CustomerSubscriptionSummary } from '@api/types';
import { formatCurrency, humanizeEnum } from '@utils/format';
import { AppBarAction, Badge, Button, Card, Chip, EmptyState, Sheet, Skeleton } from '@components/ui';
import type { BadgeTone, SheetHandle } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useBulkPauseSubscriptions, useCustomerSubscriptions } from '../hooks/useSubscriptions';

const STATUS_TONE: Record<CustomerSubscriptionStatus, BadgeTone> = {
  PENDING: 'warning',
  ACTIVE: 'accent',
  PAUSED: 'neutral',
  CANCELLED: 'danger',
  REJECTED: 'danger',
};

const VACATION_DAY_OPTIONS = [7, 14, 30];

function nextDeliveryHint(subscription: CustomerSubscriptionSummary): string {
  if (subscription.status === 'PAUSED') {
    return subscription.pausedUntil
      ? `Paused until ${new Date(subscription.pausedUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
      : 'Paused indefinitely';
  }
  if (subscription.status === 'PENDING') return 'Waiting for the kitchen to confirm';
  if (subscription.status === 'ACTIVE') {
    const days =
      subscription.deliveryDays.length === 7 ? 'Every day' : `${subscription.deliveryDays.length}x/week`;
    return `${days} · ${humanizeEnum(subscription.deliveryTime)} · ${formatCurrency(subscription.pricePerCycle)}/${subscription.billingCycle === 'WEEKLY' ? 'week' : 'month'}`;
  }
  return humanizeEnum(subscription.status);
}

/**
 * The Subscriptions hub — one of the two toggle states inside
 * `OrdersAndSubscriptions`, which is what the "Orders" tab actually renders.
 * Deliberately plain (no `Screen`/safe-area handling of its own): the parent
 * toggle screen owns the top chrome.
 */
const Subscriptions = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { data, isLoading, isRefetching, refetch } = useCustomerSubscriptions();
  const bulkPause = useBulkPauseSubscriptions();

  const vacationSheetRef = useRef<SheetHandle>(null);
  const [vacationDays, setVacationDays] = useState(7);

  const subscriptions = data ?? [];
  const hasActive = subscriptions.some((item) => item.status === 'ACTIVE');

  const handleVacationConfirm = () => {
    bulkPause.mutate(vacationDays, {
      onSuccess: (result) => {
        vacationSheetRef.current?.close();
        const until = new Date(result.pausedUntil).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        });
        Alert.alert(
          'Paused for vacation',
          `${result.pausedCount} subscription${result.pausedCount === 1 ? '' : 's'} paused until ${until}.`,
        );
      },
      onError: (error) =>
        Alert.alert('Could not pause', error instanceof ApiError ? error.message : 'Please try again.'),
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={theme.text.h1}>Subscriptions</Text>
          <Text style={[theme.text.bodySmall, styles.subtitle]}>Your recurring meal plans, in one place</Text>
        </View>
        <AppBarAction
          accessibilityLabel="Set up a new subscription"
          onPress={() => navigation.navigate('SetupPlanChooseKitchen')}
        >
          <Plus size={20} color={theme.colors.primary[600]} strokeWidth={2.4} />
        </AppBarAction>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <Skeleton height={124} radius={theme.radius.card} />
          <Skeleton height={124} radius={theme.radius.card} />
        </View>
      ) : (
        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, subscriptions.length === 0 ? styles.listEmpty : null]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isLoading}
              onRefresh={refetch}
              tintColor={theme.colors.primary[600]}
              colors={[theme.colors.primary[600]]}
            />
          }
          ListHeaderComponent={
            hasActive ? (
              <Card style={styles.vacationCard} padding="md">
                <View style={styles.vacationRow}>
                  <View style={styles.vacationIcon}>
                    <CalendarOff size={18} color={theme.colors.primary[600]} strokeWidth={2} />
                  </View>
                  <View style={styles.vacationTextWrap}>
                    <Text style={theme.text.h4}>Going away?</Text>
                    <Text style={[theme.text.bodySmall, styles.vacationSubtitle]}>
                      Pause all your active subscriptions for a vacation
                    </Text>
                  </View>
                </View>
                <Button
                  title="Pause All for Vacation"
                  variant="outline"
                  size="sm"
                  onPress={() => vacationSheetRef.current?.open()}
                  style={styles.vacationButton}
                />
              </Card>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon={<CalendarClock size={36} color={theme.colors.primary[600]} strokeWidth={1.8} />}
              title="No subscriptions yet"
              description="Set up a recurring plan with a kitchen you love and never think about today's meal again."
              actionLabel="Set Up a Subscription"
              onAction={() => navigation.navigate('SetupPlanChooseKitchen')}
            />
          }
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() => navigation.navigate('ManageSubscription', { subscriptionId: item.id })}
            >
              <View style={styles.cardRow}>
                {item.kitchen.logoUrl ? (
                  <Image source={{ uri: item.kitchen.logoUrl }} style={styles.logo} resizeMode="cover" />
                ) : (
                  <View style={[styles.logo, styles.logoFallback]} />
                )}
                <View style={styles.cardText}>
                  <Text style={theme.text.h4} numberOfLines={1}>
                    {item.kitchen.name}
                  </Text>
                  <Text style={[theme.text.bodySmall, styles.planName]} numberOfLines={1}>
                    {item.planName}
                  </Text>
                  <Text style={[theme.text.caption, styles.hint]} numberOfLines={1}>
                    {nextDeliveryHint(item)}
                  </Text>
                </View>
                <Badge label={humanizeEnum(item.status)} tone={STATUS_TONE[item.status]} />
              </View>
            </Card>
          )}
        />
      )}

      <Sheet ref={vacationSheetRef} title="Pause for vacation" eyebrow="Vacation mode" heightRatio={0.42}>
        <View style={styles.sheetBody}>
          <Text style={[theme.text.bodySmall, styles.sheetHint]}>
            Every active subscription pauses together and resumes automatically on the date below.
          </Text>
          <View style={styles.dayChipsRow}>
            {VACATION_DAY_OPTIONS.map((days) => (
              <Chip
                key={days}
                label={`${days} days`}
                selected={vacationDays === days}
                onPress={() => setVacationDays(days)}
              />
            ))}
          </View>
          <Button
            title={bulkPause.isPending ? 'Pausing…' : `Pause for ${vacationDays} days`}
            onPress={handleVacationConfirm}
            loading={bulkPause.isPending}
            style={styles.sheetSubmit}
          />
        </View>
      </Sheet>
    </View>
  );
};

export default Subscriptions;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  headerTextWrap: {
    flex: 1,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  loading: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  list: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  vacationCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface.brandWash,
  },
  vacationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  vacationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacationTextWrap: {
    flex: 1,
  },
  vacationSubtitle: {
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  vacationButton: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface.base,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutral[100],
  },
  logoFallback: {
    backgroundColor: theme.colors.primary[100],
  },
  cardText: {
    flex: 1,
  },
  planName: {
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  hint: {
    color: theme.colors.text.tertiary,
    marginTop: 4,
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
    gap: theme.spacing.sm,
  },
  sheetSubmit: {
    marginTop: theme.spacing.xl,
  },
});
