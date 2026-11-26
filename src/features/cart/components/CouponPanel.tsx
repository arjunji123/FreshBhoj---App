import React, { useState, useMemo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ChevronDown, ChevronUp, BadgePercent } from 'lucide-react-native';
import AppGradient from '@components/AppGradient';
import { formatCurrency } from '@utils/format';
import { Text } from '@components/ui';
import type { Cart, Coupon } from '@api/types';
import { useTheme } from "@app/theme/useTheme";

interface CouponPanelProps {
  cart: Cart;
  coupons: Coupon[];
  onApply: (code: string) => void;
  onRemove: () => void;
  isApplying?: boolean;
  errorMessage?: string | null;
}

/**
 * Collapsed by default so the cart stays calm; expanding reveals both the code
 * field and the offers the current subtotal actually qualifies for.
 */
const CouponPanel: React.FC<CouponPanelProps> = ({
  cart,
  coupons,
  onApply,
  onRemove,
  isApplying,
  errorMessage,
}) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState('');

  const applied = cart.coupon.code;

  if (applied) {
    return (
      <View style={styles.appliedRow}>
        <View style={styles.appliedIcon}>
          <BadgePercent size={17} color={theme.colors.palette.white} strokeWidth={2.4} />
        </View>
        <View style={styles.appliedText}>
          <Text style={theme.text.label} numberOfLines={1}>
            {applied} applied
          </Text>
          <Text style={[theme.text.caption, styles.appliedSaving]}>
            You saved {formatCurrency(cart.coupon.discount)}
          </Text>
        </View>
        <Pressable
          onPress={onRemove}
          hitSlop={theme.layout.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Remove coupon"
        >
          <Text style={[theme.text.label, styles.removeText]}>Remove</Text>
        </Pressable>
      </View>
    );
  }

  const available = coupons.filter((c) => c.isApplicable).length;

  return (
    <View>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <AppGradient colors={theme.colors.gradients.brandSoft} style={styles.headerIcon}>
          <BadgePercent size={17} color={theme.colors.palette.white} strokeWidth={2.2} />
        </AppGradient>
        <View style={styles.headerText}>
          <Text style={theme.text.label}>Apply coupon</Text>
          {cart.coupon.invalidReason ? (
            <Text style={[theme.text.caption, styles.invalid]}>{cart.coupon.invalidReason}</Text>
          ) : (
            <Text style={[theme.text.caption, available ? styles.available : styles.hint]}>
              {available
                ? `${available} ${available === 1 ? 'offer' : 'offers'} you can use now`
                : 'Have a code? Enter it here'}
            </Text>
          )}
        </View>
        {expanded ? (
          <ChevronUp size={16} color={theme.colors.text.tertiary} strokeWidth={2.4} />
        ) : (
          <ChevronDown size={16} color={theme.colors.text.tertiary} strokeWidth={2.4} />
        )}
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          <View style={styles.inputRow}>
            <TextInput
              value={code}
              onChangeText={(value) => setCode(value.toUpperCase())}
              placeholder="Enter coupon code"
              placeholderTextColor={theme.colors.text.tertiary}
              autoCapitalize="characters"
              autoCorrect={false}
              style={[theme.text.bodyMedium, styles.input]}
            />
            <Pressable
              onPress={() => onApply(code.trim())}
              disabled={code.trim().length < 3 || isApplying}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text style={[theme.text.label, code.trim().length < 3 ? styles.applyOff : styles.applyOn]}>
                {isApplying ? 'Applying…' : 'Apply'}
              </Text>
            </Pressable>
          </View>
          {errorMessage ? <Text style={[theme.text.caption, styles.invalid]}>{errorMessage}</Text> : null}

          {coupons.map((coupon) => (
            <View key={coupon.code} style={[styles.offer, !coupon.isApplicable ? styles.offerLocked : null]}>
              <View style={styles.offerText}>
                <View style={styles.offerCode}>
                  <Text style={[theme.text.label, styles.offerCodeText]}>{coupon.code}</Text>
                </View>
                <Text style={theme.text.label}>{coupon.title}</Text>
                <Text style={[theme.text.caption, styles.hint]} numberOfLines={2}>
                  {coupon.isApplicable
                    ? coupon.description
                    : `Add ${formatCurrency(coupon.amountNeeded)} more to unlock`}
                </Text>
              </View>
              <Pressable
                onPress={() => onApply(coupon.code)}
                disabled={!coupon.isApplicable || isApplying}
                accessibilityRole="button"
                accessibilityLabel={`Apply ${coupon.code}`}
                style={[styles.offerButton, !coupon.isApplicable ? styles.offerButtonOff : null]}
              >
                <Text style={[theme.text.label, coupon.isApplicable ? styles.applyOn : styles.applyOff]}>
                  Apply
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default CouponPanel;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  appliedIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedText: {
    flex: 1,
  },
  appliedSaving: {
    color: theme.colors.text.brand,
    marginTop: 2,
  },
  removeText: {
    color: theme.colors.state.error,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  hint: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  available: {
    color: theme.colors.text.brand,
    marginTop: 2,
  },
  invalid: {
    color: theme.colors.state.error,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    height: 40,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.surface.page,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    color: theme.colors.text.primary,
  },
  applyOn: {
    color: theme.colors.text.brand,
  },
  applyOff: {
    color: theme.colors.text.disabled,
  },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borders.brand,
    backgroundColor: theme.colors.surface.brandWash,
  },
  offerLocked: {
    borderColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.surface.page,
  },
  offerText: {
    flex: 1,
    gap: 2,
  },
  offerCode: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.raised,
  },
  offerCodeText: {
    color: theme.colors.text.brand,
    fontSize: 11,
  },
  offerButton: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borders.brand,
    backgroundColor: theme.colors.surface.raised,
  },
  offerButtonOff: {
    borderColor: theme.colors.borders.subtle,
  },
});
