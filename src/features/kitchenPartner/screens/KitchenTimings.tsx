import React, { useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { ChevronDown, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, Button, Card, EmptyState, Input, Screen, Skeleton, Text } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import {
  useAddHoliday,
  useKitchenProfile,
  useOperatingHours,
  useRemoveHoliday,
  useSetAcceptingOrders,
  useUpdateWeeklyHours,
} from '../hooks/useKitchenPortal';
import type { DayOfWeek, OperatingHoursHoliday, OperatingHoursWeeklyRow } from '../kitchenPartner.types';

const DAY_ORDER: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_NAMES: Record<DayOfWeek, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** `YYYY-MM-DD` that is a real calendar day (rejects 2026-02-31). Pure UTC maths so the device time zone can't skew it. */
function isRealCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const check = new Date(Date.UTC(year, month - 1, day));
  return check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day;
}

function summarizeDay(day: { isClosed: boolean; session1Start: string | null; session1End: string | null; session2Start: string | null; session2End: string | null }) {
  if (day.isClosed) return 'Closed';
  const parts: string[] = [];
  if (day.session1Start && day.session1End) parts.push(`${day.session1Start}–${day.session1End}`);
  if (day.session2Start && day.session2End) parts.push(`${day.session2Start}–${day.session2End}`);
  return parts.length ? parts.join(', ') : 'No hours set';
}

const KitchenTimings = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const profile = useKitchenProfile();
  const setAccepting = useSetAcceptingOrders();
  const hours = useOperatingHours();

  return (
    <Screen background="page">
      <AppBar title="Operating Hours" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={hours.isRefetching}
            onRefresh={() => {
              hours.refetch();
              profile.refetch();
            }}
            tintColor={theme.colors.primary[600]}
          />
        }
      >
        <Card style={styles.emergencyCard} padding="md" bordered>
          <View style={styles.emergencyRow}>
            <View style={styles.emergencyText}>
              <Text variant="label">Emergency Close</Text>
              <Text variant="caption" color="secondary" style={styles.emergencyHint}>
                Stop all incoming orders immediately for today.
              </Text>
            </View>
            <Switch
              value={profile.data?.isAcceptingOrders ?? true}
              onValueChange={(value) =>
                setAccepting.mutate(value, {
                  onError: (error) =>
                    Alert.alert('Could not update status', error instanceof KitchenApiError ? error.message : 'Please try again.'),
                })
              }
              disabled={setAccepting.isPending || profile.isLoading}
              trackColor={{ true: theme.colors.brand.primary }}
            />
          </View>
        </Card>

        <Text variant="overline" color="tertiary" style={styles.sectionLabel}>
          WEEKLY HOURS
        </Text>
        {hours.isError ? (
          <EmptyState title="Couldn't load hours" description="Check your connection and try again." actionLabel="Retry" onAction={() => hours.refetch()} />
        ) : hours.isLoading || !hours.data ? (
          <>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={56} radius={theme.radius.card} style={styles.rowSkeleton} />
            ))}
          </>
        ) : (
          [...hours.data.weekly]
            .sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek))
            .map((day) => <DayCard key={day.id} day={day} />)
        )}

        <Text variant="overline" color="tertiary" style={styles.sectionLabel}>
          HOLIDAYS
        </Text>
        {hours.data ? <HolidaysSection holidays={hours.data.holidays} /> : null}
      </ScrollView>
    </Screen>
  );
};

