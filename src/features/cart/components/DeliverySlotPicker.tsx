import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@components/ui';
import { CalendarClock, Zap } from 'lucide-react-native';
import { useTheme } from "@app/theme/useTheme";

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
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const slots = buildSlots(prepTimeMins);

  const isNow = value.type === 'NOW';
  const options = [
    {
      key: 'NOW' as const,
      title: 'Now',
      hint: `About ${prepTimeMins + 15} min`,
      Icon: Zap,
      selected: isNow,
      onPress: () => onChange({ type: 'NOW' }),
    },
    {
      key: 'SCHEDULED' as const,
      title: 'Schedule',
      hint: value.type === 'SCHEDULED' ? `At ${value.label}` : 'Pick a time',
      Icon: CalendarClock,
      selected: !isNow,
      onPress: () => {
        if (isNow && slots[0]) onChange({ type: 'SCHEDULED', ...slots[0] });
      },
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.options}>
        {options.map(({ key, title, hint, Icon, selected, onPress }) => (
          <Pressable
            key={key}
            onPress={onPress}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.option, selected ? styles.optionSelected : null]}
          >
            <Icon
              size={17}
              color={selected ? theme.colors.primary[600] : theme.colors.text.tertiary}
              strokeWidth={2.4}
            />
            <View style={styles.optionText}>
              <Text style={[theme.text.label, selected ? styles.optionTitleOn : styles.optionTitle]}>
                {title}
              </Text>
              <Text style={[theme.text.caption, styles.hint]} numberOfLines={1}>
                {hint}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {!isNow ? (
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
      ) : null}
    </View>
  );
};

export default DeliverySlotPicker;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  options: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.surface.page,
  },
  optionSelected: {
    borderWidth: 1,
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.surface.brandWash,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    color: theme.colors.text.primary,
  },
  optionTitleOn: {
    color: theme.colors.text.brand,
  },
  hint: {
    color: theme.colors.text.tertiary,
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  slot: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borders.default,
    backgroundColor: theme.colors.surface.raised,
  },
  slotSelected: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
});
