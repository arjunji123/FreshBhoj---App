import React from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AlertCircle, Bell, ChefHat, MessageCircle, Sparkles, Tag } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { AppBar, Card, Divider, EmptyState, ListItem, Skeleton } from '@components/ui';
import type { NotificationPreferences } from '@api/types';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '../hooks/useProfile';

const TOGGLES: Array<{
  key: keyof NotificationPreferences;
  title: string;
  subtitle: string;
  Icon: any;
}> = [
  {
    key: 'orderUpdates',
    title: 'Order updates',
    subtitle: 'Accepted, preparing, out for delivery',
    Icon: Bell,
  },
  { key: 'promotions', title: 'Offers & discounts', subtitle: 'Coupons and deals', Icon: Tag },
  {
    key: 'newKitchens',
    title: 'New kitchens',
    subtitle: 'When we verify a kitchen in your area',
    Icon: ChefHat,
  },
  {
    key: 'reelActivity',
    title: 'Food Feed activity',
    subtitle: 'New reels from kitchens you follow',
    Icon: Sparkles,
  },
  {
    key: 'whatsappUpdates',
    title: 'WhatsApp updates',
    subtitle: 'Order status on WhatsApp',
    Icon: MessageCircle,
  },
];

const Notifications = () => {
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
          <Card padding="none" elevation="xs">
            {TOGGLES.map(({ key, title, subtitle, Icon }, index) => (
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
        )}
      </ScrollView>
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  scroll: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl,
  },
});
