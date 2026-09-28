import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Clock, LogOut, Mail, MapPin, Phone, Plus, Share2, ShieldCheck, Star, Trash2, X } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Badge, Button, Card, EmptyState, Input, Screen, Skeleton } from '@components/ui';
import { KitchenApiError } from '../api/kitchenClient';
import { useKitchenAuthStore } from '../store/kitchenAuthStore';
import { useKitchenLogout } from '../hooks/useKitchenAuth';
import {
  useKitchenOnboardingStatus,
  useKitchenProfile,
  useSetAcceptingOrders,
  useUpdateKitchenProfile,
} from '../hooks/useKitchenPortal';
import type { KitchenProfile as KitchenProfileType } from '../kitchenPartner.types';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';

const KitchenProfile = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const account = useKitchenAuthStore((s) => s.account);
  const profile = useKitchenProfile();
  const onboarding = useKitchenOnboardingStatus();
  const setAccepting = useSetAcceptingOrders();
  const logout = useKitchenLogout();

  const fssaiDoc = onboarding.data?.documents.find((doc) => doc.type === 'FSSAI');
  const hasVerifiedFssai = fssaiDoc?.status === 'VERIFIED';

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

        {!onboarding.isLoading && !hasVerifiedFssai ? (
          <Card style={styles.card} onPress={() => navigation.navigate('FssaiAssistance')}>
            <View style={styles.fssaiRow}>
              <View style={styles.fssaiIconWrap}>
                <ShieldCheck size={16} color={theme.colors.brand.primary} />
              </View>
              <View style={styles.fssaiTextWrap}>
                <Text style={styles.fssaiTitle}>Get FSSAI assistance</Text>
                <Text style={styles.fssaiSubtitle}>
                  {fssaiDoc ? "We're verifying your FSSAI licence." : "Let FreshBhoj register your FSSAI food-safety licence for you."}
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        <Card style={styles.card} onPress={() => navigation.navigate('KitchenTimings')}>
          <View style={styles.fssaiRow}>
            <View style={styles.fssaiIconWrap}>
              <Clock size={16} color={theme.colors.brand.primary} />
            </View>
            <View style={styles.fssaiTextWrap}>
              <Text style={styles.fssaiTitle}>Operating Hours</Text>
              <Text style={styles.fssaiSubtitle}>Weekly hours, holidays and emergency close.</Text>
            </View>
          </View>
        </Card>

        {profile.data ? <SpecialitiesCard profile={profile.data} /> : null}

        {profile.data ? <PublicLinkCard slug={profile.data.slug} /> : null}

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

/**
 * Free-form tags + a numeric capacity, wired through the general-purpose
 * `PATCH /partner/kitchen` update endpoint (`useUpdateKitchenProfile`) that
 * was already defined in the API layer but had no UI using it yet.
 */
function SpecialitiesCard({ profile }: { profile: KitchenProfileType }) {
  const updateProfile = useUpdateKitchenProfile();
  const [specialities, setSpecialities] = useState<string[]>(profile.specialities ?? []);
  const [draftTag, setDraftTag] = useState('');
  const [capacity, setCapacity] = useState(profile.capacity != null ? String(profile.capacity) : '');

  useEffect(() => {
    setSpecialities(profile.specialities ?? []);
    setCapacity(profile.capacity != null ? String(profile.capacity) : '');
  }, [profile.specialities, profile.capacity]);

  const isDirty =
    JSON.stringify(specialities) !== JSON.stringify(profile.specialities ?? []) ||
    capacity !== (profile.capacity != null ? String(profile.capacity) : '');

  const addTag = () => {
    const tag = draftTag.trim();
    if (!tag || specialities.includes(tag)) {
      setDraftTag('');
      return;
    }
    setSpecialities((prev) => [...prev, tag]);
    setDraftTag('');
  };

  const removeTag = (tag: string) => setSpecialities((prev) => prev.filter((t) => t !== tag));

  const handleSave = () => {
    updateProfile.mutate(
      { specialities, capacity: capacity.trim() ? Number(capacity) : undefined },
      {
        onError: (error) =>
          Alert.alert('Could not save', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>Specialities</Text>
      {specialities.length ? (
        <View style={styles.tagWrap}>
          {specialities.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(tag)} hitSlop={theme.layout.hitSlop}>
                <X size={12} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.addTagRow}>
        <TextInput
          value={draftTag}
          onChangeText={setDraftTag}
          placeholder="e.g. No onion no garlic"
          style={styles.tagInput}
          onSubmitEditing={addTag}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={addTag} style={styles.addTagButton} hitSlop={theme.layout.hitSlop}>
          <Plus size={16} color={theme.colors.brand.primary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, styles.capacityTitle]}>Kitchen capacity</Text>
      <Input
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="numeric"
        placeholder="e.g. 40 orders/day"
        containerStyle={styles.capacityField}
      />

      {isDirty ? (
        <Button
          title={updateProfile.isPending ? 'Saving…' : 'Save changes'}
          size="sm"
          fullWidth={false}
          loading={updateProfile.isPending}
          onPress={handleSave}
          style={styles.saveButton}
        />
      ) : null}
    </Card>
  );
}

/**
 * No clipboard module is available without a new native dependency (the RN
 * core `Clipboard` API was removed years ago, and `@react-native-clipboard/
 * clipboard` needs native linking this environment's broken toolchain can't
 * verify) — so the link is rendered as selectable text (long-press to copy
 * on both platforms) plus a native Share sheet, which needs no new
 * dependency since `Share` ships inside react-native core.
 */
function PublicLinkCard({ slug }: { slug: string }) {
  const link = `https://freshbhoj.com/kitchen/${slug}`;

  const handleShare = () => {
    Share.share({ message: link }).catch(() => {});
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>Public kitchen page</Text>
      <Text selectable style={styles.linkText}>
        {link}
      </Text>
      <Button
        title="Share Public Link"
        variant="outline"
        size="sm"
        fullWidth={false}
        leftIcon={<Share2 size={14} color={theme.colors.text.primary} />}
        onPress={handleShare}
        style={styles.shareButton}
      />
    </Card>
  );
}

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
  fssaiRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm },
  fssaiTextWrap: { flex: 1 },
  fssaiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.brand.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fssaiTitle: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  fssaiSubtitle: { ...theme.text.caption, color: theme.colors.text.secondary, marginTop: 2 },
  logoutRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm, justifyContent: 'center' },
  logoutText: { ...theme.text.bodyMedium, color: theme.colors.text.danger, fontWeight: '700' as const },
  sectionTitle: { ...theme.text.label, color: theme.colors.text.primary },
  capacityTitle: { marginTop: theme.spacing.paddings.md },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.paddings.xs, marginTop: theme.spacing.paddings.sm },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.brand.primarySubtle,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.paddings.sm,
    paddingVertical: 6,
  },
  tagText: { ...theme.text.caption, color: theme.colors.text.brand, fontWeight: '700' as const },
  addTagRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm, marginTop: theme.spacing.paddings.sm },
  tagInput: {
    flex: 1,
    ...theme.text.bodySmall,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.borders.default,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.paddings.sm,
    paddingVertical: theme.spacing.paddings.xs,
  },
  addTagButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.primarySubtle,
  },
  capacityField: { marginTop: theme.spacing.paddings.xs },
  saveButton: { marginTop: theme.spacing.paddings.md, alignSelf: 'flex-end' },
  linkText: { ...theme.text.bodySmall, color: theme.colors.text.brand, marginTop: theme.spacing.paddings.sm },
  shareButton: { marginTop: theme.spacing.paddings.md },
});
