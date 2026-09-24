import React, { useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Clapperboard, Eye, Heart, Pencil, Share2, Trash2 } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Badge, Button, Card, Chip, EmptyState, Screen, Skeleton } from '@components/ui';
import { KitchenApiError } from '../api/kitchenClient';
import {
  useArchiveReel,
  useKitchenMenu,
  useKitchenReels,
  useKitchenUpload,
  usePublishReel,
  useUpdateReel,
} from '../hooks/useKitchenPortal';
import type { KitchenReel } from '../kitchenPartner.types';

const KitchenReels = () => {
  const query = useKitchenReels();
  const menu = useKitchenMenu();
  const archive = useArchiveReel();
  const updateReel = useUpdateReel();
  const upload = useKitchenUpload();
  const publish = usePublishReel();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftCaption, setDraftCaption] = useState('');

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtagsInput, setHashtagsInput] = useState('');
  const [mealId, setMealId] = useState<string | undefined>(undefined);

  const resetCompose = () => {
    setVideoUrl(null);
    setCaption('');
    setHashtagsInput('');
    setMealId(undefined);
  };

  const handlePickVideo = async () => {
    const result = await launchImageLibrary({ mediaType: 'video', quality: 0.8, selectionLimit: 1 });
    if (result.didCancel || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];

    upload.mutate(
      { asset: { uri: asset.uri!, type: asset.type, fileName: asset.fileName }, purpose: 'REEL_VIDEO', fallbackType: 'video/mp4' },
      {
        onSuccess: (res) => setVideoUrl(res.url),
        onError: (error) =>
          Alert.alert('Could not upload', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  const handlePublish = () => {
    if (!videoUrl) return;
    const hashtags = hashtagsInput
      .split(/[\s,]+/)
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter(Boolean);

    publish.mutate(
      {
        videoUrl,
        caption: caption.trim() || undefined,
        hashtags: hashtags.length ? hashtags : undefined,
        mealId,
      },
      {
        onSuccess: resetCompose,
        onError: (error) =>
          Alert.alert('Could not post reel', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  const handleDelete = (reel: KitchenReel) => {
    Alert.alert('Take down this reel?', 'It will stop showing to customers immediately.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => archive.mutate(reel.id) },
    ]);
  };

  const startEdit = (reel: KitchenReel) => {
    setEditingId(reel.id);
    setDraftCaption(reel.caption ?? '');
  };

  const saveCaption = (id: string) => {
    updateReel.mutate({ id, input: { caption: draftCaption } }, { onSuccess: () => setEditingId(null) });
  };

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Text style={theme.text.h1}>Reels</Text>
        <Button
          title={upload.isPending ? 'Uploading…' : 'New reel'}
          leftIcon={<Clapperboard size={16} color={theme.colors.palette.white} />}
          size="sm"
          fullWidth={false}
          loading={upload.isPending}
          onPress={handlePickVideo}
        />
      </View>

      {videoUrl ? (
        <Card style={styles.composeCard} padding="md">
          <Text style={theme.text.overline}>Video uploaded</Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Caption…"
            style={styles.captionInput}
            maxLength={150}
            multiline
          />
          <TextInput
            value={hashtagsInput}
            onChangeText={setHashtagsInput}
            placeholder="Hashtags, comma or space separated"
            style={styles.hashtagsInput}
          />
          {menu.data?.length ? (
            <>
              <Text style={styles.composeLabel}>Link a dish (optional)</Text>
              <View style={styles.mealWrap}>
                {menu.data.map((meal) => (
                  <Chip
                    key={meal.id}
                    label={meal.name}
                    selected={mealId === meal.id}
                    onPress={() => setMealId(mealId === meal.id ? undefined : meal.id)}
                  />
                ))}
              </View>
            </>
          ) : null}
          <View style={styles.composeActions}>
            <TouchableOpacity onPress={resetCompose}>
              <Text style={styles.editCancel}>Cancel</Text>
            </TouchableOpacity>
            <Button
              title={publish.isPending ? 'Posting…' : 'Post reel'}
              size="sm"
              fullWidth={false}
              loading={publish.isPending}
              onPress={handlePublish}
            />
          </View>
        </Card>
      ) : null}

      {query.isError ? (
        <View style={styles.emptyPadding}>
          <EmptyState title="Something went wrong" description="We couldn't load your reels." actionLabel="Retry" onAction={() => query.refetch()} />
        </View>
      ) : query.isLoading ? (
        <View style={styles.listPadding}>
          {[0, 1].map((i) => (
            <Skeleton key={i} height={200} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.sm }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={query.data ?? []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: theme.spacing.paddings.sm }}
          contentContainerStyle={query.data?.length ? styles.listPadding : styles.emptyPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.colors.primary[600]} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Clapperboard size={28} color={theme.colors.text.tertiary} />}
              title="No reels yet"
              description="Post a short video of a dish — it shows up in every customer's Food Feed until you take it down."
              actionLabel="Post your first reel"
              onAction={handlePickVideo}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.reelCard} padding="sm">
              {item.thumbnailUrl ? (
                <Image source={{ uri: item.thumbnailUrl }} style={styles.reelThumb} />
              ) : (
                <View style={[styles.reelThumb, styles.reelThumbFallback]}>
                  <Clapperboard size={28} color={theme.colors.text.tertiary} />
                </View>
              )}

              {item.status !== 'PUBLISHED' ? (
                <Badge
                  label={item.status === 'ARCHIVED' ? 'Archived' : 'Draft'}
                  tone="neutral"
                  size="sm"
                  style={styles.statusBadge}
                />
              ) : null}

              {item.mealName ? <Badge label={item.mealName} tone="accent" size="sm" style={styles.mealBadge} /> : null}

              <View style={styles.statsRow}>
                <StatChip icon={<Eye size={11} color={theme.colors.text.tertiary} />} value={item.viewCount} />
                <StatChip icon={<Heart size={11} color={theme.colors.text.tertiary} />} value={item.likeCount} />
                <StatChip icon={<Share2 size={11} color={theme.colors.text.tertiary} />} value={item.shareCount} />
              </View>

              {editingId === item.id ? (
                <View>
                  <TextInput
                    value={draftCaption}
                    onChangeText={setDraftCaption}
                    placeholder="Caption…"
                    style={styles.captionInput}
                    maxLength={150}
                    multiline
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity onPress={() => setEditingId(null)}>
                      <Text style={styles.editCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => saveCaption(item.id)}>
                      <Text style={styles.editSave}>{updateReel.isPending ? 'Saving…' : 'Save'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  {item.caption ? (
                    <Text style={styles.captionText} numberOfLines={2}>
                      {item.caption}
                    </Text>
                  ) : null}
                  <View style={styles.rowActions}>
                    <TouchableOpacity onPress={() => startEdit(item)} style={styles.iconButton}>
                      <Pencil size={13} color={theme.colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconButton}>
                      <Trash2 size={13} color={theme.colors.text.danger} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Card>
          )}
        />
      )}
    </Screen>
  );
};

function StatChip({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <View style={styles.statChip}>
      {icon}
      <Text style={styles.statChipText}>{value}</Text>
    </View>
  );
}

export default KitchenReels;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.paddings.sm,
    paddingBottom: theme.spacing.paddings.md,
  },
  composeCard: { marginHorizontal: theme.layout.screenPadding, marginBottom: theme.spacing.paddings.md },
  composeLabel: { ...theme.text.caption, color: theme.colors.text.secondary, marginTop: theme.spacing.paddings.sm },
  mealWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.paddings.xs, marginTop: theme.spacing.paddings.xs },
  composeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.paddings.lg,
    marginTop: theme.spacing.paddings.md,
  },
  hashtagsInput: {
    ...theme.text.caption,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.borders.default,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.paddings.xs,
    marginTop: theme.spacing.paddings.sm,
  },
  listPadding: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl, gap: theme.spacing.paddings.sm },
  emptyPadding: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.layout.screenPadding },
  reelCard: { flex: 1, marginBottom: theme.spacing.paddings.sm },
  reelThumb: { width: '100%', height: 160, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.subtle },
  reelThumbFallback: { alignItems: 'center', justifyContent: 'center' },
  statusBadge: { marginTop: theme.spacing.paddings.xs, alignSelf: 'flex-start' },
  mealBadge: { marginTop: theme.spacing.paddings.xs, alignSelf: 'flex-start' },
  statsRow: { flexDirection: 'row', gap: theme.spacing.paddings.sm, marginTop: theme.spacing.paddings.xs },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statChipText: { ...theme.text.caption, color: theme.colors.text.tertiary },
  captionText: { ...theme.text.caption, color: theme.colors.text.secondary, marginTop: theme.spacing.paddings.xs },
  captionInput: {
    ...theme.text.caption,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.borders.default,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.paddings.xs,
    marginTop: theme.spacing.paddings.xs,
    minHeight: 44,
  },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.paddings.md, marginTop: theme.spacing.paddings.xs },
  editCancel: { ...theme.text.caption, color: theme.colors.text.tertiary, fontWeight: '700' as const },
  editSave: { ...theme.text.caption, color: theme.colors.brand.primary, fontWeight: '700' as const },
  rowActions: { flexDirection: 'row', gap: theme.spacing.paddings.sm, marginTop: theme.spacing.paddings.xs },
  iconButton: { padding: 4 },
});
