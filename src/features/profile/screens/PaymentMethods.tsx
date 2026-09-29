import React, { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  CreditCard,
  Plus,
  Smartphone,
  Star,
  Trash2,
  Wallet as WalletIcon,
} from 'lucide-react-native';
import { useTheme } from '@app/theme/useTheme';
import { formatCurrency } from '@utils/format';
import { ApiError } from '@api';
import type { CardBrand, SavedCard, UpiPaymentMethod } from '@api/types';
import { AppBar, AppBarAction, Button, Card, Divider, Input, ListItem, Screen, Sheet, Skeleton } from '@components/ui';
import type { SheetHandle } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useWalletSummary } from '@features/wallet/hooks/useWallet';
import {
  useAddUpi,
  useRemoveCard,
  useRemoveUpi,
  useSavedCards,
  useSetDefaultCard,
  useSetDefaultUpi,
  useUpiMethods,
} from '../hooks/usePaymentMethods';

const CARD_BRAND_LABEL: Record<CardBrand, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  RUPAY: 'RuPay',
  AMEX: 'Amex',
  DINERS: 'Diners Club',
  UNKNOWN: 'Card',
};

/**
 * Cards, UPI IDs and the wallet balance, in one place. Cards are read/select/
 * remove only — there's no payment-gateway SDK wired into the app yet, so
 * "Add Card" can't actually tokenise and save anything real (see the Alert
 * below). UPI is fully real: add/select/remove all write to the backend.
 */
