import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CalendarClock, Zap } from 'lucide-react-native';
import { theme } from '@app/theme/index';

export type SlotChoice = { type: 'NOW' } | { type: 'SCHEDULED'; isoTime: string; label: string };

interface DeliverySlotPickerProps {
  value: SlotChoice;
  onChange: (choice: SlotChoice) => void;
  prepTimeMins: number;
}

/** Builds the next few half-hour slots from now, skipping any already passed. */
function buildSlots(prepTimeMins: number) {
  const earliest = new Date(Date.now() + (prepTimeMins + 15) * 60_000);
  earliest.setMinutes(earliest.getMinutes() > 30 ? 60 : 30, 0, 0);

  return Array.from({ length: 4 }).map((_, index) => {
    const slot = new Date(earliest.getTime() + index * 30 * 60_000);
    return {
      isoTime: slot.toISOString(),
      label: slot.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  });
}

const DeliverySlotPicker: React.FC<DeliverySlotPickerProps> = ({
  value,
  onChange,
  prepTimeMins,
}) => {
  const slots = buildSlots(prepTimeMins);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange({ type: 'NOW' })}
        accessibilityRole="radio"
        accessibilityState={{ selected: value.type === 'NOW' }}
        style={[styles.card, value.type === 'NOW' ? styles.cardSelected : null]}
      >
        <View style={[styles.iconWrap, value.type === 'NOW' ? styles.iconWrapSelected : null]}>
          <Zap
            size={18}
            color={value.type === 'NOW' ? theme.colors.primary[600] : theme.colors.text.secondary}
            strokeWidth={2.2}
          />
        </View>
        <View style={styles.text}>
          <Text style={theme.text.h4}>Deliver now</Text>
          <Text style={[theme.text.caption, styles.hint]}>
            Arriving in about {prepTimeMins + 15} mins
          </Text>
        </View>
      </Pressable>

      <View style={styles.scheduleBlock}>
        <View style={styles.scheduleHeader}>
          <CalendarClock size={15} color={theme.colors.text.secondary} strokeWidth={2.2} />
          <Text style={[theme.text.label, styles.scheduleLabel]}>Or schedule for later</Text>
        </View>

        <View style={styles.slotRow}>
          {slots.map((slot) => {
            const isSelected = value.type === 'SCHEDULED' && value.isoTime === slot.isoTime;
            return (
              <Pressable
                key={slot.isoTime}
                onPress={() => onChange({ type: 'SCHEDULED', ...slot })}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                style={[styles.slot, isSelected ? styles.slotSelected : null]}
              >
                <Text
                  style={[
                    theme.text.caption,
                    { color: isSelected ? theme.colors.text.inverse : theme.colors.text.secondary },
                  ]}
                >
                  {slot.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default DeliverySlotPicker;

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.card,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.surface.raised,
  },
  cardSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.surface.brandWash,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.neutral[100],
  },
  iconWrapSelected: {
    backgroundColor: theme.colors.surface.base,
  },
  text: {
    flex: 1,
  },
  hint: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  scheduleBlock: {
    gap: theme.spacing.sm,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleLabel: {
    color: theme.colors.text.secondary,
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  slot: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.surface.base,
  },
  slotSelected: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
});
