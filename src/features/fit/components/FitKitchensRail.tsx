import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronRight, ShieldCheck } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';
import { FIT } from '../fit.constants';
import type { FitKitchen } from '../hooks/useFitData';

interface FitKitchensRailProps {
  kitchens: FitKitchen[];
  onPress: (kitchen: FitKitchen) => void;
}

const MAX_ROWS = 5;

/** Kitchens ranked by how much protein their fit meals carry, as a compact leaderboard. */
const FitKitchensRail: React.FC<FitKitchensRailProps> = ({ kitchens, onPress }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  if (!kitchens.length) return null;
  return (
    <View style={styles.card}>
      {kitchens.slice(0, MAX_ROWS).map((k, i) => (
        <PressableScale
          key={k.id}
          onPress={() => onPress(k)}
          haptic={false}
          scaleTo={0.98}
          accessibilityRole="button"
          accessibilityLabel={k.name}
          style={[styles.row, i > 0 ? styles.divider : null]}
        >
          <View style={[styles.rank, i === 0 ? styles.rankTop : null]}>
            <Text style={[styles.rankText, i === 0 ? styles.rankTextTop : null]}>{i + 1}</Text>
          </View>
          <View style={styles.body}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{k.name}</Text>
              {k.isVerified ? <ShieldCheck size={14} color={theme.colors.text.brand} strokeWidth={2.4} /> : null}
            </View>
            <Text style={styles.sub} numberOfLines={1}>
              {k.locality ?? 'Near you'} · {k.mealCount} fit {k.mealCount === 1 ? 'meal' : 'meals'}
            </Text>
          </View>
          <View style={styles.protein}>
            <Text style={styles.proteinValue}>{k.avgProteinG}g</Text>
            <Text style={styles.proteinLabel}>protein</Text>
          </View>
          <ChevronRight size={16} color={theme.colors.text.tertiary} />
        </PressableScale>
      ))}
    </View>
  );
};

export default FitKitchensRail;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      marginHorizontal: theme.layout.screenPadding,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface.raised,
      ...theme.elevation.sm,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.md },
    divider: { borderTopWidth: 1, borderTopColor: theme.colors.borders.subtle },
    rank: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.brandWash,
    },
    rankTop: { backgroundColor: FIT.lime },
    rankText: { ...theme.text.label, color: theme.colors.text.brand },
    rankTextTop: { color: FIT.forest },
    body: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    name: { ...theme.text.h4, flexShrink: 1, color: theme.colors.text.primary },
    sub: { ...theme.text.caption, color: theme.colors.text.secondary },
    protein: { alignItems: 'flex-end' },
    proteinValue: { ...theme.text.h4, color: theme.colors.text.brand },
    proteinLabel: { ...theme.text.caption, color: theme.colors.text.tertiary },
  });