function DayCard({ day }: { day: OperatingHoursWeeklyRow }) {
  const updateDay = useUpdateWeeklyHours();
  const [expanded, setExpanded] = useState(false);
  const [isClosed, setIsClosed] = useState(day.isClosed);
  const [s1Start, setS1Start] = useState(day.session1Start ?? '');
  const [s1End, setS1End] = useState(day.session1End ?? '');
  const [s2Start, setS2Start] = useState(day.session2Start ?? '');
  const [s2End, setS2End] = useState(day.session2End ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClosed(day.isClosed);
    setS1Start(day.session1Start ?? '');
    setS1End(day.session1End ?? '');
    setS2Start(day.session2Start ?? '');
    setS2End(day.session2End ?? '');
  }, [day.isClosed, day.session1Start, day.session1End, day.session2Start, day.session2End]);

  const isDirty =
    isClosed !== day.isClosed ||
    s1Start !== (day.session1Start ?? '') ||
    s1End !== (day.session1End ?? '') ||
    s2Start !== (day.session2Start ?? '') ||
    s2End !== (day.session2End ?? '');

  const validate = (): string | null => {
    if ((s1Start && !s1End) || (!s1Start && s1End)) return 'Session 1 needs both a start and end time.';
    if ((s2Start && !s2End) || (!s2Start && s2End)) return 'Session 2 needs both a start and end time.';
    for (const value of [s1Start, s1End, s2Start, s2End]) {
      if (value && !TIME_RE.test(value)) return 'Use 24-hour HH:mm format, e.g. 09:00.';
    }
    return null;
  };

  const handleSave = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    updateDay.mutate(
      {
        dayOfWeek: day.dayOfWeek,
        input: {
          isClosed,
          session1Start: s1Start || undefined,
          session1End: s1End || undefined,
          session2Start: s2Start || undefined,
          session2End: s2End || undefined,
        },
      },
      {
        onSuccess: () => setExpanded(false),
        onError: (apiError) =>
          Alert.alert('Could not save', apiError instanceof KitchenApiError ? apiError.message : 'Please try again.'),
      },
    );
  };

  return (
    <Card style={styles.dayCard} bordered>
      <Pressable onPress={() => setExpanded((e) => !e)} style={styles.dayHeaderRow} accessibilityRole="button">
        <Text variant="label">{DAY_NAMES[day.dayOfWeek] ?? day.dayOfWeek}</Text>
        <View style={styles.dayHeaderRight}>
          <Text variant="caption" color={isClosed ? 'danger' : 'secondary'}>
            {summarizeDay(day)}
          </Text>
          <ChevronDown
            size={16}
            color={theme.colors.text.tertiary}
            style={expanded ? styles.chevronOpen : undefined}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.dayBody}>
          <View style={styles.closedRow}>
            <Text variant="label">Closed all day</Text>
            <Switch value={isClosed} onValueChange={setIsClosed} trackColor={{ true: theme.colors.brand.primary }} />
          </View>

          {!isClosed ? (
            <>
              <SessionInputs label="Session 1" start={s1Start} end={s1End} onStart={setS1Start} onEnd={setS1End} />
              <SessionInputs label="Session 2 (optional)" start={s2Start} end={s2End} onStart={setS2Start} onEnd={setS2End} />
            </>
          ) : null}

          {error ? (
            <Text variant="caption" color="danger" style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          <Button
            title={updateDay.isPending ? 'Saving…' : 'Save'}
            size="sm"
            fullWidth={false}
            loading={updateDay.isPending}
            disabled={!isDirty || updateDay.isPending}
            onPress={handleSave}
            style={styles.saveButton}
          />
        </View>
      ) : null}
    </Card>
  );
}

function SessionInputs({
  label,
  start,
  end,
  onStart,
  onEnd,
}: {
  label: string;
  start: string;
  end: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
}) {
  return (
    <View style={styles.sessionWrap}>
      <Text variant="caption" color="secondary" style={styles.sessionLabel}>
        {label}
      </Text>
      <View style={styles.sessionRow}>
        <Input value={start} onChangeText={onStart} placeholder="09:00" maxLength={5} containerStyle={styles.sessionField} size="md" />
        <Text variant="bodySmall" color="tertiary">
          to
        </Text>
        <Input value={end} onChangeText={onEnd} placeholder="14:00" maxLength={5} containerStyle={styles.sessionField} size="md" />
      </View>
    </View>
  );
}

