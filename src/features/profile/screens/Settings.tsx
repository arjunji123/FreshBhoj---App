import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, ChefHat, MessageCircle, Sparkles, Tag } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { AppBar, Card, Divider, ListItem, Skeleton } from '@components/ui';
import type { NotificationPreferences } from '@api/types';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import {
  useLogout,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '../hooks/useProfile';

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

const Settings = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const logout = useLogout();

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  };

  return (
    <View style={styles.screen}>
      <AppBar title="Settings" onBack={navigation.goBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[theme.text.overline, styles.sectionLabel]}>NOTIFICATIONS</Text>

        {isLoading || !preferences ? (
          <Skeleton height={280} radius={theme.radius.card} />
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

        <Text style={[theme.text.overline, styles.sectionLabel]}>ACCOUNT</Text>
        <Card padding="none" elevation="xs">
          <ListItem title="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
          <Divider spacing={0} />
          <ListItem title="Saved addresses" onPress={() => navigation.navigate('Addresses')} />
          <Divider spacing={0} />
          <ListItem title="Help & support" onPress={() => navigation.navigate('Support')} />
          <Divider spacing={0} />
          <ListItem title="Log out" destructive showChevron={false} onPress={handleLogout} />
        </Card>

        <Text style={[theme.text.caption, styles.version]}>FreshBhoj · Jaipur · v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  scroll: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl,
  },
  sectionLabel: {
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  version: {
    textAlign: 'center',
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xl,
  },
});
