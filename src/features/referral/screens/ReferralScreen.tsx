import React from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Coins, Share2, Users } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { AppBar, Card, EmptyState, Screen, Skeleton } from '@components/ui';
import GradientButton from '@components/GradientButton';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import ReferralPrinter from '../components/ReferralPrinter';
import { useReferralSummary } from '../hooks/useReferral';

const REFERRAL_LINK_BASE = 'https://freshbhoj.com/refer';

const ReferralScreen = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { data, isLoading, isError, refetch } = useReferralSummary();

  const handleInvite = () => {
    if (!data) return;
    Share.share({
      message:
        `Join me on FreshBhoj — verified home kitchens, real nutrition numbers. ` +
        `Use my code ${data.code} when you sign up and we both get FreshBhoj Coins!\n` +
        `${REFERRAL_LINK_BASE}/${data.code}`,
    }).catch(() => undefined);
  };

  return (
    <Screen background="page">
      <AppBar title="Refer & Earn" onBack={navigation.goBack} />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={theme.text.h2}>Invite friends, earn together</Text>
          <Text style={[theme.text.body, styles.heroSubtitle]}>
            Share your code — you get 100 FreshBhoj Coins, they get 50, the moment they sign up.
          </Text>
        </View>

        {isLoading ? (
          <Skeleton height={80} radius={theme.radius.card} />
        ) : isError || !data ? null : (
          <Card padding="md" elevation="xs" style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Coins size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />
                <Text style={theme.text.h3}>{data.coinsBalance}</Text>
                <Text style={[theme.text.caption, styles.statLabel]}>FreshBhoj Coins</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Users size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />
                <Text style={theme.text.h3}>{data.invitesCount}</Text>
                <Text style={[theme.text.caption, styles.statLabel]}>Friends invited</Text>
              </View>
            </View>
          </Card>
        )}

        {isLoading ? (
          <Skeleton height={360} radius={theme.radius.card} style={styles.printerSkeleton} />
        ) : isError || !data ? (
          <EmptyState
            title="Could not load your referral code"
            description="Check your connection and try again."
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        ) : (
          <ReferralPrinter code={data.code} />
        )}

        <Card padding="md" elevation="xs" style={styles.howCard}>
          <Text style={[theme.text.label, styles.howTitle]}>HOW IT WORKS</Text>
          <HowStep index={1} text="Share your code with a friend who hasn't tried FreshBhoj yet" />
          <HowStep index={2} text="They enter it right after signing up (or skip it — no pressure)" />
          <HowStep index={3} text="You both get FreshBhoj Coins toward your next healthy order" />
        </Card>
      </ScrollView>

      {data ? (
        <View style={styles.footer}>
          <GradientButton
            title="Invite Friends"
            onPress={handleInvite}
            rightIcon={<Share2 size={18} color={theme.colors.palette.white} strokeWidth={2.2} />}
            gradientColors={theme.colors.defaultColor}
            direction="diagonal"
          />
        </View>
      ) : null}
    </Screen>
  );
};

const HowStep: React.FC<{ index: number; text: string }> = ({ index, text }) => (
  <View style={styles.howStep}>
    <View style={styles.howBadge}>
      <Text style={styles.howBadgeText}>{index}</Text>
    </View>
    <Text style={[theme.text.bodySmall, styles.howText]}>{text}</Text>
  </View>
);

export default ReferralScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl,
  },
  hero: {
    marginBottom: theme.spacing.lg,
  },
  heroSubtitle: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  statsCard: {
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.borders.subtle,
  },
  statLabel: {
    color: theme.colors.text.tertiary,
  },
  printerSkeleton: {
    marginBottom: theme.spacing.lg,
  },
  howCard: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  howTitle: {
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  howStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  howBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  howBadgeText: {
    color: theme.colors.primary[600],
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    fontSize: theme.typography.fontSizes.sm,
  },
  howText: {
    flex: 1,
    color: theme.colors.text.secondary,
  },
  footer: {
    padding: theme.layout.screenPadding,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.surface.base,
  },
});
