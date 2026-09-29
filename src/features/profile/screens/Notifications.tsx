import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
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
import { AppBar, Card, Divider, EmptyState, ListItem, Skeleton } from '@components/ui';
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
    title: 'DELIVERY & ACTIVITY',
    toggles: [
      {
        key: 'orderUpdates',
        title: 'Order Status Updates',
        subtitle: 'Accepted, preparing, out for delivery',
        Icon: Bell,
      },
      {
        key: 'subscriptionReminders',
        title: 'Subscription Reminders',
        subtitle: 'Renewal, pause & upcoming delivery alerts',
        Icon: CalendarClock,
      },
      {
        key: 'reelActivity',
        title: 'Kitchen Activity',
        subtitle: 'Behind-the-scenes alerts when your favorite chef starts cooking',
        Icon: Sparkles,
      },
      {
        key: 'newKitchens',
        title: 'New Kitchens Nearby',
        subtitle: 'When we verify a kitchen in your area',
        Icon: ChefHat,
      },
      {
        key: 'whatsappUpdates',
        title: 'WhatsApp Updates',
        subtitle: 'Order status on WhatsApp',
        Icon: MessageCircle,
      },
    ],
  },
  {
    title: 'PERSONALIZATION',
    toggles: [
      {
        key: 'dailyAiRecommendations',
        title: 'Daily AI Recommendations',
        subtitle: 'Personalized meal picks based on your goals',
        Icon: WandSparkles,
      },
      { key: 'promotions', title: 'Promotional Offers', subtitle: 'Coupons and deals', Icon: Tag },
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
      <AppBar title="Notifications" onBack={navigation.goBack} />

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
                <Text style={[theme.text.overline, styles.sectionLabel]}>{section.title}</Text>
                <Card padding="none" elevation="xs">
                  {section.toggles.map(({ key, title, subtitle, Icon }, index) => (
                    <View key={key}>
                      {index > 0 ? <Divider spacing={0} /> : null}
                      <ListItem
                        title={title}
                        subtitle={subtitle}
                        icon={<Icon size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />}
                        showChevron={false}
                        right={
                          <Switch
                            value={preferences[key]}
                            onValueChange={(value) => updatePreferences.mutate({ [key]: value })}
                            trackColor={{
                              false: theme.colors.neutral[200],
                              true: theme.colors.accent[400],
                            }}
                            thumbColor={theme.colors.surface.base}
                          />
                        }
                      />
                    </View>
                  ))}
                </Card>
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
    marginBottom: theme.spacing.xl,
  },
  sectionLabel: {
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.md,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.neutral[50],
  },
  infoNoteText: {
    flex: 1,
    color: theme.colors.text.tertiary,
  },
});
