import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import { Button, Divider, QuantityStepper } from '@components/ui';
import type { MealDetail } from '@api/types';

interface CustomizationSheetProps {
  meal: MealDetail;
  isSubmitting?: boolean;
  onConfirm: (input: {
    quantity: number;
    customizationIds: string[];
    specialInstructions?: string;
  }) => void;
}

/**
 * Body of the "Add to plate" sheet: quantity, add-ons and a note for the chef.
 *
 * The running total is computed here so the button always shows what the user
 * will actually pay for this line — the server re-prices it on add, and the two
 * agree because both start from the same option `priceDelta` values.
 */
const CustomizationSheet: React.FC<CustomizationSheetProps> = ({
  meal,
  isSubmitting,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    meal.customizationGroups.flatMap((group) =>
      group.options.filter((option) => option.isDefault).map((option) => option.id),
    ),
  );
  const [instructions, setInstructions] = useState('');

  const allOptions = useMemo(
    () => meal.customizationGroups.flatMap((group) => group.options),
    [meal.customizationGroups],
  );

  const addOnTotal = useMemo(
    () =>
      allOptions
        .filter((option) => selectedIds.includes(option.id))
        .reduce((sum, option) => sum + option.priceDelta, 0),
    [allOptions, selectedIds],
  );

  const lineTotal = (meal.price + addOnTotal) * quantity;

  const toggleOption = (groupId: string, optionId: string) => {
    const group = meal.customizationGroups.find((g) => g.id === groupId);
    if (!group) return;

    setSelectedIds((current) => {
      if (current.includes(optionId)) {
        return current.filter((id) => id !== optionId);
      }

      const groupOptionIds = group.options.map((option) => option.id);
      const chosenInGroup = current.filter((id) => groupOptionIds.includes(id));

      // A single-select group swaps rather than stacks.
      if (group.maxSelect === 1) {
        return [...current.filter((id) => !groupOptionIds.includes(id)), optionId];
      }
      if (chosenInGroup.length >= group.maxSelect) {
        return current;
      }
      return [...current, optionId];
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.quantityRow}>
          <Text style={theme.text.h4}>Quantity</Text>
          <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={20} />
        </View>

        {meal.customizationGroups.map((group) => (
          <View key={group.id} style={styles.group}>
            <Divider spacing={theme.spacing.lg} />
            <View style={styles.groupHeader}>
              <Text style={[theme.text.overline, styles.groupTitle]}>{group.name}</Text>
              {group.isRequired ? (
                <Text style={[theme.text.caption, styles.required]}>Required</Text>
              ) : (
                <Text style={[theme.text.caption, styles.optional]}>
                  Optional · pick up to {group.maxSelect}
                </Text>
              )}
            </View>

            {group.options.map((option) => {
              const isSelected = selectedIds.includes(option.id);
              return (
                <Pressable
                  key={option.id}
                  onPress={() => toggleOption(group.id, option.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  style={({ pressed }) => [styles.option, pressed ? styles.pressed : null]}
                >
                  <View style={[styles.checkbox, isSelected ? styles.checkboxOn : null]}>
                    {isSelected ? (
                      <Check size={13} color={theme.colors.text.inverse} strokeWidth={3.2} />
                    ) : null}
                  </View>
                  <Text style={[theme.text.bodyLarge, styles.optionName]}>{option.name}</Text>
                  {option.priceDelta > 0 ? (
                    <Text style={[theme.text.bodyMedium, styles.optionPrice]}>
                      +{formatCurrency(option.priceDelta)}
                    </Text>
                  ) : (
                    <Text style={[theme.text.caption, styles.optionFree]}>Free</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}

        <Divider spacing={theme.spacing.lg} />

        <Text style={[theme.text.overline, styles.groupTitle]}>SPECIAL INSTRUCTIONS</Text>
        <TextInput
          value={instructions}
          onChangeText={setInstructions}
          placeholder="E.g. Make it less spicy, no onions etc."
          placeholderTextColor={theme.colors.text.tertiary}
          multiline
          maxLength={250}
          style={[theme.text.body, styles.notes]}
        />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalWrap}>
          <Text style={[theme.text.overline, styles.totalLabel]}>TOTAL PRICE</Text>
          <Text style={theme.text.h2}>{formatCurrency(lineTotal)}</Text>
        </View>

        <Button
          title="Confirm & Add"
          onPress={() =>
            onConfirm({
              quantity,
              customizationIds: selectedIds,
              specialInstructions: instructions.trim() || undefined,
            })
          }
          loading={isSubmitting}
          fullWidth={false}
          style={styles.confirmButton}
        />
      </View>
    </View>
  );
};

export default CustomizationSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  group: {
    marginTop: theme.spacing.xs,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  groupTitle: {
    color: theme.colors.text.tertiary,
  },
  required: {
    color: theme.colors.primary[600],
  },
  optional: {
    color: theme.colors.text.tertiary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.borders.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  optionName: {
    flex: 1,
    color: theme.colors.text.primary,
  },
  optionPrice: {
    color: theme.colors.text.secondary,
  },
  optionFree: {
    color: theme.colors.accent[600],
  },
  notes: {
    marginTop: theme.spacing.sm,
    minHeight: 90,
    borderRadius: theme.radius.control,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.neutral[50],
    padding: theme.spacing.md,
    textAlignVertical: 'top',
    color: theme.colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.surface.base,
  },
  totalWrap: {
    gap: 2,
  },
  totalLabel: {
    color: theme.colors.text.tertiary,
  },
  confirmButton: {
    flex: 1,
    maxWidth: 210,
  },
});
