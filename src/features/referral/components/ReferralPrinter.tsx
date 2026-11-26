import React, { useCallback, useState, useMemo } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import AppGradient from '@components/AppGradient';
import { useTheme } from "@app/theme/useTheme";

interface ReferralPrinterProps {
  code: string;
}

const PAPER_HEIGHT = 176;
const PRINT_DURATION = 900;
const NOTCH_SIZE = 22;
const SCALLOP_COUNT = 13;
const TICKET_EDGE = '#D3E2DC';

/** Fun, festive stops — deliberately not the everyday brand red, so this one
 * screen reads as a special reward moment rather than another CTA. */
const PRINTER_GRADIENT = ['#FFC21A', '#2BBE82', '#0C4A38'];
const BUTTON_GRADIENT = ['#FFC21A', '#34C98A', '#0C4A38'];

/**
 * The centrepiece of the Refer & Earn screen: a cartoon "printer" that spits
 * out the user's referral code on a receipt every time the button is pressed.
 * The code itself never changes — only the print animation replays — so
 * repeat taps are purely theatre, never a new network call.
 */
const ReferralPrinter: React.FC<ReferralPrinterProps> = ({ code }) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);

  const buttonScale = useSharedValue(1);
  const bodyShake = useSharedValue(0);
  const paperY = useSharedValue(-PAPER_HEIGHT);

  const finishPrint = useCallback(() => {
    setIsPrinting(false);
    setHasPrinted(true);
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
          <Text style={styles.printerLabel}>FreshBhoj printer</Text>
        </AppGradient>
      </Animated.View>

      <View style={styles.slot} />

      <View style={styles.paperClip} pointerEvents="box-none">
        <Animated.View style={[styles.paper, paperStyle]}>
          <Text style={styles.paperEyebrow}>Your referral code</Text>
          <Text style={styles.paperCode}>{code}</Text>
          {/* Ticket tear line: a notch bitten out of each side, joined by dashes. */}
          <View style={styles.tearRow}>
            <View style={[styles.notch, styles.notchLeft]} />
            <View style={styles.paperDivider} />
            <View style={[styles.notch, styles.notchRight]} />
          </View>
          <Text style={styles.paperFootnote}>Share it — you both earn FreshBhoj Coins</Text>
          {/* Scalloped bottom edge, like a torn-off ticket. */}
          <View style={styles.scallopRow}>
            {Array.from({ length: SCALLOP_COUNT }).map((_, index) => (
              <View key={index} style={styles.scallop} />
            ))}
          </View>
        </Animated.View>
      </View>

      <View style={styles.buttonWrap}>
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
              <Text style={styles.printButtonText}>{isPrinting ? '···' : hasPrinted ? 'Print again' : 'Print code'}</Text>
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

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
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
    backgroundColor: '#FFC21A',
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
    height: PAPER_HEIGHT,
    backgroundColor: '#FFFDF6',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: TICKET_EDGE,
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  paperEyebrow: {
    color: '#5F776F',
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    fontSize: theme.typography.fontSizes.xs,
    letterSpacing: 1.2,
  },
  paperCode: {
    color: '#0D1E19',
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.extrabold,
    fontSize: theme.typography.fontSizes.display3,
    letterSpacing: 4,
    marginTop: theme.spacing.xs,
  },
  tearRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -(theme.spacing.md + 1),
    marginVertical: theme.spacing.sm,
  },
  paperDivider: {
    flex: 1,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: TICKET_EDGE,
  },
  // Page-coloured circles centred on the edges read as holes punched out of the paper.
  notch: {
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    borderRadius: NOTCH_SIZE / 2,
    backgroundColor: theme.colors.surface.page,
    borderWidth: 1,
    borderColor: TICKET_EDGE,
  },
  notchLeft: { marginLeft: -NOTCH_SIZE / 2 },
  notchRight: { marginRight: -NOTCH_SIZE / 2 },
  scallopRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scallop: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surface.page,
    borderWidth: 1,
    borderColor: TICKET_EDGE,
  },
  paperFootnote: {
    color: '#475D56',
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    fontSize: theme.typography.fontSizes.xs,
    textAlign: 'center',
  },
  buttonWrap: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
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
