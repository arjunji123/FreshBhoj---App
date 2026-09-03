import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronUp, Tag, X } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import { Button, Card, Input } from '@components/ui';
import type { Cart, Coupon } from '@api/types';

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
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState('');

  const applied = cart.coupon.code;

  if (applied) {
    return (
      <Card padding="md" elevation="xs" style={styles.appliedCard}>
        <View style={styles.appliedRow}>
          <View style={styles.appliedIcon}>
            <Tag size={16} color={theme.colors.accent[600]} strokeWidth={2.4} />
          </View>
          <View style={styles.appliedText}>
            <Text style={[theme.text.h4, styles.appliedCode]}>{applied} applied</Text>
            <Text style={[theme.text.caption, styles.appliedSaving]}>
              You saved {formatCurrency(cart.coupon.discount)}
            </Text>
          </View>
          <Pressable onPress={onRemove} hitSlop={theme.layout.hitSlop} accessibilityLabel="Remove coupon">
            <X size={18} color={theme.colors.text.tertiary} strokeWidth={2.4} />
          </Pressable>
        </View>
      </Card>
    );
  }

  return (
    <Card padding="none" elevation="xs" style={styles.card}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={styles.headerIcon}>
          <Tag size={16} color={theme.colors.primary[600]} strokeWidth={2.4} />
        </View>
        <View style={styles.headerText}>
          <Text style={theme.text.h4}>Apply a coupon</Text>
          {cart.coupon.invalidReason ? (
            <Text style={[theme.text.caption, styles.invalid]}>{cart.coupon.invalidReason}</Text>
          ) : coupons.length ? (
            <Text style={[theme.text.caption, styles.hint]}>
              {coupons.filter((c) => c.isApplicable).length} offer(s) available
            </Text>
          ) : null}
        </View>
        {expanded ? (
          <ChevronUp size={18} color={theme.colors.text.tertiary} strokeWidth={2.4} />
        ) : (
          <ChevronDown size={18} color={theme.colors.text.tertiary} strokeWidth={2.4} />
        )}
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          <View style={styles.inputRow}>
            <Input
              value={code}
              onChangeText={(value) => setCode(value.toUpperCase())}
              placeholder="Enter code"
              autoCapitalize="characters"
              autoCorrect={false}
              size="md"
              error={errorMessage ?? undefined}
              containerStyle={styles.input}
            />
            <Button
              title="Apply"
              size="md"
              variant="secondary"
              onPress={() => onApply(code.trim())}
              disabled={code.trim().length < 3}
              loading={isApplying}
              fullWidth={false}
              style={styles.applyButton}
            />
          </View>

          {coupons.map((coupon) => (
            <Pressable
              key={coupon.code}
              onPress={() => coupon.isApplicable && onApply(coupon.code)}
              disabled={!coupon.isApplicable}
              style={({ pressed }) => [
                styles.offer,
                !coupon.isApplicable ? styles.offerDisabled : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={styles.offerCode}>
                <Text style={[theme.text.label, styles.offerCodeText]}>{coupon.code}</Text>
              </View>
              <View style={styles.offerText}>
                <Text style={theme.text.bodyMedium}>{coupon.title}</Text>
                <Text style={[theme.text.caption, styles.hint]}>
                  {coupon.isApplicable
                    ? coupon.description
                    : `Add ${formatCurrency(coupon.amountNeeded)} more to use this`}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
    </Card>
  );
};

export default CouponPanel;

const styles = StyleSheet.create({
  card: {
    marginTop: theme.spacing.md,
  },
  appliedCard: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.accent[50],
  },
  appliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  appliedIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedText: {
    flex: 1,
  },
  appliedCode: {
    color: theme.colors.accent[700],
  },
  appliedSaving: {
    color: theme.colors.accent[600],
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary[50],
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
  invalid: {
    color: theme.colors.state.error,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
  },
  applyButton: {
    paddingHorizontal: theme.spacing.lg,
  },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  offerDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
  offerCode: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.borders.brand,
    backgroundColor: theme.colors.surface.brandWash,
  },
  offerCodeText: {
    color: theme.colors.primary[600],
    fontSize: 11,
  },
  offerText: {
    flex: 1,
  },
});
