import React, { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CalendarDays, CheckCircle2, MessageCircle, Pause, Phone, Play, SquarePen, XCircle } from 'lucide-react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, Avatar, Badge, Button, Card, EmptyState, FoodTypeDot, Input, Screen, Sheet, Skeleton, Text } from '@components/ui';
import type { SheetHandle } from '@components/ui';
import type { BadgeTone } from '@components/ui';
import type { KitchenPartnerNavigation, KitchenPartnerStackParamList } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import {
  useApproveSubscription,
  useDispatchDelivery,
  usePauseSubscription,
  useRejectSubscription,
  useResumeSubscription,
  useSkipDelivery,
  useSubscriptionDetail,
} from '../hooks/useKitchenPortal';
import type { DeliveryScheduleEntry, SubscriptionStatus } from '../kitchenPartner.types';

type SubscriberDetailRoute = RouteProp<KitchenPartnerStackParamList, 'SubscriberDetail'>;

const STATUS_TONE: Record<SubscriptionStatus, BadgeTone> = {
  PENDING: 'warning',
  ACTIVE: 'accent',
  PAUSED: 'neutral',
  CANCELLED: 'danger',
  REJECTED: 'danger',
};

const DELIVERY_STATUS_COLOR: Record<DeliveryScheduleEntry['status'], string> = {
  SCHEDULED: theme.colors.neutral[300],
  DISPATCHED: theme.colors.accent[600],
  SKIPPED: theme.colors.state.error,
};

