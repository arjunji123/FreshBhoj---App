import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowRight, Gift, PartyPopper } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { ApiError } from '@api';
import { Button } from '@components/ui';
import { useRedeemReferral } from '@features/referral/hooks/useReferral';
import { pendingReferralStore } from '@features/referral/pendingReferralStore';

interface ReferralCodeContentProps {
  onSaveAndContinue: () => void;
}

/**
 * The optional third onboarding step — asked once, right after the profile
 * basics, before location. A friend's code is worth 50 FreshBhoj Coins, but
 * nobody is blocked from continuing without one.
 */
const ReferralCodeContent: React.FC<ReferralCodeContentProps> = ({ onSaveAndContinue }) => {
  // If they arrived via a shared invite link, the code is already here.
  const [code, setCode] = useState(() => pendingReferralStore.consume() ?? '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [coinsEarned, setCoinsEarned] = useState<number | null>(null);
  const redeem = useRedeemReferral();

  const handleApply = () => {
    if (!code.trim()) return;
    setErrorMessage(null);
    redeem.mutate(code.trim(), {
      onSuccess: (result) => {
        setCoinsEarned(result.coinsEarned);
        setTimeout(onSaveAndContinue, 1100);
      },
      onError: (error) =>
        setErrorMessage(error instanceof ApiError ? error.message : 'Could not apply that code.'),
    });
  };

  if (coinsEarned !== null) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <PartyPopper size={32} color={theme.colors.primary[600]} strokeWidth={2} />
        </View>
        <Text style={[theme.text.h2, styles.title]}>+{coinsEarned} FreshBhoj Coins!</Text>
        <Text style={[theme.text.body, styles.subtitle]}>Added to your account. On to the next step…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Gift size={28} color={theme.colors.primary[600]} strokeWidth={2} />
      </View>
      <Text style={[theme.text.h2, styles.title]}>Got a referral code?</Text>
      <Text style={[theme.text.body, styles.subtitle]}>
        Enter a friend's code and you'll both get FreshBhoj Coins — totally optional.
      </Text>

      <TextInput
        value={code}
        onChangeText={(value) => {
          setErrorMessage(null);
          setCode(value.toUpperCase());
        }}
        placeholder="Enter code"
        placeholderTextColor={theme.colors.text.tertiary}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={12}
        style={styles.input}
      />

      {errorMessage ? <Text style={[theme.text.caption, styles.error]}>{errorMessage}</Text> : null}

      <View style={styles.buttonContainer}>
        <Button
          title="Apply Code"
          onPress={handleApply}
          loading={redeem.isPending}
          disabled={!code.trim()}
          rightIcon={<ArrowRight size={16} color={theme.colors.text.inverse} strokeWidth={2.6} />}
        />
      </View>

      <Text onPress={onSaveAndContinue} style={styles.skip}>
        Skip for now
      </Text>

      <View style={styles.dotsContainer}>
        <View style={styles.dotInactive} />
        <View style={styles.dotActive} />
        <View style={styles.dotInactive} />
      </View>
    </View>
  );
};

export default ReferralCodeContent;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.lg,
    alignItems: 'center',
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    width: '100%',
    marginTop: theme.spacing.xl,
    height: 52,
    borderRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.colors.borders.default,
    paddingHorizontal: theme.spacing.lg,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.extrabold,
    fontSize: theme.typography.fontSizes.xl,
    letterSpacing: 3,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  error: {
    color: theme.colors.state.error,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  buttonContainer: {
    width: '100%',
    marginTop: theme.spacing.xl,
  },
  skip: {
    ...theme.text.bodyMedium,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    textDecorationLine: 'underline',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  dotActive: {
    width: 32,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary[600],
  },
  dotInactive: {
    width: 8,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary[200],
  },
  successContainer: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.xxl,
    alignItems: 'center',
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
});
