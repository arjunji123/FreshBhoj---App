import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/theme/useTheme';
import FitBadge from './FitBadge';
import FitStreakIcon from './FitStreakIcon';

/** Page title: the Fit mark, the two-tone name and today's streak count. */
const FitHeader: React.FC<{ streak: number }> = ({ streak }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.row}>
      <FitBadge size={42} />
      <Text style={styles.title}>
        Bhoj<Text style={styles.accent}> Fit</Text>
      </Text>
      <View style={styles.chip} accessibilityLabel={`${streak} day streak`}>
        <FitStreakIcon size={18} color={theme.colors.text.brand} />
        <Text style={styles.chipText}>{streak}</Text>
      </View>
    </View>
  );
};

export default FitHeader;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.layout.screenPadding,
      paddingBottom: theme.spacing.md,
    },
    title: { flex: 1, ...theme.text.h2, color: theme.colors.text.primary },
    accent: { color: theme.colors.text.brand, fontStyle: 'italic' },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      height: 36,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface.brandWash,
    },
    chipText: { ...theme.text.h4, color: theme.colors.text.brand },
  });
