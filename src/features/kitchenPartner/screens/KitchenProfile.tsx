import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LogOut, Mail, MapPin, Phone, Star, Trash2 } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Badge, Card, EmptyState, Screen, Skeleton } from '@components/ui';
import { KitchenApiError } from '../api/kitchenClient';
import { useKitchenAuthStore } from '../store/kitchenAuthStore';
import { useKitchenLogout } from '../hooks/useKitchenAuth';
import { useKitchenProfile, useSetAcceptingOrders } from '../hooks/useKitchenPortal';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';

const KitchenProfile = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const account = useKitchenAuthStore((s) => s.account);
  const profile = useKitchenProfile();
  const setAccepting = useSetAcceptingOrders();
  const logout = useKitchenLogout();

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  };

  return (
    <Screen background="page">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={theme.text.h1}>Kitchen Profile</Text>

        {profile.isError ? (
          <EmptyState
            title="Something went wrong"
            description="We couldn't load your profile."
            actionLabel="Retry"
            onAction={() => profile.refetch()}
          />
        ) : profile.isLoading || !profile.data ? (
          <Skeleton height={160} radius={theme.radius.card} style={{ marginTop: theme.spacing.paddings.md }} />
        ) : (
          <Card style={styles.card}>
            <View style={styles.nameRow}>
              <Text style={styles.kitchenName}>{profile.data.name}</Text>
              {profile.data.isVerified ? <Badge label="Verified" tone="brand" size="sm" /> : null}
            </View>
            {profile.data.tagline ? <Text style={styles.tagline}>{profile.data.tagline}</Text> : null}

            <View style={styles.metaRow}>
              <Star size={13} color={theme.colors.amber[500]} />
              <Text style={styles.metaText}>
                {profile.data.rating ? profile.data.rating.toFixed(1) : '—'} ({profile.data.ratingCount} reviews)
              </Text>
            </View>
            {profile.data.contactPhone ? (
              <View style={styles.metaRow}>
                <Phone size={13} color={theme.colors.text.tertiary} />
                <Text style={styles.metaText}>{profile.data.contactPhone}</Text>
              </View>
            ) : null}
            <View style={styles.metaRow}>
              <MapPin size={13} color={theme.colors.text.tertiary} />
              <Text style={styles.metaText}>{profile.data.city}</Text>
            </View>

            <View style={styles.acceptingRow}>
              <Text style={styles.acceptingLabel}>Accepting orders</Text>
              <Switch
                value={profile.data.isAcceptingOrders}
                onValueChange={(value) =>
                  setAccepting.mutate(value, {
                    onError: (error) =>
                      Alert.alert('Could not update status', error instanceof KitchenApiError ? error.message : 'Please try again.'),
                  })
                }
                disabled={setAccepting.isPending}
                trackColor={{ true: theme.colors.brand.primary }}
              />
            </View>
          </Card>
        )}

        {account?.email ? (
          <Card style={styles.card}>
            <View style={styles.metaRow}>
              <Mail size={13} color={theme.colors.text.tertiary} />
              <Text style={styles.metaText}>{account.email}</Text>
            </View>
          </Card>
        ) : null}

        <Card style={styles.card} onPress={handleLogout}>
          <View style={styles.logoutRow}>
            <LogOut size={16} color={theme.colors.text.danger} />
            <Text style={styles.logoutText}>{logout.isPending ? 'Logging out…' : 'Log out'}</Text>
          </View>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('KitchenDeleteAccount')}>
          <View style={styles.logoutRow}>
            <Trash2 size={16} color={theme.colors.text.danger} />
            <Text style={styles.logoutText}>Delete Account</Text>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
};

export default KitchenProfile;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.xxl },
  card: { marginTop: theme.spacing.paddings.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.xs },
  kitchenName: { ...theme.text.h3, color: theme.colors.text.primary },
  tagline: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: theme.spacing.paddings.sm },
  metaText: { ...theme.text.bodySmall, color: theme.colors.text.secondary },
  acceptingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.paddings.md,
    paddingTop: theme.spacing.paddings.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  acceptingLabel: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  logoutRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm, justifyContent: 'center' },
  logoutText: { ...theme.text.bodyMedium, color: theme.colors.text.danger, fontWeight: '700' as const },
});
