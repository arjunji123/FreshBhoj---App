import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';

interface HomeSectionHeaderProps {
  title: string;
  subtitle?: string;
  /** When given, a soft "See all" pill is shown on the right. */
  onSeeAll?: () => void;
}

/** Shared Home section heading: title + optional subtitle, consistent "See all" pill. */
const HomeSectionHeader: React.FC<HomeSectionHeaderProps> = ({ title, subtitle, onSeeAll }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.textWrap}>
        <Text style={[theme.text.h2, styles.title]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[theme.text.bodySmall, styles.subtitle]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onSeeAll ? (
        <PressableScale
          onPress={onSeeAll}
          scaleTo={0.94}
          haptic={false}
          hitSlop={theme.layout.hitSlop}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}
          style={styles.pill}
        >
          <Text style={[theme.text.label, styles.pillText]}>See all</Text>
          <ChevronRight size={14} color={theme.colors.primary[700]} strokeWidth={2.6} />
        </PressableScale>
      ) : null}
    </View>
  );
};

export default HomeSectionHeader;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      paddingHorizontal: theme.layout.screenPadding,
      marginBottom: theme.spacing.md,
    },
    textWrap: {
      flex: 1,
    },
    title: {
      color: theme.colors.text.primary,
    },
    subtitle: {
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingVertical: 6,
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface.brandWash,
      borderWidth: 1,
      borderColor: theme.colors.borders.brand,
    },
    pillText: {
      color: theme.colors.primary[700],
    },
  });
