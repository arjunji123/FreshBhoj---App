import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Flame, Sparkles, Target } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';
import { FIT, FIT_COPY, FIT_TIPS, MACRO_COLORS } from '../fit.constants';
import type { CartNutrition, FitTargets } from '../fit.utils';
import ProgressRing from './ProgressRing';

interface FitHeroProps {
  targets: FitTargets | null;
  inCart: CartNutrition;
  onSetTarget: () => void;
}

/** Deep-green hero: tagline, rotating tip, and the protein ring (or a "set target" CTA). */
const FitHero: React.FC<FitHeroProps> = ({ targets, inCart, onSetTarget }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [tip, setTip] = useState(() => Math.floor(Math.random() * FIT_TIPS.length));

  useEffect(() => {
    const id = setInterval(() => setTip((i) => (i + 1) % FIT_TIPS.length), 6000);
    return () => clearInterval(id);
  }, []);

  const proteinPct = targets ? inCart.proteinG / targets.proteinG : 0;

  return (
    <LinearGradient
      colors={[FIT.forest, FIT.deep, FIT.emerald]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View pointerEvents="none" style={styles.orbBig} />
      <View pointerEvents="none" style={styles.orbSmall} />

      <View style={styles.badge}>
        <Sparkles size={12} color={FIT.lime} strokeWidth={2.4} />
        <Text style={styles.badgeText}>Bhoj Fit</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>{FIT_COPY.heroTitle}</Text>
          <Text style={[styles.title, styles.titleAccent]}>{FIT_COPY.heroAccent}</Text>
          <Text style={styles.sub}>{FIT_COPY.heroSub}</Text>
        </View>

        {targets ? (
          <ProgressRing size={96} stroke={9} progress={proteinPct} color={FIT.lime} trackColor={FIT.glass}>
            <Text style={styles.ringValue}>{inCart.proteinG}g</Text>
            <Text style={styles.ringLabel}>of {targets.proteinG}g</Text>
          </ProgressRing>
        ) : null}
      </View>

      {targets ? (
        <View style={styles.targetRow}>
          <View style={styles.pill}>
            <Flame size={13} color={MACRO_COLORS.kcal} strokeWidth={2.4} />
            <Text style={styles.pillText}>
              {inCart.kcal} / {targets.kcal} kcal in cart
            </Text>
          </View>
          <PressableScale onPress={onSetTarget} haptic={false} style={styles.editPill} accessibilityRole="button" accessibilityLabel="Edit daily target">
            <Text style={styles.editText}>Edit target</Text>
          </PressableScale>
        </View>
      ) : (
        <PressableScale onPress={onSetTarget} accessibilityRole="button" accessibilityLabel="Set my daily target" style={styles.cta}>
          <Target size={16} color={FIT.forest} strokeWidth={2.6} />
          <Text style={styles.ctaText}>Set my daily target</Text>
        </PressableScale>
      )}

      <Animated.View key={tip} entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)} style={styles.tipRow}>
        <Text style={styles.tip} numberOfLines={2}>
          {FIT_TIPS[tip]}
        </Text>
      </Animated.View>
    </LinearGradient>
  );
};

export default FitHero;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    hero: {
      marginHorizontal: theme.layout.screenPadding,
      borderRadius: theme.radius.xxl + 6,
      padding: theme.spacing.lg,
      overflow: 'hidden',
      gap: theme.spacing.md,
    },
    orbBig: {
      position: 'absolute',
      width: 220,
      height: 220,
      borderRadius: 110,
      right: -70,
      top: -90,
      backgroundColor: FIT.lime,
      opacity: 0.16,
    },
    orbSmall: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      left: -40,
      bottom: -50,
      backgroundColor: FIT.mint,
      opacity: 0.1,
    },
    badge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.radius.pill,
      backgroundColor: FIT.glass,
      borderWidth: 1,
      borderColor: FIT.glassBorder,
    },
    badgeText: { color: FIT.lime, fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md },
    copy: { flex: 1 },
    title: { color: FIT.onHero, fontSize: 30, lineHeight: 34, fontWeight: '800', letterSpacing: -0.6 },
    titleAccent: { color: FIT.lime },
    sub: { color: FIT.heroMuted, fontSize: 13, lineHeight: 18, marginTop: 6 },
    ringValue: { color: FIT.onHero, fontSize: 20, fontWeight: '800' },
    ringLabel: { color: FIT.heroMuted, fontSize: 10, fontWeight: '600' },
    targetRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    pill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.radius.pill,
      backgroundColor: FIT.glass,
    },
    pillText: { color: FIT.onHero, fontSize: 12, fontWeight: '700' },
    editPill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: FIT.glassBorder,
    },
    editText: { color: FIT.onHero, fontSize: 12, fontWeight: '700' },
    cta: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: theme.radius.pill,
      backgroundColor: FIT.lime,
    },
    ctaText: { color: FIT.forest, fontSize: 14, fontWeight: '800' },
    tipRow: { minHeight: 34 },
    tip: { color: FIT.heroMuted, fontSize: 12, lineHeight: 17, fontStyle: 'italic' },
  });
