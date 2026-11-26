import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  AlertCircle,
  Bell,
  CalendarClock,
  ChefHat,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Tag,
  WandSparkles,
} from 'lucide-react-native';
import { AppBar, EmptyState, Skeleton, Text } from '@components/ui';
import type { NotificationPreferences } from '@api/types';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '../hooks/useProfile';
import { useTheme } from "@app/theme/useTheme";

type ToggleConfig = {
  key: keyof NotificationPreferences;
  title: string;
  subtitle: string;
  Icon: any;
};

// Two labeled sections. `reelActivity` is mapped to "Kitchen Activity" rather
// than `newKitchens` — its existing copy ("new reels from kitchens you
// follow") is the behind-the-scenes, favorite-kitchen signal the mockup
// means, whereas `newKitchens` is about discovering kitchens you don't
// follow yet, so it stays alongside it as its own toggle.
const SECTIONS: Array<{ title: string; toggles: ToggleConfig[] }> = [
  {
    title: 'Delivery & activity',
    toggles: [
      {
        key: 'orderUpdates',
        title: 'Order status',
        subtitle: 'Accepted, preparing, out for delivery',
        Icon: Bell,
      },
      {
        key: 'subscriptionReminders',
        title: 'Meal plan reminders',
        subtitle: 'Renewals, pauses and upcoming deliveries',
        Icon: CalendarClock,
      },
      {
        key: 'reelActivity',
        title: 'Kitchen activity',
        subtitle: 'When a kitchen you follow starts cooking',
        Icon: Sparkles,
      },
      {
        key: 'newKitchens',
        title: 'New kitchens nearby',
        subtitle: 'When we verify a kitchen in your area',
        Icon: ChefHat,
      },
      {
        key: 'whatsappUpdates',
        title: 'WhatsApp updates',
        subtitle: 'Order status on WhatsApp',
        Icon: MessageCircle,
      },
    ],
  },
  {
    title: 'Personalization',
    toggles: [
      {
        key: 'dailyAiRecommendations',
        title: 'Daily AI picks',
        subtitle: 'Meals matched to your goals',
        Icon: WandSparkles,
      },
      { key: 'promotions', title: 'Offers and coupons', subtitle: 'Deals from FreshBhoj', Icon: Tag },
    ],
  },
];

const Notifications = () => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const { data: preferences, isLoading, isError, refetch } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  return (
    <View style={styles.screen}>
      <AppBar title="Notification settings" onBack={navigation.goBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {isLoading ? (
          <Skeleton height={280} radius={theme.radius.card} />
        ) : isError || !preferences ? (
          <EmptyState
            icon={<AlertCircle size={36} color={theme.colors.state.error} strokeWidth={1.8} />}
            title="Could not load your preferences"
            description="Check your connection and try again."
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        ) : (
          <>
            {SECTIONS.map((section) => (
              <View key={section.title} style={styles.section}>
                <Text style={[theme.text.label, styles.sectionLabel]}>{section.title}</Text>
                <View style={styles.card}>
                  {section.toggles.map(({ key, title, subtitle, Icon }, index) => (
                    <View key={key} style={[styles.row, index > 0 ? styles.rowDivider : null]}>
                      <View style={styles.iconWrap}>
                        <Icon size={16} color={theme.colors.primary[600]} strokeWidth={2.2} />
                      </View>
                      <View style={styles.rowText}>
                        <Text style={theme.text.label}>{title}</Text>
                        <Text style={[theme.text.caption, styles.rowSub]} numberOfLines={2}>
                          {subtitle}
                        </Text>
                      </View>
                      <Switch
                        value={preferences[key]}
                        onValueChange={(value) => updatePreferences.mutate({ [key]: value })}
                        accessibilityLabel={title}
                        trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[400] }}
                        thumbColor={theme.colors.palette.white}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <View style={styles.infoNote}>
              <ShieldCheck size={15} color={theme.colors.text.tertiary} strokeWidth={2.2} />
              <Text style={[theme.text.caption, styles.infoNoteText]}>
                Critical system updates and account security notifications cannot be disabled.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default Notifications;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  scroll: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  card: {
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface.raised,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.brandWash,
  },
  rowText: {
    flex: 1,
  },
  rowSub: {
    color: theme.colors.text.tertiary,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  infoNoteText: {
    flex: 1,
    color: theme.colors.text.tertiary,
  },
});
