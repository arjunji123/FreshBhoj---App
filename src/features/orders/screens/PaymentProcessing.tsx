import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AlertCircle, CookingPot, X } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';
import { Button } from '@components/ui';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { useConfirmPayment, useFailPayment } from '../hooks/useOrders';

type Route = RouteProp<PrivateStackParamList, 'PaymentProcessing'>;

const STEPS = [
  'Fetching farm-fresh ingredients…',
  'Confirming with the kitchen…',
  'Sizzling your favourite flavours…',
];

/**
 * The moment between "Place Order" and a confirmed order.
 *
 * There is no payment gateway wired up yet, so this screen stands in for the
 * PSP handoff: it shows real progress, then calls `confirm-payment`. When a
 * gateway is added, its callback replaces the timer and nothing else moves.
 */
const PaymentProcessing = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();

  const [stepIndex, setStepIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const confirmPayment = useConfirmPayment();
  const failPayment = useFailPayment();
  const hasStarted = useRef(false);

  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 3200, easing: Easing.out(Easing.cubic) });
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );

    const stepTimer = setInterval(() => {
      setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
    }, 1100);

    return () => clearInterval(stepTimer);
  }, [progress, pulse]);

  useEffect(() => {
    // Guarded so a re-render never fires a second confirmation for one order.
    if (hasStarted.current) return;
    hasStarted.current = true;

    const timer = setTimeout(() => {
      confirmPayment.mutate(
        { orderId: params.orderId, paymentRef: `${params.paymentMethod}-${Date.now()}` },
        {
          onSuccess: () => navigation.replace('OrderConfirmation', { orderId: params.orderId }),
          onError: () => {
            failPayment.mutate(params.orderId);
            setFailed(true);
          },
        },
      );
    }, 3200);

    return () => clearTimeout(timer);
  }, [params.orderId, params.paymentMethod, confirmPayment, failPayment, navigation]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (failed) {
    return (
      <View style={styles.screen}>
        <View style={styles.failedBody}>
          <View style={styles.failedIcon}>
            <AlertCircle size={34} color={theme.colors.state.error} strokeWidth={2} />
          </View>
          <Text style={[theme.text.h1, styles.failedTitle]}>Payment did not go through</Text>
          <Text style={[theme.text.body, styles.failedBodyText]}>
            No money has left your account, and your cart is exactly as you left it. Give it
            another go.
          </Text>

          <Button
            title="Retry payment"
            onPress={() => {
              setFailed(false);
              hasStarted.current = false;
              navigation.replace('PaymentProcessing', params);
            }}
            style={styles.retryButton}
          />
          <Button
            title="Back to cart"
            variant="ghost"
            onPress={() => navigation.navigate('Cart')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.navigate('Cart')}
          hitSlop={theme.layout.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <X size={22} color={theme.colors.text.primary} strokeWidth={2.4} />
        </Pressable>
        <Text style={[theme.text.overline, styles.headerTitle]}>PROCESSING</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <Animated.View style={[styles.iconCard, pulseStyle]}>
          <CookingPot size={54} color={theme.colors.primary[600]} strokeWidth={1.8} />
          <View style={styles.sparkle} />
        </Animated.View>

        <Text style={[theme.text.h1, styles.title]}>Preparing your experience</Text>
        <Text style={[theme.text.body, styles.subtitle]}>
          Your order is being handcrafted
        </Text>

        <View style={styles.steps}>
          {STEPS.map((step, index) => (
            <Text
              key={step}
              style={[
                theme.text.bodyLarge,
                styles.step,
                index === stepIndex ? styles.stepActive : null,
                index < stepIndex ? styles.stepDone : null,
              ]}
            >
              {step}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressHeader}>
          <Text style={[theme.text.overline, styles.progressLabel]}>PROGRESS</Text>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFillWrap, progressStyle]}>
            <AppGradient
              colors={theme.colors.gradients.brandSoft}
              direction="horizontal"
              style={styles.progressFill}
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default PaymentProcessing;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.base,
    paddingTop: theme.spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
  },
  headerTitle: {
    color: theme.colors.text.secondary,
  },
  headerSpacer: {
    width: 22,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  iconCard: {
    width: 132,
    height: 132,
    borderRadius: 34,
    backgroundColor: theme.colors.surface.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xxl,
    ...theme.elevation.lg,
  },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary[600],
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginTop: 6,
  },
  steps: {
    marginTop: theme.spacing.xxxl,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  step: {
    color: theme.colors.text.disabled,
    textAlign: 'center',
  },
  stepActive: {
    ...theme.text.h4,
    color: theme.colors.text.primary,
  },
  stepDone: {
    color: theme.colors.text.tertiary,
  },
  footer: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxxl,
  },
  progressHeader: {
    marginBottom: theme.spacing.sm,
  },
  progressLabel: {
    color: theme.colors.primary[600],
  },
  progressTrack: {
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.neutral[200],
    overflow: 'hidden',
  },
  progressFillWrap: {
    height: '100%',
  },
  progressFill: {
    flex: 1,
    borderRadius: theme.radius.pill,
  },
  failedBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  failedIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.state.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  failedTitle: {
    textAlign: 'center',
  },
  failedBodyText: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  retryButton: {
    marginTop: theme.spacing.xl,
  },
});
