import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowRight, Beef, Flame } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';
import { FIT, MACRO_COLORS } from '@features/fit/fit.constants';

const FIT_PHOTO = require('../../../../assets/images/photos/bowl.jpg');

interface FitAdBannerProps {
  onPress: () => void;
}

/** Home promo for the Fit tab (Bhoj Fit). Tapping jumps straight to it. */
const FitAdBanner: React.FC<FitAdBannerProps> = ({ onPress }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <PressableScale onPress={onPress} scaleTo={0.97} accessibilityRole="button" accessibilityLabel="Open Bhoj Fit: healthy macro-counted meals" style={styles.wrap}>
      <LinearGradient colors={[FIT.forest, FIT.deep, FIT.emerald]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
        <View pointerEvents="none" style={styles.orb} />
        <View style={styles.copy}>
          <Text style={styles.title}>
            Eat clean.{'\n'}
            <Text style={styles.accent}>Train{'\u00A0'}smart.</Text>
          </Text>
          <Text style={styles.sub}>Macro-counted meals, your daily protein target and fit kitchens.</Text>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>Open Bhoj Fit</Text>
            <ArrowRight size={14} color={FIT.forest} strokeWidth={2.8} />
          </View>
        </View>
        <View style={styles.art}>
          <View style={[styles.chip, styles.chipTop]}>
            <Beef size={13} color={MACRO_COLORS.protein} strokeWidth={2.6} />
            <Text style={styles.chipText}>32g</Text>
          </View>
          <View style={[styles.chip, styles.chipBottom]}>
            <Flame size={13} color={MACRO_COLORS.kcal} strokeWidth={2.6} />
            <Text style={styles.chipText}>420</Text>
          </View>
          <Image source={FIT_PHOTO} style={styles.photo} resizeMode="cover" />
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
    title: { color: FIT.onHero, fontSize: 22, lineHeight: 26, fontWeight: '800', letterSpacing: -0.4 },
    accent: { color: FIT.lime },
    sub: { color: FIT.heroMuted, fontSize: 12, lineHeight: 17 },
    cta: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.pill, backgroundColor: FIT.lime },
    ctaText: { color: FIT.forest, fontSize: 13, fontWeight: '800' },
    art: { width: 112, height: 120, alignItems: 'center', justifyContent: 'center' },
    photo: { width: 108, height: 108, borderRadius: 54, borderWidth: 3, borderColor: FIT.lime },
    chipTop: { top: 0, right: 0 },
    chipBottom: { bottom: 0, left: -6 },
    chip: { position: 'absolute', zIndex: 2, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 4, borderRadius: theme.radius.pill, backgroundColor: '#FFFFFF' },
    chipText: { color: '#0D1E19', fontSize: 11, fontWeight: '800' },
  });
