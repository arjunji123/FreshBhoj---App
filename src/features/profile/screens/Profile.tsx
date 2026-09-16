import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, ChefHat, Gift, Heart, HelpCircle, LogOut, MapPin, Pencil, Receipt, Trash2 } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatPhone } from '@utils/format';
import Logo from '@components/Logo';
import { AppBarAction, Avatar, Card, Divider, ListItem, Screen, Skeleton } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useAuthStore } from '@features/authentication/store/authStore';
import { useRequireAuth } from '@features/authentication/hooks/useRequireAuth';
import { useReferralSummary } from '@features/referral/hooks/useReferral';
import { useLogout, useProfile, useProfileStats } from '../hooks/useProfile';

const ICON_PROPS = { size: 18, strokeWidth: 2.2 };

/** Account home. Deliberately plain — this screen is a hub, not a destination. */
const Profile = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const requireAuth = useRequireAuth();
  const storedUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: user } = useProfile();
  const { data: stats, isLoading: isStatsLoading } = useProfileStats();
  const { data: referral } = useReferralSummary();
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
          <View style={styles.editButton}>
            <AppBarAction
              onPress={() => navigation.navigate('EditProfile')}
              accessibilityLabel="Edit profile"
            >
              <Pencil size={16} color={theme.colors.primary[600]} strokeWidth={2.2} />
            </AppBarAction>
          </View>

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
          ) : isAuthenticated && isStatsLoading ? (
            <>
              <Divider spacing={theme.spacing.lg} />
              <Skeleton height={40} radius={theme.radius.sm} />
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
          <Divider spacing={0} />
          <ListItem
            title="Refer & Earn"
            subtitle={referral ? `${referral.coinsBalance} FreshBhoj Coins` : 'Invite friends, earn coins'}
            icon={<Gift {...ICON_PROPS} color={theme.colors.primary[600]} />}
            onPress={() => requireAuth(() => navigation.navigate('Referral'))}
          />
        </Card>

        <Card padding="none" elevation="xs" style={styles.section}>
          <ListItem
            title="Notifications"
            icon={<Bell {...ICON_PROPS} color={theme.colors.primary[600]} />}
            onPress={() => navigation.navigate('Notifications')}
          />
          <Divider spacing={0} />
          <ListItem
            title="Help & Support"
            subtitle="WhatsApp us, or read the FAQs"
            icon={<HelpCircle {...ICON_PROPS} color={theme.colors.primary[600]} />}
            onPress={() => navigation.navigate('Support')}
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
          <Divider spacing={0} />
          <ListItem
            title="Delete Account"
            subtitle="Permanently delete your account and data"
            destructive
            icon={<Trash2 {...ICON_PROPS} color={theme.colors.state.error} />}
            onPress={() => navigation.navigate('DeleteAccount')}
          />
        </Card>

        <View style={styles.brandFooter}>
          <Logo size="sm" />
          <Text style={[theme.text.caption, styles.version]}>Jaipur · v1.0.0</Text>
        </View>
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
  editButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  headerText: {
    flex: 1,
    paddingRight: theme.spacing.xxl,
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
  brandFooter: {
    alignItems: 'center',
    gap: 4,
    marginTop: theme.spacing.xl,
  },
  version: {
    textAlign: 'center',
    color: theme.colors.text.tertiary,
  },
});
