import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { HealthyBowl } from '@components/illustrations';
import { theme as staticTheme } from '@app/theme/index';
import { useTheme } from '@app/theme/useTheme';
import { HEALTH_TIPS, HOME_COPY } from '../home.constants';

const TIP_INTERVAL_MS = 6000;

/** Friendly health headline with a slowly rotating tip. Purely presentational. */
const HealthBanner: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * HEALTH_TIPS.length));

  useEffect(() => {
    const id = setInterval(() => setTipIndex((i) => (i + 1) % HEALTH_TIPS.length), TIP_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <LinearGradient
      colors={theme.colors.gradients.brand}
      locations={theme.colors.gradients.brandLocations}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View pointerEvents="none" style={styles.orb} />
      <View style={styles.textWrap}>
        <Text style={styles.title}>{HOME_COPY.bannerTitle}</Text>
        <Animated.View key={tipIndex} entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)}>
          <View style={styles.tipRow}>
            <Sparkles size={12} color={theme.colors.amber[300]} strokeWidth={2.4} />
            <Text style={styles.tip} numberOfLines={2}>
              {HEALTH_TIPS[tipIndex]}
            </Text>
          </View>
        </Animated.View>
      </View>
      <View style={styles.art}>
        <HealthyBowl size={84} tone="onBrand" />
      </View>
    </LinearGradient>
  );
};

export default HealthBanner;

/** Banner is brand-teal in both themes, so its text is always white. */
const ON_BRAND = staticTheme.colors.palette.white;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginHorizontal: theme.layout.screenPadding,
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.sm,
    borderRadius: theme.radius.xxl,
    minHeight: 104,
    overflow: 'hidden',
    ...theme.elevation.primary,
  },
  orb: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -70,
    right: 30,
    backgroundColor: theme.colors.overlay.glass,
    opacity: 0.3,
  },
  art: {
    width: 84,
    height: 84,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...theme.text.h3,
    color: ON_BRAND,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginTop: 3,
  },
  tip: {
    ...theme.text.bodySmall,
    flex: 1,
    color: ON_BRAND,
    opacity: 0.92,
  },
});