function HolidaysSection({ holidays }: { holidays: OperatingHoursHoliday[] }) {
  const addHoliday = useAddHoliday();
  const removeHoliday = useRemoveHoliday();

  const [date, setDate] = useState('');
  const [isClosed, setIsClosed] = useState(true);
  const [s1Start, setS1Start] = useState('');
  const [s1End, setS1End] = useState('');
  const [note, setNote] = useState('');

  const handleAdd = () => {
    const dateValue = date.trim();
    if (!isRealCalendarDate(dateValue)) {
      Alert.alert('Invalid date', 'Use YYYY-MM-DD, e.g. 2026-10-02.');
      return;
    }
    if ((s1Start && !s1End) || (!s1Start && s1End)) {
      Alert.alert('Incomplete hours', 'Set both a start and end time, or leave both blank.');
      return;
    }
    if ((s1Start && !TIME_RE.test(s1Start)) || (s1End && !TIME_RE.test(s1End))) {
      Alert.alert('Invalid time', 'Use 24-hour HH:mm format, e.g. 09:00.');
      return;
    }
    addHoliday.mutate(
      {
        date: dateValue,
        isClosed,
        session1Start: s1Start || undefined,
        session1End: s1End || undefined,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          setDate('');
          setS1Start('');
          setS1End('');
          setNote('');
          setIsClosed(true);
        },
        onError: (error) =>
          Alert.alert('Could not add holiday', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  const handleRemove = (holiday: OperatingHoursHoliday) => {
    Alert.alert('Remove this holiday?', holiday.date, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          removeHoliday.mutate(holiday.date, {
            onError: (error) =>
              Alert.alert('Could not remove holiday', error instanceof KitchenApiError ? error.message : 'Please try again.'),
          }),
      },
    ]);
  };

  return (
    <>
      {holidays.length === 0 ? (
        <Text variant="bodySmall" color="secondary" style={styles.noHolidaysText}>
          No holidays added yet.
        </Text>
      ) : (
        holidays.map((holiday) => (
          <Card key={holiday.id} style={styles.holidayRow} padding="md" bordered>
            <View style={styles.holidayTextWrap}>
              <Text variant="bodyMedium">{holiday.date}</Text>
              <Text variant="caption" color="secondary">
                {summarizeDay(holiday)}
                {holiday.note ? ` · ${holiday.note}` : ''}
              </Text>
            </View>
            <Pressable
              onPress={() => handleRemove(holiday)}
              hitSlop={theme.layout.hitSlop}
              accessibilityRole="button"
              accessibilityLabel={`Remove holiday ${holiday.date}`}
              style={styles.removeHolidayButton}
            >
              <Trash2 size={16} color={theme.colors.text.danger} />
            </Pressable>
          </Card>
        ))
      )}

      <Card style={styles.addHolidayCard} bordered>
        <Text variant="label" style={styles.addHolidayTitle}>
          Add a holiday
        </Text>
        <Input label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" containerStyle={styles.field} />
        <View style={styles.closedRow}>
          <Text variant="label">Closed all day</Text>
          <Switch value={isClosed} onValueChange={setIsClosed} trackColor={{ true: theme.colors.brand.primary }} />
        </View>
        {!isClosed ? <SessionInputs label="Hours" start={s1Start} end={s1End} onStart={setS1Start} onEnd={setS1End} /> : null}
        <Input label="Note (optional)" value={note} onChangeText={setNote} placeholder="e.g. Diwali" containerStyle={styles.field} />
        <Button title={addHoliday.isPending ? 'Adding…' : 'Add holiday'} size="sm" fullWidth={false} loading={addHoliday.isPending} onPress={handleAdd} />
      </Card>
    </>
  );
}

export default KitchenTimings;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.xxl },
  emergencyCard: { marginBottom: theme.spacing.paddings.lg, backgroundColor: theme.colors.amber[50] },
  emergencyRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm },
  emergencyText: { flex: 1 },
  emergencyHint: { marginTop: 2 },
  sectionLabel: { marginBottom: theme.spacing.paddings.sm, marginTop: theme.spacing.paddings.xs },
  rowSkeleton: { marginBottom: theme.spacing.paddings.sm },
  dayCard: { marginBottom: theme.spacing.paddings.sm },
  dayHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.xs },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  dayBody: { marginTop: theme.spacing.paddings.md, paddingTop: theme.spacing.paddings.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.borders.subtle },
  closedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.paddings.sm },
  sessionWrap: { marginBottom: theme.spacing.paddings.sm },
  sessionLabel: { marginBottom: theme.spacing.paddings.xs },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm },
  sessionField: { flex: 1 },
  errorText: { marginTop: theme.spacing.paddings.xs },
  saveButton: { marginTop: theme.spacing.paddings.sm, alignSelf: 'flex-end' },
  noHolidaysText: { marginBottom: theme.spacing.paddings.sm },
  holidayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.paddings.sm },
  removeHolidayButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  holidayTextWrap: { flex: 1 },
  addHolidayCard: { marginTop: theme.spacing.paddings.xs },
  addHolidayTitle: { marginBottom: theme.spacing.paddings.sm },
  field: { marginBottom: theme.spacing.paddings.md },
});
