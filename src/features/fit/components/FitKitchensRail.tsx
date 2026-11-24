import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, ShieldCheck } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';
import { FIT, MACRO_COLORS } from '../fit.constants';
import type { FitKitchen } from '../hooks/useFitData';

interface FitKitchensRailProps {
  kitchens: FitKitchen[];
  onPress: (kitchen: FitKitchen) => void;
}

/** Kitchens ranked by how much protein their fit meals carry. */
const FitKitchensRail: React.FC<FitKitchensRailProps> = ({ kitchens, onPress }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  if (!kitchens.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {kitchens.map((k, i) => (
        <PressableScale
          key={k.id}
          onPress={() => onPress(k)}
          haptic={false}
          scaleTo={0.97}
          accessibilityRole="button"
          accessibilityLabel={k.name}
          style={styles.card}
        >
          <View style={styles.rank}>
            <Text style={styles.rankText}>#{i + 1}</Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {k.name}
            </Text>
            {k.isVerified ? <ShieldCheck size={14} color={theme.colors.state.info} strokeWidth={2.4} /> : null}
          </View>
          <Text style={styles.sub} numberOfLines={1}>
            {k.locality ?? 'Near you'}
          </Text>
          <View style={styles.stats}>
            <View>
              <Text style={[styles.statValue, { color: MACRO_COLORS.protein }]}>{k.avgProteinG}g</Text>
              <Text style={styles.statLabel}>avg protein</Text>
            </View>
            <View>
              <Text style={styles.statValue}>{k.mealCount}</Text>
              <Text style={styles.statLabel}>fit meals</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.text.tertiary} />
          </View>
        </PressableScale>
      ))}
    </ScrollView>
  );
};

export default FitKitchensRail;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    row: { paddingHorizontal: theme.layout.screenPadding, gap: theme.spacing.md },
    card: {
      width: 200,
      padding: theme.spacing.md,
      gap: 4,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface.raised,
      borderWidth: 1,
      borderColor: theme.colors.borders.subtle,
      ...theme.elevation.sm,
    },
    rank: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: theme.radius.pill,
      backgroundColor: FIT.deep,
      marginBottom: 4,
    },
    rankText: { color: FIT.lime, fontSize: 11, fontWeight: '800' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    name: { ...theme.text.h4, flexShrink: 1, color: theme.colors.text.primary },
    sub: { ...theme.text.caption, color: theme.colors.text.secondary },
    stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.sm },
    statValue: { fontSize: 17, fontWeight: '800', color: theme.colors.text.primary },
    statLabel: { fontSize: 10, fontWeight: '600', color: theme.colors.text.tertiary },
  });
