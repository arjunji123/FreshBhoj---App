import React, { useEffect, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, Share, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Camera, Clock, Crown, LogOut, Mail, MapPin, Phone, Plus, Share2, ShieldCheck, Star, Trash2, X } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Badge, Button, Card, EmptyState, Input, Screen, Skeleton } from '@components/ui';
import { KitchenApiError } from '../api/kitchenClient';
import { useKitchenAuthStore } from '../store/kitchenAuthStore';
import { useKitchenLogout } from '../hooks/useKitchenAuth';
import {
  useKitchenOnboardingStatus,
  useKitchenProfile,
  useKitchenUpload,
  useSetAcceptingOrders,
  useUpdateKitchenProfile,
} from '../hooks/useKitchenPortal';
import type { KitchenProfile as KitchenProfileType } from '../kitchenPartner.types';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';

const MAX_SPECIALITIES = 10;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

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
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={profile.isRefetching}
            onRefresh={() => {
              profile.refetch();
              onboarding.refetch();
            }}
            tintColor={theme.colors.primary[600]}
          />
        }
      >
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
              {profile.data.logoUrl ? <Image source={{ uri: profile.data.logoUrl }} style={styles.logo} accessibilityLabel="Kitchen logo" /> : null}
              <Text style={styles.kitchenName} numberOfLines={2}>
                {profile.data.name}
              </Text>
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

        <Card style={styles.card} onPress={() => navigation.navigate('PremiumSubscriptionDetail')}>
          <View style={styles.fssaiRow}>
            <View style={styles.fssaiIconWrap}>
              <Crown size={16} color={theme.colors.brand.primary} />
            </View>
            <View style={styles.fssaiTextWrap}>
              <Text style={styles.fssaiTitle}>Kitchen Premium</Text>
              <Text style={styles.fssaiSubtitle}>Unlock more reels, advanced analytics, AI tools and priority boost.</Text>
            </View>
          </View>
        </Card>

        {profile.data ? <KitchenDetailsCard profile={profile.data} /> : null}

        {profile.data ? <SpecialitiesCard profile={profile.data} /> : null}

        {profile.data ? <PublicLinkCard slug={profile.data.slug} /> : null}

        <Card style={styles.card} onPress={handleLogout}>
          <View style={styles.logoutRow}>
            <LogOut size={16} color={theme.colors.text.secondary} />
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
 * The kitchen's public basics — the same fields the website's profile page
 * edits, sent through `PATCH /partner/kitchen`. Only fields that actually
 * changed are sent so an untouched field can never trip the strict DTO.
 */
