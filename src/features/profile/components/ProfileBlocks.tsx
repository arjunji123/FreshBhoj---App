import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';
import { ChevronRightIcon, IconProps } from '@components/icons';

type Theme = ReturnType<typeof useTheme>;
type IconComponent = React.ComponentType<IconProps>;
export type Tone = 'brand' | 'marigold' | 'danger';

/** Resolves the badge background, icon stroke and icon fill for a tone. */
export const useTone = (tone: Tone) => {
  const theme = useTheme();
  return useMemo(() => {
    if (tone === 'marigold') {
      return {
        bg: `${theme.colors.amber[500]}29`,
        ink: theme.colors.amber[500],
        tint: `${theme.colors.amber[500]}55`,
      };
    }
    if (tone === 'danger') {
      return {
        bg: `${theme.colors.state.error}1A`,
        ink: theme.colors.state.error,
        tint: `${theme.colors.state.error}33`,
      };
    }
    return {
      bg: theme.colors.surface.brandWash,
      ink: theme.colors.primary[600],
      tint: theme.colors.borders.brand,
    };
  }, [theme, tone]);
};

/** Icon sitting in a soft tinted rounded square. */
export const IconBadge: React.FC<{ icon: IconComponent; tone?: Tone; size?: number }> = ({
  icon: Icon,
  tone = 'brand',
  size = 40,
}) => {
  const t = useTone(tone);
  const box = useMemo(
    () => ({ width: size, height: size, borderRadius: size * 0.32, backgroundColor: t.bg }),
    [size, t.bg],
  );
  return (
    <View style={[styles.badge, box]}>
      <Icon size={size * 0.58} color={t.ink} tint={t.tint} />
    </View>
  );
};

interface RowProps {
  icon: IconComponent;
  title: string;
  subtitle?: string;
  tone?: Tone;
  showChevron?: boolean;
  onPress: () => void;
}

/** One settings row: badge, title, subtitle, chevron. */
export const SettingsRow: React.FC<RowProps> = ({ icon, title, subtitle, tone = 'brand', showChevron = true, onPress }) => {
  const theme = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  return (
    <PressableScale onPress={onPress} haptic={false} scaleTo={0.985} accessibilityRole="button" style={s.row}>
      <IconBadge icon={icon} tone={tone} />
      <View style={s.rowText}>
        <Text
          style={[theme.text.h4, tone === 'danger' ? s.danger : s.title]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[theme.text.bodySmall, s.subtitle]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {showChevron ? <ChevronRightIcon size={20} color={theme.colors.text.tertiary} /> : null}
    </PressableScale>
  );
};

/** Compact balance tile (Wallet / Coins). */
export const BalanceTile: React.FC<{
  icon: IconComponent;
  tone: Tone;
  label: string;
  value: string;
  onPress: () => void;
}> = ({ icon, tone, label, value, onPress }) => {
  const theme = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  return (
    <PressableScale onPress={onPress} haptic={false} scaleTo={0.97} accessibilityRole="button" style={[s.tile, theme.elevation.xs]}>
      <IconBadge icon={icon} tone={tone} size={38} />
      <View style={s.tileText}>
        <Text style={[theme.text.caption, s.subtitle]} numberOfLines={1}>{label}</Text>
        <Text style={[theme.text.h3, s.title]} numberOfLines={1}>{value}</Text>
      </View>
    </PressableScale>
  );
};

/** Quick-action tile for the 2x2 grid. */
export const QuickAction: React.FC<{
  icon: IconComponent;
  label: string;
  count?: number;
  onPress: () => void;
}> = ({ icon, label, count, onPress }) => {
  const theme = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  return (
    <PressableScale onPress={onPress} haptic={false} scaleTo={0.97} accessibilityRole="button" style={[s.action, theme.elevation.xs]}>
      <IconBadge icon={icon} />
      <View style={s.actionText}>
        <Text style={[theme.text.h4, s.title]} numberOfLines={1}>{label}</Text>
        {count !== undefined ? (
          <Text style={[theme.text.caption, s.subtitle]} numberOfLines={1}>{count} total</Text>
        ) : null}
      </View>
    </PressableScale>
  );
};

/** Glass stat chip on the hero gradient. */
export const GlassStat: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const theme = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={s.glass}>
      <Text style={[theme.text.h3, s.glassValue]}>{value}</Text>
      <Text style={[theme.text.caption, s.glassLabel]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    rowText: { flex: 1 },
    title: { color: theme.colors.text.primary },
    danger: { color: theme.colors.state.error },
    subtitle: { color: theme.colors.text.secondary, marginTop: 1 },
    tile: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radius.card,
      backgroundColor: theme.colors.surface.raised,
    },
    tileText: { flex: 1 },
    action: {
      width: '48.5%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radius.card,
      backgroundColor: theme.colors.surface.raised,
    },
    actionText: { flex: 1 },
    glass: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.xl,
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
    },
    glassValue: { color: theme.colors.palette.white },
    glassLabel: { color: 'rgba(255,255,255,0.82)', marginTop: 1 },
  });
