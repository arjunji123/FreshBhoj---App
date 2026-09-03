import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Bell,
  ChefHat,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Receipt,
  Settings as SettingsIcon,
  UserCog,
} from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatPhone } from '@utils/format';
import { Avatar, Card, Divider, ListItem, Screen } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useAuthStore } from '@features/authentication/store/authStore';
import { useLogout, useProfile, useProfileStats } from '../hooks/useProfile';

const ICON_PROPS = { size: 18, strokeWidth: 2.2 };

/** Account home. Deliberately plain — this screen is a hub, not a destination. */
const Profile = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const storedUser = useAuthStore((s) => s.user);

  const { data: user } = useProfile();
  const { data: stats } = useProfileStats();
  const logout = useLogout();

  // Render from the persisted copy first so the header never flashes empty.
  const profile = user ?? storedUser;

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  };

  return (
    <Screen background="page">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Card padding="lg" elevation="sm" style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Avatar uri={profile?.profileImage} name={profile?.fullName} size={62} />
            <View style={styles.headerText}>
              <Text style={theme.text.h2} numberOfLines={1}>
                {profile?.fullName || 'FreshBhoj user'}
              </Text>
              <Text style={[theme.text.bodySmall, styles.headerMeta]} numberOfLines={1}>
                {formatPhone(profile?.phone)}
              </Text>
              {profile?.email ? (
                <Text style={[theme.text.caption, styles.headerMeta]} numberOfLines={1}>
                  {profile.email}
                </Text>
              ) : null}
            </View>
          </View>

          {stats ? (
            <>
              <Divider spacing={theme.spacing.lg} />
              <View style={styles.statsRow}>
                <Stat value={stats.orderCount} label="Orders" />
                <Stat value={stats.favoriteCount} label="Favourites" />
                <Stat value={stats.followingCount} label="Following" />
              </View>
            </>
          ) : null}
        </Card>

        <Card padding="none" elevation="xs" style={styles.section}>
          <ListItem
            title="Your Orders"
            subtitle="Track, reorder and rate"
            icon={<Receipt {...ICON_PROPS} color={theme.colors.primary[600]} />}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Orders' })}
          />
          <Divider spacing={0} />
          <ListItem
            title="Saved Addresses"
            subtitle={stats ? `${stats.addressCount} saved` : undefined}
            icon={<MapPin {...ICON_PROPS} color={theme.colors.primary[600]} />}
            onPress={() => navigation.navigate('Addresses')}
          />
          <Divider spacing={0} />
          <ListItem
            title="Favourite Meals"
            icon={<Heart {...ICON_PROPS} color={theme.colors.primary[600]} />}
            onPress={() => navigation.navigate('Favorites')}
          />
          <Divider spacing={0} />
          <ListItem
            title="Kitchens You Follow"
            icon={<ChefHat {...ICON_PROPS} color={theme.colors.primary[600]} />}
            onPress={() => navigation.navigate('FollowedKitchens')}
          />
        </Card>

        <Card padding="none" elevation="xs" style={styles.section}>
          <ListItem
            title="Edit Profile"
            icon={<UserCog {...ICON_PROPS} color={theme.colors.primary[600]} />}
            onPress={() => navigation.navigate('EditProfile')}
          />
          <Divider spacing={0} />
          <ListItem
            title="Notifications"
            icon={<Bell {...ICON_PROPS} color={theme.colors.primary[600]} />}
            onPress={() => navigation.navigate('Settings')}
          />
          <Divider spacing={0} />
          <ListItem
            title="Help & Support"
            subtitle="WhatsApp us, or read the FAQs"
            icon={<HelpCircle {...ICON_PROPS} color={theme.colors.primary[600]} />}
            onPress={() => navigation.navigate('Support')}
          />
          <Divider spacing={0} />
          <ListItem
            title="Settings"
            icon={<SettingsIcon {...ICON_PROPS} color={theme.colors.primary[600]} />}
            onPress={() => navigation.navigate('Settings')}
          />
        </Card>

        <Card padding="none" elevation="xs" style={styles.section}>
          <ListItem
            title="Log Out"
            destructive
            showChevron={false}
            icon={<LogOut {...ICON_PROPS} color={theme.colors.state.error} />}
            onPress={handleLogout}
          />
        </Card>

        <Text style={[theme.text.caption, styles.version]}>FreshBhoj · Jaipur · v1.0.0</Text>
      </ScrollView>
    </Screen>
  );
};

const Stat: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <View style={styles.stat}>
    <Text style={theme.text.h3}>{value}</Text>
    <Text style={[theme.text.caption, styles.statLabel]}>{label}</Text>
  </View>
);

export default Profile;

const styles = StyleSheet.create({
  scroll: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl,
  },
  headerCard: {
    marginBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  headerMeta: {
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  version: {
    textAlign: 'center',
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.md,
  },
});