function KitchenDetailsCard({ profile }: { profile: KitchenProfileType }) {
  const updateProfile = useUpdateKitchenProfile();
  const upload = useKitchenUpload();

  const fromProfile = (p: KitchenProfileType) => ({
    name: p.name,
    tagline: p.tagline ?? '',
    description: p.description ?? '',
    // Stored as +91XXXXXXXXXX; the field only edits the 10 digits.
    contactPhone: (p.contactPhone ?? '').replace(/^\+91/, ''),
    prepTimeMins: String(p.prepTimeMins),
    opensAt: p.opensAt,
    closesAt: p.closesAt,
  });

  const [form, setForm] = useState(() => fromProfile(profile));

  useEffect(() => {
    setForm(fromProfile(profile));
  }, [profile]);

  const baseline = fromProfile(profile);
  const isDirty = (Object.keys(form) as (keyof typeof form)[]).some((key) => form[key] !== baseline[key]);
  const setField = (key: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const showError = (title: string, error: unknown) =>
    Alert.alert(title, error instanceof KitchenApiError ? error.message : 'Please try again.');

  const handleSave = () => {
    if (form.name.trim().length < 3) return Alert.alert('Kitchen name', 'The name needs to be at least 3 characters.');
    if (form.contactPhone && !/^[6-9]\d{9}$/.test(form.contactPhone)) {
      return Alert.alert('Contact number', 'Enter a valid 10-digit Indian mobile number.');
    }
    const prep = Number(form.prepTimeMins);
    if (!Number.isInteger(prep) || prep < 5 || prep > 180) {
      return Alert.alert('Prep time', 'Prep time must be a whole number of minutes between 5 and 180.');
    }
    if (!TIME_RE.test(form.opensAt) || !TIME_RE.test(form.closesAt)) {
      return Alert.alert('Opening hours', 'Use 24-hour HH:mm format, e.g. 09:00.');
    }

    const patch: Partial<KitchenProfileType> = {};
    if (form.name.trim() !== baseline.name) patch.name = form.name.trim();
    if (form.tagline.trim() !== baseline.tagline) patch.tagline = form.tagline.trim();
    if (form.description.trim() !== baseline.description) patch.description = form.description.trim();
    if (form.contactPhone !== baseline.contactPhone) patch.contactPhone = form.contactPhone ? `+91${form.contactPhone}` : undefined;
    if (form.prepTimeMins !== baseline.prepTimeMins) patch.prepTimeMins = prep;
    if (form.opensAt !== baseline.opensAt) patch.opensAt = form.opensAt;
    if (form.closesAt !== baseline.closesAt) patch.closesAt = form.closesAt;

    updateProfile.mutate(patch, { onError: (error) => showError('Could not save', error) });
  };

  const handlePickLogo = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 });
    if (result.didCancel || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];
    upload.mutate(
      {
        asset: { uri: asset.uri!, type: asset.type, fileName: asset.fileName, fileSize: asset.fileSize },
        purpose: 'KITCHEN_LOGO',
        fallbackType: 'image/jpeg',
      },
      {
        onSuccess: ({ url }) => updateProfile.mutate({ logoUrl: url }, { onError: (error) => showError('Could not save logo', error) }),
        onError: (error) => showError('Could not upload logo', error),
      },
    );
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.sectionTitle}>Kitchen details</Text>

      <TouchableOpacity
        onPress={handlePickLogo}
        disabled={upload.isPending || updateProfile.isPending}
        style={styles.logoPicker}
        accessibilityRole="button"
        accessibilityLabel="Change kitchen logo"
      >
        {profile.logoUrl ? (
          <Image source={{ uri: profile.logoUrl }} style={styles.logoLarge} />
        ) : (
          <View style={[styles.logoLarge, styles.logoPlaceholder]}>
            <Camera size={20} color={theme.colors.brand.primary} />
          </View>
        )}
        <Text style={styles.logoHint}>{upload.isPending ? 'Uploading…' : profile.logoUrl ? 'Change logo' : 'Add a logo'}</Text>
      </TouchableOpacity>

      <Input label="Kitchen name" value={form.name} onChangeText={setField('name')} maxLength={80} containerStyle={styles.detailField} />
      <Input label="Tagline" value={form.tagline} onChangeText={setField('tagline')} maxLength={120} placeholder="e.g. Home-style North Indian meals" containerStyle={styles.detailField} />
      <Input
        label="Description"
        value={form.description}
        onChangeText={setField('description')}
        maxLength={1000}
        multiline
        numberOfLines={3}
        placeholder="Tell customers what makes your kitchen special"
        containerStyle={styles.detailField}
      />
      <Input
        label="Contact number"
        value={form.contactPhone}
        onChangeText={(value) => setField('contactPhone')(value.replace(/\D/g, '').slice(0, 10))}
        prefix="+91"
        keyboardType="number-pad"
        placeholder="98765 43210"
        containerStyle={styles.detailField}
      />
      <Input label="Prep time (mins)" value={form.prepTimeMins} onChangeText={(v) => setField('prepTimeMins')(v.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={3} containerStyle={styles.detailField} />
      <View style={styles.hoursRow}>
        <Input label="Opens at" value={form.opensAt} onChangeText={setField('opensAt')} placeholder="09:00" maxLength={5} containerStyle={styles.hoursField} />
        <Input label="Closes at" value={form.closesAt} onChangeText={setField('closesAt')} placeholder="21:00" maxLength={5} containerStyle={styles.hoursField} />
      </View>
      <Text style={styles.hoursHint}>Day-by-day hours and holidays live under Operating Hours.</Text>

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
    if (specialities.length >= MAX_SPECIALITIES) {
      Alert.alert('Tag limit reached', `You can add up to ${MAX_SPECIALITIES} specialities.`);
      return;
    }
    setSpecialities((prev) => [...prev, tag]);
    setDraftTag('');
  };

  const removeTag = (tag: string) => setSpecialities((prev) => prev.filter((t) => t !== tag));

  const handleSave = () => {
    const capacityValue = capacity.trim() ? Number(capacity) : null;
    if (capacityValue !== null && (!Number.isInteger(capacityValue) || capacityValue < 1)) {
      Alert.alert('Check the capacity', 'Capacity must be a whole number of orders, 1 or more.');
      return;
    }
    updateProfile.mutate(
      // `null` clears a previously saved capacity (the DTO treats null as "unset").
      { specialities, capacity: capacityValue },
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
              <TouchableOpacity
                onPress={() => removeTag(tag)}
                hitSlop={theme.layout.hitSlop}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${tag}`}
              >
                <X size={12} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.addTagRow}>
        <Input
          value={draftTag}
          onChangeText={setDraftTag}
          placeholder="e.g. No onion no garlic"
          containerStyle={styles.tagInput}
          size="md"
          onSubmitEditing={addTag}
          returnKeyType="done"
        />
        <TouchableOpacity
          onPress={addTag}
          style={styles.addTagButton}
          hitSlop={theme.layout.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Add speciality"
        >
          <Plus size={16} color={theme.colors.brand.primary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, styles.capacityTitle]}>Kitchen capacity</Text>
      <Input
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="number-pad"
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
  tagInput: { flex: 1 },
  addTagButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.primarySubtle,
  },
  capacityField: { marginTop: theme.spacing.paddings.xs },
  logo: { width: 40, height: 40, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.subtle },
  logoPicker: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.md, marginVertical: theme.spacing.paddings.md, minHeight: 56 },
  logoLarge: { width: 56, height: 56, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.subtle },
  logoPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.brand.primarySubtle },
  logoHint: { ...theme.text.bodySmall, color: theme.colors.text.brand, fontWeight: '700' as const },
  detailField: { marginBottom: theme.spacing.paddings.md },
  hoursRow: { flexDirection: 'row', gap: theme.spacing.paddings.md },
  hoursField: { flex: 1 },
  hoursHint: { ...theme.text.caption, color: theme.colors.text.tertiary, marginBottom: theme.spacing.paddings.xs },
  saveButton: { marginTop: theme.spacing.paddings.md, alignSelf: 'flex-end' },
  linkText: { ...theme.text.bodySmall, color: theme.colors.text.brand, marginTop: theme.spacing.paddings.sm },
  shareButton: { marginTop: theme.spacing.paddings.md },
});