const PaymentMethods = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const theme = useTheme();

  const cards = useSavedCards();
  const setDefaultCard = useSetDefaultCard();
  const removeCard = useRemoveCard();

  const upi = useUpiMethods();
  const setDefaultUpi = useSetDefaultUpi();
  const removeUpi = useRemoveUpi();

  const walletSummary = useWalletSummary();

  const addUpiSheetRef = useRef<SheetHandle>(null);

  const handleAddCard = () => {
    Alert.alert(
      'Card linking is coming soon',
      "We're still wiring up secure card tokenisation — you'll be able to add a card here shortly. UPI and Wallet both work today.",
    );
  };

  const handleRemoveCard = (card: SavedCard) => {
    Alert.alert('Remove this card?', `${CARD_BRAND_LABEL[card.brand]} ${card.maskedNumber}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          removeCard.mutate(card.id, {
            onError: (error) =>
              Alert.alert(
                'Could not remove card',
                error instanceof ApiError ? error.message : 'Please try again.',
              ),
          }),
      },
    ]);
  };

  const handleRemoveUpi = (method: UpiPaymentMethod) => {
    Alert.alert('Remove this UPI ID?', method.vpa, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          removeUpi.mutate(method.id, {
            onError: (error) =>
              Alert.alert(
                'Could not remove UPI ID',
                error instanceof ApiError ? error.message : 'Please try again.',
              ),
          }),
      },
    ]);
  };

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <Screen background="page">
      <AppBar title="Payment Methods" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[theme.text.overline, styles.sectionLabel]}>SAVED CARDS</Text>
        {cards.isLoading ? (
          <Skeleton height={72} radius={theme.radius.card} />
        ) : (
          <Card padding="none" elevation="xs">
            {cards.data?.map((card, index) => (
              <View key={card.id}>
                {index > 0 ? <Divider spacing={0} /> : null}
                <ListItem
                  title={`${CARD_BRAND_LABEL[card.brand]} ${card.maskedNumber}`}
                  subtitle={
                    card.isExpired
                      ? `Expired ${card.expiry}`
                      : `Expires ${card.expiry}${card.isDefault ? ' · Default' : ''}`
                  }
                  icon={<CreditCard size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />}
                  onPress={
                    card.isDefault ? undefined : () => setDefaultCard.mutate(card.id)
                  }
                  right={
                    <View style={styles.rowActions}>
                      {card.isDefault ? (
                        <Star size={16} color={theme.colors.amber[500]} fill={theme.colors.amber[500]} />
                      ) : null}
                      <AppBarAction
                        onPress={() => handleRemoveCard(card)}
                        accessibilityLabel={`Remove ${CARD_BRAND_LABEL[card.brand]} card ending ${card.last4}`}
                      >
                        <Trash2 size={17} color={theme.colors.state.error} strokeWidth={2.2} />
                      </AppBarAction>
                    </View>
                  }
                />
              </View>
            ))}
            <Divider spacing={0} />
            <ListItem
              title="Add Card"
              icon={<Plus size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />}
              onPress={handleAddCard}
            />
          </Card>
        )}

        <Text style={[theme.text.overline, styles.sectionLabel]}>UPI IDs</Text>
        {upi.isLoading ? (
          <Skeleton height={72} radius={theme.radius.card} />
        ) : (
          <Card padding="none" elevation="xs">
            {upi.data?.map((method, index) => (
              <View key={method.id}>
                {index > 0 ? <Divider spacing={0} /> : null}
                <ListItem
                  title={method.vpa}
                  subtitle={
                    method.label
                      ? `${method.label}${method.isDefault ? ' · Default' : ''}`
                      : method.isDefault
                      ? 'Default'
                      : undefined
                  }
                  icon={<Smartphone size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />}
                  onPress={
                    method.isDefault ? undefined : () => setDefaultUpi.mutate(method.id)
                  }
                  right={
                    <View style={styles.rowActions}>
                      {method.isDefault ? (
                        <Star size={16} color={theme.colors.amber[500]} fill={theme.colors.amber[500]} />
                      ) : null}
                      <AppBarAction
                        onPress={() => handleRemoveUpi(method)}
                        accessibilityLabel={`Remove UPI ID ${method.vpa}`}
                      >
                        <Trash2 size={17} color={theme.colors.state.error} strokeWidth={2.2} />
                      </AppBarAction>
                    </View>
                  }
                />
              </View>
            ))}
            <Divider spacing={0} />
            <ListItem
              title="Add UPI ID"
              icon={<Plus size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />}
              onPress={() => addUpiSheetRef.current?.open()}
            />
          </Card>
        )}

        <Text style={[theme.text.overline, styles.sectionLabel]}>WALLET</Text>
        {walletSummary.isLoading ? (
          <Skeleton height={72} radius={theme.radius.card} />
        ) : (
          <Card padding="none" elevation="xs">
            <ListItem
              title="FreshBhoj Wallet"
              subtitle={`Balance: ${formatCurrency(walletSummary.data?.balanceRs ?? 0)}`}
              icon={<WalletIcon size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />}
              onPress={() => navigation.navigate('Wallet')}
            />
          </Card>
        )}

        <Button title="Done" variant="outline" onPress={navigation.goBack} style={styles.doneButton} />
      </ScrollView>

      <AddUpiSheet sheetRef={addUpiSheetRef} />
    </Screen>
  );
};

function AddUpiSheet({ sheetRef }: { sheetRef: React.RefObject<SheetHandle | null> }) {
  const theme = useTheme();
  const addUpi = useAddUpi();
  const [vpa, setVpa] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | undefined>();

  const reset = () => {
    setVpa('');
    setLabel('');
    setError(undefined);
    addUpi.reset();
  };

  const handleSubmit = () => {
    const trimmed = vpa.trim();
    if (!trimmed) {
      setError('Enter a UPI ID, e.g. name@bank');
      return;
    }
    setError(undefined);
    addUpi.mutate(
      { vpa: trimmed, label: label.trim() || undefined },
      {
        onSuccess: () => sheetRef.current?.close(),
        onError: (err) => {
          setError(err instanceof ApiError ? err.message : 'Could not add this UPI ID. Please try again.');
        },
      },
    );
  };

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <Sheet ref={sheetRef} title="Add UPI ID" heightRatio={0.5} onClose={reset}>
      <View style={styles.sheetContent}>
        <Input
          label="UPI ID"
          value={vpa}
          onChangeText={(text) => {
            setVpa(text);
            if (error) setError(undefined);
          }}
          placeholder="yourname@bank"
          autoCapitalize="none"
          autoCorrect={false}
          error={error}
          autoFocus
          containerStyle={styles.sheetField}
        />
        <Input
          label="Label (optional)"
          value={label}
          onChangeText={setLabel}
          placeholder="e.g. Google Pay"
          containerStyle={styles.sheetField}
        />
        <Button
          title={addUpi.isPending ? 'Saving…' : 'Save UPI ID'}
          onPress={handleSubmit}
          loading={addUpi.isPending}
          disabled={addUpi.isPending || !vpa.trim()}
          style={styles.sheetSubmit}
        />
      </View>
    </Sheet>
  );
}

export default PaymentMethods;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    scroll: {
      paddingHorizontal: theme.layout.screenPadding,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xxxl,
    },
    sectionLabel: {
      color: theme.colors.text.tertiary,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
    },
    rowActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    doneButton: {
      marginTop: theme.spacing.xl,
    },
    sheetContent: {
      paddingHorizontal: theme.layout.screenPadding,
    },
    sheetField: {
      marginBottom: theme.spacing.lg,
    },
    sheetSubmit: {
      marginTop: theme.spacing.md,
    },
  });
