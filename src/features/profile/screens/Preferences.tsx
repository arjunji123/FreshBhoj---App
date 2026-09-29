import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, Check, Moon, Smartphone, Sun } from 'lucide-react-native';
import { useTheme } from '@app/theme/useTheme';
import { commitThemeMode } from '@app/theme/commitThemeMode';
import { useThemeStore, type ThemeMode } from '@app/theme/themeStore';
import { AppBar, Card, Divider, ListItem, Screen } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';

const APPEARANCE_OPTIONS: Array<{
  key: ThemeMode;
  title: string;
  subtitle: string;
  Icon: React.FC<{ size: number; color: string; strokeWidth: number }>;
}> = [
  { key: 'system', title: 'System', subtitle: 'Match your device setting', Icon: Smartphone },
  { key: 'light', title: 'Light', subtitle: 'Always use the light theme', Icon: Sun },
  { key: 'dark', title: 'Dark', subtitle: 'Always use the dark theme', Icon: Moon },
];

/**
 * Appearance + a link-through to Notifications. Deliberately does NOT
 * duplicate the notification toggles here — `Notifications.tsx` already owns
 * that state via `useNotificationPreferences()`, and rendering a second copy
 * of the same switches on two screens risks them drifting out of sync
 * mid-session. A single "Manage Notifications" row keeps one source of truth.
 *
 * App Language is intentionally not built here — skipped per explicit
 * product instruction, not an oversight.
 */
const Preferences = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const theme = useTheme();
  const mode = useThemeStore((s) => s.mode);
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  // Every screen using useTheme() re-renders instantly — the tap itself
  // commits, no separate "confirm"/"restart now?" step needed.
  const handleSelect = (next: ThemeMode) => {
    if (next === mode) return;
    commitThemeMode(next);
  };

  return (
    <Screen background="page">
      <AppBar title="App Preferences" onBack={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[theme.text.overline, styles.sectionLabel]}>APPEARANCE</Text>
        <Card padding="none" elevation="xs">
          {APPEARANCE_OPTIONS.map(({ key, title, subtitle, Icon }, index) => {
            const selected = mode === key;
            return (
              <View key={key}>
                {index > 0 ? <Divider spacing={0} /> : null}
                <ListItem
                  title={title}
                  subtitle={subtitle}
                  icon={<Icon size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />}
                  showChevron={false}
                  onPress={() => handleSelect(key)}
                  right={
                    selected ? (
                      <View style={styles.checkCircle}>
                        <Check size={14} color={theme.colors.text.inverse} strokeWidth={3} />
                      </View>
                    ) : (
                      <View style={styles.radio} />
                    )
                  }
                />
              </View>
            );
          })}
        </Card>

        <Text style={[theme.text.overline, styles.sectionLabel]}>NOTIFICATIONS</Text>
        <Card padding="none" elevation="xs">
          <ListItem
            title="Manage Notifications"
            subtitle="Order updates, offers, Food Feed and more"
            icon={<Bell size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />}
            onPress={() => navigation.navigate('Notifications')}
          />
        </Card>

        <View style={styles.footer}>
          <Pressable onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={[theme.text.caption, styles.footerLink]}>Privacy Policy</Text>
          </Pressable>
          <Text style={[theme.text.caption, styles.footerDot]}>·</Text>
          <Pressable onPress={() => navigation.navigate('TermsOfService')}>
            <Text style={[theme.text.caption, styles.footerLink]}>Terms of Service</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default Preferences;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    scroll: {
      paddingHorizontal: theme.layout.screenPadding,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xxxl,
    },
    sectionLabel: {
      color: theme.colors.text.tertiary,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.borders.default,
    },
    checkCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary[600],
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xxl,
    },
    footerLink: {
      color: theme.colors.text.secondary,
      textDecorationLine: 'underline',
    },
    footerDot: {
      color: theme.colors.text.tertiary,
    },
  });