function formatRupees(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

const SubscriberDetail = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const route = useRoute<SubscriberDetailRoute>();
  const { subscriptionId } = route.params;

  const query = useSubscriptionDetail(subscriptionId);
  const approveSubscription = useApproveSubscription();
  const rejectSubscription = useRejectSubscription();
  const pauseSubscription = usePauseSubscription();
  const resumeSubscription = useResumeSubscription();
  const dispatchDelivery = useDispatchDelivery();
  const skipDelivery = useSkipDelivery();

  const rejectSheetRef = useRef<SheetHandle>(null);
  const skipSheetRef = useRef<SheetHandle>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [skipReason, setSkipReason] = useState('');

  const subscription = query.data;
  const today = subscription?.deliverySchedule?.[0];

  const handleApprove = () => {
    approveSubscription.mutate(subscriptionId, {
      onError: (error) => Alert.alert('Could not approve', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  const submitReject = () => {
    if (!rejectReason.trim()) {
      Alert.alert('Reason required', 'Let the customer know why this plan was rejected.');
      return;
    }
    rejectSubscription.mutate(
      { id: subscriptionId, reason: rejectReason.trim() },
      {
        onSuccess: () => rejectSheetRef.current?.close(),
        onError: (error) => Alert.alert('Could not reject', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  const handlePause = () => {
    pauseSubscription.mutate(subscriptionId, {
      onError: (error) => Alert.alert('Could not pause', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  const handleResume = () => {
    resumeSubscription.mutate(subscriptionId, {
      onError: (error) => Alert.alert('Could not resume', error instanceof KitchenApiError ? error.message : 'Please try again.'),
    });
  };

  const handleDispatch = () => {
    if (!today) return;
    dispatchDelivery.mutate(
      { id: subscriptionId, date: today.date },
      {
        onError: (error) => Alert.alert('Could not dispatch', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  const submitSkip = () => {
    if (!today) return;
    skipDelivery.mutate(
      { id: subscriptionId, date: today.date, reason: skipReason.trim() || undefined },
      {
        onSuccess: () => {
          skipSheetRef.current?.close();
          setSkipReason('');
        },
        onError: (error) => Alert.alert('Could not skip', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  return (
    <Screen background="page">
      <AppBar title={subscription?.customer.fullName || 'Subscriber'} onBack={() => navigation.goBack()} />

      {query.isLoading ? (
        <View style={styles.scroll}>
          <Skeleton height={160} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.md }} />
          <Skeleton height={100} radius={theme.radius.card} />
        </View>
      ) : query.isError || !subscription ? (
        <EmptyState title="Something went wrong" description="We couldn't load this subscriber." actionLabel="Retry" onAction={() => query.refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.headerCard}>
            <View style={styles.customerRow}>
              <Avatar uri={subscription.customer.profileImage} name={subscription.customer.fullName} size={48} />
              <View style={styles.customerInfo}>
                <Text variant="bodyMedium">{subscription.customer.fullName || 'Customer'}</Text>
                <View style={styles.phoneRow}>
                  <Phone size={11} color={theme.colors.brand.primary} />
                  <Text variant="caption" color="secondary">
                    {subscription.customer.phone}
                  </Text>
                </View>
              </View>
              <Badge label={subscription.status} tone={STATUS_TONE[subscription.status]} size="sm" />
            </View>

            <View style={styles.planDivider} />

            <Text variant="h4">{subscription.planName}</Text>
            <View style={styles.planMetaRow}>
              <FoodTypeDot type={subscription.foodType} size={13} />
              <Text variant="bodySmall" color="secondary">
                {subscription.mealsPerDay}× daily · {titleCase(subscription.deliveryTime)} · {formatRupees(subscription.pricePerCycle)}/
                {subscription.billingCycle === 'WEEKLY' ? 'week' : 'month'}
              </Text>
            </View>
            <View style={styles.daysRow}>
              {subscription.deliveryDays.map((day) => (
                <View key={day} style={styles.dayPill}>
                  <Text variant="caption" color="secondary">
                    {day.slice(0, 3)}
                  </Text>
                </View>
              ))}
            </View>

            {subscription.specialInstructions ? (
              <Text variant="bodySmall" color="secondary" style={styles.specialInstructions}>
                "{subscription.specialInstructions}"
              </Text>
            ) : null}

            {subscription.status === 'REJECTED' && subscription.rejectionReason ? (
              <View style={styles.rejectionNotice}>
                <XCircle size={13} color={theme.colors.state.error} />
                <Text variant="bodySmall" style={styles.rejectionText}>
                  {subscription.rejectionReason}
                </Text>
              </View>
            ) : null}

            {subscription.status === 'PENDING' ? (
              <View style={styles.actionsRow}>
                <Button title="Approve" size="sm" style={styles.actionButton} onPress={handleApprove} loading={approveSubscription.isPending} />
                <Button
                  title="Reject"
                  size="sm"
                  variant="outline"
                  style={styles.actionButton}
                  onPress={() => rejectSheetRef.current?.open()}
                  disabled={approveSubscription.isPending}
                />
              </View>
            ) : subscription.status === 'ACTIVE' || subscription.status === 'PAUSED' ? (
              <View style={styles.actionsRow}>
                {subscription.status === 'ACTIVE' ? (
                  <TouchableOpacity onPress={handlePause} disabled={pauseSubscription.isPending} style={styles.iconAction}>
                    <Pause size={14} color={theme.colors.text.secondary} />
                    <Text variant="label" color="secondary">
                      Pause
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleResume} disabled={resumeSubscription.isPending} style={styles.iconAction}>
                    <Play size={14} color={theme.colors.brand.primary} />
                    <Text variant="label" color="brand">
                      Resume
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            <View style={styles.comingSoonRow}>
              <View style={styles.comingSoonButton}>
                <MessageCircle size={12} color={theme.colors.text.disabled} />
                <Text variant="caption" style={styles.comingSoonText}>
                  Message
                </Text>
              </View>
              <View style={styles.comingSoonButton}>
                <SquarePen size={12} color={theme.colors.text.disabled} />
                <Text variant="caption" style={styles.comingSoonText}>
                  Edit plan
                </Text>
              </View>
              <Text variant="caption" color="tertiary" style={styles.comingSoonLabel}>
                Coming soon
              </Text>
            </View>
          </Card>

          <Card style={styles.scheduleCard}>
            <View style={styles.sectionHeaderRow}>
              <CalendarDays size={14} color={theme.colors.text.secondary} />
              <Text variant="overline" color="tertiary">
                DELIVERY SCHEDULE
              </Text>
            </View>
            <View style={styles.scheduleStrip}>
              {subscription.deliverySchedule.map((entry, index) => (
                <View key={entry.date} style={styles.scheduleCell}>
                  <Text variant="caption" color="tertiary">
                    {new Date(entry.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                  </Text>
                  <View style={[styles.scheduleDot, { backgroundColor: DELIVERY_STATUS_COLOR[entry.status] }]}>
                    <Text variant="label" style={{ color: theme.colors.text.inverse }}>
                      {new Date(entry.date).getDate()}
                    </Text>
                  </View>
                  <Text variant="caption" color="tertiary">
                    {index === 0 ? 'Today' : entry.status === 'SCHEDULED' ? '' : titleCase(entry.status)}
                  </Text>
                </View>
              ))}
            </View>

            {today && today.status === 'SCHEDULED' ? (
              <View style={styles.todayActionsRow}>
                <Button
                  title="Dispatch today"
                  size="sm"
                  style={styles.actionButton}
                  leftIcon={<CheckCircle2 size={14} color={theme.colors.palette.white} />}
                  onPress={handleDispatch}
                  loading={dispatchDelivery.isPending}
                />
                <Button
                  title="Skip"
                  size="sm"
                  variant="outline"
                  style={styles.actionButton}
                  onPress={() => skipSheetRef.current?.open()}
                  disabled={dispatchDelivery.isPending}
                />
              </View>
            ) : today ? (
              <Text variant="bodySmall" color="secondary" style={styles.todayStatusNote}>
                Today's delivery is {today.status.toLowerCase()}
                {today.skipReason ? ` — ${today.skipReason}` : ''}.
              </Text>
            ) : null}
          </Card>

          {subscription.billingHistory.length > 0 ? (
            <Card style={styles.chartCard}>
              <Text variant="overline" color="tertiary" style={styles.chartLabel}>
                BILLING HISTORY
              </Text>
              <BarChart
                data={subscription.billingHistory.map((entry) => ({
                  value: entry.amount,
                  label: new Date(entry.cycleStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                  frontColor: theme.colors.brand.primary,
                }))}
                height={140}
                barWidth={24}
                barBorderRadius={6}
                spacing={24}
                initialSpacing={16}
                endSpacing={8}
                hideRules
                hideYAxisText
                xAxisColor={theme.colors.borders.subtle}
                xAxisLabelTextStyle={styles.chartAxisLabel}
                noOfSections={3}
                adjustToWidth
              />
            </Card>
          ) : null}
        </ScrollView>
      )}

      <Sheet ref={rejectSheetRef} title="Reject subscription">
        <View style={styles.sheetBody}>
          <Text style={styles.sheetHint}>Let the customer know why — this is shown to them along with the rejection.</Text>
          <Input
            label="Reason"
            value={rejectReason}
            onChangeText={setRejectReason}
            placeholder="e.g. Can't accommodate this delivery time"
            multiline
            containerStyle={styles.sheetInput}
          />
          <Button title={rejectSubscription.isPending ? 'Rejecting…' : 'Reject subscription'} variant="danger" onPress={submitReject} loading={rejectSubscription.isPending} />
        </View>
      </Sheet>

      <Sheet ref={skipSheetRef} title="Skip today's delivery">
        <View style={styles.sheetBody}>
          <Text style={styles.sheetHint}>Optional — let the customer know why today's delivery is being skipped.</Text>
          <Input
            label="Reason (optional)"
            value={skipReason}
            onChangeText={setSkipReason}
            placeholder="e.g. Public holiday"
            multiline
            containerStyle={styles.sheetInput}
          />
          <Button title={skipDelivery.isPending ? 'Skipping…' : 'Skip delivery'} variant="danger" onPress={submitSkip} loading={skipDelivery.isPending} />
        </View>
      </Sheet>
    </Screen>
  );
};

export default SubscriberDetail;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.xxl },
  headerCard: { marginBottom: theme.spacing.paddings.md },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm },
  customerInfo: { flex: 1 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  planDivider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.borders.subtle, marginVertical: theme.spacing.paddings.md },
  planMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: theme.spacing.paddings.xs },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: theme.spacing.paddings.sm },
  dayPill: { paddingHorizontal: theme.spacing.paddings.sm, paddingVertical: 4, borderRadius: theme.radius.pill, backgroundColor: theme.colors.neutral[100] },
  specialInstructions: { marginTop: theme.spacing.paddings.sm, fontStyle: 'italic' },
  rejectionNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: theme.spacing.paddings.sm,
    padding: theme.spacing.paddings.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.state.errorBg,
  },
  rejectionText: { color: theme.colors.state.error, flex: 1 },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.paddings.sm,
    marginTop: theme.spacing.paddings.md,
    paddingTop: theme.spacing.paddings.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  actionButton: { flex: 1 },
  iconAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  comingSoonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.paddings.md,
    marginTop: theme.spacing.paddings.md,
    paddingTop: theme.spacing.paddings.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  comingSoonButton: { flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.5 },
  comingSoonText: { color: theme.colors.text.disabled },
  comingSoonLabel: { marginLeft: 'auto', fontStyle: 'italic' },
  scheduleCard: { marginBottom: theme.spacing.paddings.md },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: theme.spacing.paddings.md },
  scheduleStrip: { flexDirection: 'row', justifyContent: 'space-between' },
  scheduleCell: { alignItems: 'center', gap: 4, flex: 1 },
  scheduleDot: { width: 30, height: 30, borderRadius: theme.radius.round, alignItems: 'center', justifyContent: 'center' },
  todayActionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.paddings.sm,
    marginTop: theme.spacing.paddings.md,
    paddingTop: theme.spacing.paddings.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  todayStatusNote: {
    marginTop: theme.spacing.paddings.md,
    paddingTop: theme.spacing.paddings.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  chartCard: { marginBottom: theme.spacing.paddings.md },
  chartLabel: { marginBottom: theme.spacing.paddings.sm },
  chartAxisLabel: { color: theme.colors.text.tertiary, fontSize: 10 },
  sheetBody: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  sheetHint: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginBottom: theme.spacing.paddings.md },
  sheetInput: { marginBottom: theme.spacing.paddings.lg },
});
