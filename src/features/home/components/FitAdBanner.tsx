import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { ArrowRight, Beef, Flame, Leaf } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';
import { FIT, MACRO_COLORS } from '@features/fit/fit.constants';

interface FitAdBannerProps {
  onPress: () => void;
}

/** Home promo for the Fit tab (BhojFit). Tapping jumps straight to it. */
const FitAdBanner: React.FC<FitAdBannerProps> = ({ onPress }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })),
      -1,
    );
  }, [float]);
  const chipA = useAnimatedStyle(() => ({ transform: [{ translateY: -4 * float.value }] }));
  const chipB = useAnimatedStyle(() => ({ transform: [{ translateY: 4 * float.value }] }));

  return (
    <PressableScale onPress={onPress} scaleTo={0.97} accessibilityRole="button" accessibilityLabel="Open BhojFit: healthy macro-counted meals" style={styles.wrap}>
      <LinearGradient colors={[FIT.forest, FIT.deep, FIT.emerald]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
        <View pointerEvents="none" style={styles.orb} />
        <View style={styles.copy}>
          <View style={styles.newTag}>
            <Text style={styles.newText}>NEW · BHOJFIT</Text>
          </View>
          <Text style={styles.title}>
            Eat clean. <Text style={styles.accent}>Train smart.</Text>
          </Text>
          <Text style={styles.sub}>Macro-counted meals, your daily protein target and fit kitchens.</Text>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>Open BhojFit</Text>
            <ArrowRight size={14} color={FIT.forest} strokeWidth={2.8} />
          </View>
        </View>
        <View style={styles.art}>
          <Animated.View style={[styles.chip, { top: 0, right: 6 }, chipA]}>
            <Beef size={13} color={MACRO_COLORS.protein} strokeWidth={2.6} />
            <Text style={styles.chipText}>32g</Text>
          </Animated.View>
          <Animated.View style={[styles.chip, { bottom: 0, left: 0 }, chipB]}>
            <Flame size={13} color={MACRO_COLORS.kcal} strokeWidth={2.6} />
            <Text style={styles.chipText}>420</Text>
          </Animated.View>
          <View style={styles.leafCircle}>
            <Leaf size={44} color={FIT.lime} strokeWidth={2} />
          </View>
        </View>
      </LinearGradient>
    </PressableScale>
  );
};

export default FitAdBanner;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    wrap: { marginHorizontal: theme.layout.screenPadding, marginTop: theme.spacing.xl },
    banner: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, borderRadius: theme.radius.xxl, overflow: 'hidden', gap: theme.spacing.sm, ...theme.elevation.primary },
    orb: { position: 'absolute', width: 190, height: 190, borderRadius: 95, right: -50, top: -80, backgroundColor: FIT.lime, opacity: 0.15 },
    copy: { flex: 1, gap: 6 },
    newTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.radius.pill, backgroundColor: FIT.lime },
    newText: { color: FIT.forest, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    title: { color: FIT.onHero, fontSize: 22, lineHeight: 26, fontWeight: '800', letterSpacing: -0.4 },
    accent: { color: FIT.lime },
    sub: { color: FIT.heroMuted, fontSize: 12, lineHeight: 17 },
    cta: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.pill, backgroundColor: FIT.lime },
    ctaText: { color: FIT.forest, fontSize: 13, fontWeight: '800' },
    art: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
    leafCircle: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: FIT.glass, borderWidth: 1, borderColor: FIT.glassBorder },
    chip: { position: 'absolute', zIndex: 2, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 4, borderRadius: theme.radius.pill, backgroundColor: '#FFFFFF' },
    chipText: { color: '#0D1B1E', fontSize: 11, fontWeight: '800' },
  });
