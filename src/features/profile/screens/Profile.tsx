import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { formatCurrency, formatPhone } from '@utils/format';
import Logo from '@components/Logo';
import AppGradient from '@components/AppGradient';
import PressableScale from '@animations/PressableScale';
import { enterRise } from '@animations/motion';
import {
  AddressIcon, BellIcon, CardIcon, ChevronRightIcon, CoinIcon, GiftIcon, HeartIcon, HelpIcon, KitchenIcon,
  LogoutIcon, OrdersIcon, PencilIcon, SettingsIcon, TrashIcon, WalletIcon,
} from '@components/icons';
import { Avatar, Card, Divider, Screen, Skeleton } from '@components/ui';
import { BalanceTile, GlassStat, IconBadge, QuickAction, SettingsRow } from '../components/ProfileBlocks';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useAuthStore } from '@features/authentication/store/authStore';
import { useRequireAuth } from '@features/authentication/hooks/useRequireAuth';
import { useReferralSummary } from '@features/referral/hooks/useReferral';
import { useWalletSummary } from '@features/wallet/hooks/useWallet';
import { useLogout, useProfile, useProfileStats } from '../hooks/useProfile';
import { useTabBarFootprint, useTabBarScrollHandler } from '@app/navigation/private/tabBarVisibility';
import { useTheme } from '@app/theme/useTheme';

