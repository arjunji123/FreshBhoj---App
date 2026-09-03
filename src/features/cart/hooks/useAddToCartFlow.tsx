import React, { useCallback, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, View } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Button } from '@components/ui';
import type { MealCard } from '@api/types';
import type { AddCartItemInput } from '@api/endpoints/cart.api';
import { getKitchenConflict, useAddToCart } from './useCart';

interface PendingAdd extends AddCartItemInput {
  mealName: string;
  existingKitchenName: string;
}

/**
 * Add-to-cart with the one-kitchen-per-cart rule handled in one place.
 *
 * A cart that already holds another kitchen's food makes the API answer 409
 * instead of silently discarding it; this catches that, asks the user, and
 * replays the add with `replaceCart`. Render `conflictDialog` once per screen.
 */
export function useAddToCartFlow() {
  const addToCart = useAddToCart();
  const [pending, setPending] = useState<PendingAdd | null>(null);

  const add = useCallback(
    (
      meal: Pick<MealCard, 'id' | 'name' | 'isOrderable'>,
      options: Omit<AddCartItemInput, 'mealId'> = {},
      callbacks: { onSuccess?: () => void } = {},
    ) => {
      if (!meal.isOrderable) {
        Alert.alert('Not available', 'This meal cannot be ordered right now.');
        return;
      }

      addToCart.mutate(
        { mealId: meal.id, ...options },
        {
          onSuccess: () => callbacks.onSuccess?.(),
          onError: (error) => {
            const conflict = getKitchenConflict(error);
            if (conflict) {
              setPending({
                mealId: meal.id,
                mealName: meal.name,
                existingKitchenName: conflict.name,
                ...options,
              });
              return;
            }
            Alert.alert(
              'Could not add to cart',
              error instanceof Error ? error.message : 'Please try again.',
            );
          },
        },
      );
    },
    [addToCart],
  );

  const confirmReplace = useCallback(() => {
    if (!pending) return;
    // `mealName` / `existingKitchenName` are dialog copy, not request fields.
    const input: AddCartItemInput = {
      mealId: pending.mealId,
      quantity: pending.quantity,
      customizationIds: pending.customizationIds,
      specialInstructions: pending.specialInstructions,
      replaceCart: true,
    };
    setPending(null);
    addToCart.mutate(input);
  }, [pending, addToCart]);

  const conflictDialog = (
    <Modal
      visible={Boolean(pending)}
      transparent
      animationType="fade"
      onRequestClose={() => setPending(null)}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <ShoppingBag size={24} color={theme.colors.primary[600]} strokeWidth={2.2} />
          </View>

          <Text style={[theme.text.h3, styles.title]}>Start a new cart?</Text>
          <Text style={[theme.text.body, styles.body]}>
            Your cart has food from {pending?.existingKitchenName}. Adding{' '}
            {pending?.mealName} will clear it so everything arrives together and hot.
          </Text>

          <View style={styles.actions}>
            <Button
              title="Keep my cart"
              variant="outline"
              size="md"
              onPress={() => setPending(null)}
              style={styles.action}
              fullWidth={false}
            />
            <Button
              title="Start new"
              size="md"
              onPress={confirmReplace}
              style={styles.action}
              fullWidth={false}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return {
    addToCart: add,
    conflictDialog,
    isAdding: addToCart.isPending,
  };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.surface.base,
    borderRadius: theme.radius.sheet,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.elevation.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  action: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
});
