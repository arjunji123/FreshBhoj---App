import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@app/theme/useTheme';

/** Compact Fit section heading: a green marker, a small title and one line of context. */
const FitSectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.row}>
      <View style={styles.marker} />
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

export default FitSectionHeader;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.layout.screenPadding,
      marginBottom: theme.spacing.sm,
    },
    marker: { width: 4, borderRadius: 2, backgroundColor: theme.colors.primary[600] },
    text: { flex: 1 },
    title: { ...theme.text.h4, color: theme.colors.text.primary },
    subtitle: { ...theme.text.caption, color: theme.colors.text.secondary },
  });