/** Account home: hero, balances, quick actions, grouped settings, partner promo, destructive group. */
const Profile = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const requireAuth = useRequireAuth();
  const onTabBarScroll = useTabBarScrollHandler();
  const tabBarFootprint = useTabBarFootprint();
  const storedUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: user } = useProfile();
  const { data: stats, isLoading: isStatsLoading } = useProfileStats();
  const { data: referral } = useReferralSummary();
  const { data: wallet } = useWalletSummary();
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onTabBarScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scroll, { paddingBottom: theme.spacing.xxxl + tabBarFootprint }]}
      >
        <Animated.View entering={enterRise(0)}>
          <AppGradient colors={theme.colors.defaultColor} style={styles.hero}>
            <View style={styles.heroRow}>
              <View style={styles.avatarRing}>
                <Avatar uri={profile?.profileImage} name={profile?.fullName} size={68} />
              </View>
              <View style={styles.heroText}>
                <Text style={[theme.text.h2, styles.heroName]} numberOfLines={1}>
                  {profile?.fullName || 'FreshBhoj user'}
                </Text>
                <Text style={[theme.text.bodySmall, styles.heroMeta]} numberOfLines={1}>
                  {formatPhone(profile?.phone)}
                </Text>
                {profile?.email ? (
                  <Text style={[theme.text.caption, styles.heroMeta]} numberOfLines={1}>
                    {profile.email}
                  </Text>
                ) : null}
              </View>
            </View>

            <PressableScale
              onPress={() => navigation.navigate('EditProfile')}
              haptic={false}
              scaleTo={0.97}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              style={styles.editPill}
            >
              <PencilIcon size={16} color={theme.colors.palette.white} tint="rgba(255,255,255,0.28)" />
              <Text style={[theme.text.label, styles.editLabel]}>Edit profile</Text>
            </PressableScale>

            {stats ? (
              <View style={styles.statsRow}>
                <GlassStat value={stats.orderCount} label="Orders" />
                <GlassStat value={stats.favoriteCount} label="Favourites" />
                <GlassStat value={stats.followingCount} label="Following" />
              </View>
            ) : isAuthenticated && isStatsLoading ? (
              <Skeleton height={56} radius={theme.radius.xl} style={styles.statsSkeleton} />
            ) : null}
          </AppGradient>
        </Animated.View>

        <Animated.View entering={enterRise(1)} style={styles.balanceRow}>
          <BalanceTile
            icon={WalletIcon}
            tone="brand"
            label="Wallet"
            value={wallet ? formatCurrency(wallet.balanceRs) : 'Add money'}
            onPress={() => requireAuth(() => navigation.navigate('Wallet'))}
          />
          <BalanceTile
            icon={CoinIcon}
            tone="marigold"
            label="FreshBhoj Coins"
            value={referral ? String(referral.coinsBalance) : 'Earn coins'}
            onPress={() => requireAuth(() => navigation.navigate('Referral'))}
          />
        </Animated.View>

        <Animated.View entering={enterRise(2)} style={styles.grid}>
          <QuickAction
            icon={OrdersIcon}
            label="Orders"
            count={stats?.orderCount}
            onPress={() => navigation.navigate('Orders')}
          />
          <QuickAction
            icon={AddressIcon}
            label="Addresses"
            count={stats?.addressCount}
            onPress={() => navigation.navigate('Addresses')}
          />
          <QuickAction
            icon={HeartIcon}
            label="Favourites"
            count={stats?.favoriteCount}
            onPress={() => navigation.navigate('Favorites')}
          />
          <QuickAction
            icon={KitchenIcon}
            label="Following"
            count={stats?.followingCount}
            onPress={() => navigation.navigate('FollowedKitchens')}
          />
        </Animated.View>

        <Animated.View entering={enterRise(3)}>
          <Card padding="none" elevation="xs" style={styles.section}>
            <SettingsRow
              icon={CardIcon}
              title="Payment Methods"
              subtitle="Cards & UPI"
              onPress={() => requireAuth(() => navigation.navigate('PaymentMethods'))}
            />
            <Divider spacing={0} />
            <SettingsRow
              icon={GiftIcon}
              title="Refer & Earn"
              subtitle={referral ? `${referral.coinsBalance} FreshBhoj Coins` : 'Invite friends, earn coins'}
              onPress={() => requireAuth(() => navigation.navigate('Referral'))}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={enterRise(4)}>
          <Card padding="none" elevation="xs" style={styles.section}>
            <SettingsRow
              icon={BellIcon}
              title="Notifications"
              onPress={() => navigation.navigate('Notifications')}
            />
            <Divider spacing={0} />
            <SettingsRow
              icon={SettingsIcon}
              title="App Preferences"
              subtitle="Appearance & more"
              onPress={() => navigation.navigate('Preferences')}
            />
            <Divider spacing={0} />
            <SettingsRow
              icon={HelpIcon}
              title="Help & Support"
              subtitle="WhatsApp us, or read the FAQs"
              onPress={() => navigation.navigate('Support')}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={enterRise(5)}>
          <PressableScale
            onPress={() => navigation.navigate('Login', { intent: 'KITCHEN' })}
            haptic={false}
            scaleTo={0.98}
            accessibilityRole="button"
            style={styles.promo}
          >
            <IconBadge icon={KitchenIcon} tone="marigold" size={48} />
            <View style={styles.promoText}>
              <Text style={[theme.text.h3, styles.promoTitle]} numberOfLines={1}>Register your Kitchen</Text>
              <Text style={[theme.text.bodySmall, styles.promoSub]} numberOfLines={2}>
                Become a FreshBhoj partner
              </Text>
            </View>
            <ChevronRightIcon size={20} color={theme.colors.amber[500]} />
          </PressableScale>
        </Animated.View>

        <Animated.View entering={enterRise(6)}>
          <Card padding="none" elevation="xs" style={styles.section}>
            <SettingsRow icon={LogoutIcon} tone="danger" title="Log Out" showChevron={false} onPress={handleLogout} />
            <Divider spacing={0} />
            <SettingsRow
              icon={TrashIcon}
              tone="danger"
              title="Delete Account"
              subtitle="Permanently delete your account and data"
              onPress={() => navigation.navigate('DeleteAccount')}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={enterRise(7)} style={styles.brandFooter}>
          <Logo size="sm" />
          <Text style={[theme.text.caption, styles.version]}>Jaipur · v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
};

export default Profile;

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  scroll: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl,
  },
  hero: {
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroText: { flex: 1 },
  heroName: { color: theme.colors.palette.white },
  heroMeta: { color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  editPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editLabel: { color: theme.colors.palette.white },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  statsSkeleton: { marginTop: theme.spacing.lg },
  balanceRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.radius.card,
    backgroundColor: `${theme.colors.amber[500]}1F`,
    borderWidth: 1,
    borderColor: `${theme.colors.amber[500]}66`,
  },
  promoText: { flex: 1 },
  promoTitle: { color: theme.colors.text.primary },
  promoSub: { color: theme.colors.text.secondary, marginTop: 1 },
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
