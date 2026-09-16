import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';

interface ReferralPrinterProps {
  code: string;
}

const PAPER_HEIGHT = 176;
const PRINT_DURATION = 900;

/** Fun, festive stops — deliberately not the everyday brand red, so this one
 * screen reads as a special reward moment rather than another CTA. */
const PRINTER_GRADIENT = ['#FF7A59', '#8B5CF6', '#3B82F6'];
const BUTTON_GRADIENT = ['#FFD166', '#FF6B6B', '#8B5CF6'];

/**
 * The centrepiece of the Refer & Earn screen: a cartoon "printer" that spits
 * out the user's referral code on a receipt every time the button is pressed.
 * The code itself never changes — only the print animation replays — so
 * repeat taps are purely theatre, never a new network call.
 */
const ReferralPrinter: React.FC<ReferralPrinterProps> = ({ code }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printKey, setPrintKey] = useState(0);
  const [hasPrinted, setHasPrinted] = useState(false);

  const buttonScale = useSharedValue(1);
  const glowScale = useSharedValue(1);
  const bodyShake = useSharedValue(0);
  const paperY = useSharedValue(-PAPER_HEIGHT);

  React.useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [glowScale]);

  const finishPrint = useCallback(() => {
    setIsPrinting(false);
    setHasPrinted(true);
    setPrintKey((key) => key + 1);
  }, []);

  const runPrint = useCallback(() => {
    'worklet';
    bodyShake.value = withSequence(
      withTiming(-3, { duration: 60 }),
      withTiming(3, { duration: 60 }),
      withTiming(-2, { duration: 60 }),
      withTiming(2, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
    paperY.value = withDelay(
      120,
      withTiming(0, { duration: PRINT_DURATION, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(finishPrint)();
      }),
    );
  }, [bodyShake, paperY, finishPrint]);

  const handlePress = () => {
    if (isPrinting) return;
    setIsPrinting(true);
    buttonScale.value = withSequence(
      withTiming(0.82, { duration: 110 }),
      withTiming(1, { duration: 160 }),
    );

    if (hasPrinted) {
      // Already out from a previous tap — tuck it back in, then print again.
      paperY.value = withTiming(
        -PAPER_HEIGHT,
        { duration: 260, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runPrint();
        },
      );
    } else {
      runPrint();
    }
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: 0.55 - (glowScale.value - 1) * 1.2,
  }));
  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bodyShake.value }],
  }));
  const paperStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: paperY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.printerBody, bodyStyle]}>
        <AppGradient colors={PRINTER_GRADIENT} direction="diagonal" style={styles.printerGradient}>
          <View style={styles.lightsRow}>
            <View style={[styles.light, styles.lightAmber]} />
            <View style={[styles.light, styles.lightGreen]} />
          </View>
          <Text style={styles.printerLabel}>FRESHBHOJ PRINTER</Text>
        </AppGradient>
      </Animated.View>

      <View style={styles.slot} />

      <View style={styles.paperClip} pointerEvents="box-none">
        <Animated.View style={[styles.paper, paperStyle]}>
          <Text style={styles.paperEyebrow}>YOUR REFERRAL CODE</Text>
          <Text style={styles.paperCode}>{code}</Text>
          <View style={styles.paperDivider} />
          <Text style={styles.paperFootnote}>Share it — you both earn FreshBhoj Coins</Text>
        </Animated.View>
      </View>

      {hasPrinted ? (
        <View style={styles.sparkleRow} pointerEvents="none" key={printKey}>
          <Animated.View entering={ZoomIn.delay(60).springify()}>
            <Sparkles size={16} color={theme.colors.accent[500]} strokeWidth={2.2} />
          </Animated.View>
          <Animated.View entering={ZoomIn.delay(160).springify()}>
            <Sparkles size={22} color="#8B5CF6" strokeWidth={2.2} />
          </Animated.View>
          <Animated.View entering={ZoomIn.delay(260).springify()}>
            <Sparkles size={14} color={theme.colors.primary[500]} strokeWidth={2.2} />
          </Animated.View>
        </View>
      ) : null}

      <View style={styles.buttonWrap}>
        <Animated.View style={[styles.buttonGlow, glowStyle]} />
        <Pressable
          onPress={handlePress}
          disabled={isPrinting}
          accessibilityRole="button"
          accessibilityLabel="Print my referral code"
        >
          <Animated.View style={buttonStyle}>
            <AppGradient
              colors={BUTTON_GRADIENT}
              direction="diagonal"
              style={[styles.printButton, isPrinting ? styles.printButtonDisabled : null]}
            >
              <Text style={styles.printButtonText}>{isPrinting ? '···' : hasPrinted ? 'PRINT AGAIN' : 'PRINT CODE'}</Text>
            </AppGradient>
          </Animated.View>
        </Pressable>
      </View>

      {!hasPrinted ? (
        <Animated.Text entering={FadeIn.delay(300)} style={styles.hint}>
          Tap the button — your code prints right below
        </Animated.Text>
      ) : null}
    </View>
  );
};

export default ReferralPrinter;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
  },
  printerBody: {
    width: 260,
    zIndex: 3,
  },
  printerGradient: {
    borderRadius: theme.radius.card,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    ...theme.elevation.md,
  },
  lightsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
  },
  light: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lightAmber: {
    backgroundColor: '#FFD166',
  },
  lightGreen: {
    backgroundColor: theme.colors.accent[400],
  },
  printerLabel: {
    color: theme.colors.text.inverse,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.extrabold,
    fontSize: theme.typography.fontSizes.sm,
    letterSpacing: 1.5,
    marginTop: theme.spacing.md,
  },
  slot: {
    width: 210,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.neutral[900],
    zIndex: 2,
    marginTop: -7,
  },
  paperClip: {
    width: 232,
    height: PAPER_HEIGHT,
    overflow: 'hidden',
    zIndex: 1,
  },
  paper: {
    width: '100%',
    minHeight: PAPER_HEIGHT,
    backgroundColor: '#FFFDF6',
    borderBottomLeftRadius: theme.radius.control,
    borderBottomRightRadius: theme.radius.control,
    borderWidth: 1,
    borderColor: theme.colors.borders.subtle,
    borderTopWidth: 0,
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    ...theme.elevation.sm,
  },
  paperEyebrow: {
    color: theme.colors.text.tertiary,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    fontSize: theme.typography.fontSizes.xs,
    letterSpacing: 1.2,
  },
  paperCode: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.extrabold,
    fontSize: theme.typography.fontSizes.display3,
    letterSpacing: 4,
    marginTop: theme.spacing.xs,
  },
  paperDivider: {
    width: '70%',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.borders.subtle,
    marginVertical: theme.spacing.sm,
  },
  paperFootnote: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    fontSize: theme.typography.fontSizes.xs,
    textAlign: 'center',
  },
  sparkleRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    zIndex: 4,
  },
  buttonWrap: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGlow: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#8B5CF6',
  },
  printButton: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    ...theme.elevation.lg,
  },
  printButtonDisabled: {
    opacity: 0.75,
  },
  printButtonText: {
    color: theme.colors.text.inverse,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.extrabold,
    fontSize: theme.typography.fontSizes.xs,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  hint: {
    marginTop: theme.spacing.md,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: 'center',
  },
});
