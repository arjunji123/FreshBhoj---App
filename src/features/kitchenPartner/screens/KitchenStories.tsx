import React, { useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, Eye, Heart, Pencil, Share2, ShoppingBag, Trash2, Video, X } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Badge, Button, Card, Chip, ChipRow, EmptyState, Input, Screen, Sheet, Skeleton } from '@components/ui';
import type { SheetHandle } from '@components/ui';
import { KitchenApiError } from '../api/kitchenClient';
import {
  useDeactivateStory,
  useKitchenMenu,
  useKitchenStories,
  useKitchenUpload,
  usePublishStory,
  useUpdateStoryCaption,
} from '../hooks/useKitchenPortal';
import type { KitchenStory } from '../kitchenPartner.types';

const KitchenStories = () => {
  const query = useKitchenStories();
  const deactivate = useDeactivateStory();
  const updateCaption = useUpdateStoryCaption();
  const upload = useKitchenUpload();
  const publish = usePublishStory();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftCaption, setDraftCaption] = useState('');

  const composeSheetRef = useRef<SheetHandle>(null);
  const menu = useKitchenMenu();
  const [pickedAsset, setPickedAsset] = useState<{ uri: string; type?: string; fileName?: string; fileSize?: number } | null>(null);
  const [composeCaption, setComposeCaption] = useState('');
  const [composeMealId, setComposeMealId] = useState('');

  // A published dish must be orderable — linking a draft would make the story shoppable for something customers can't order.
  const availableMeals = useMemo(() => (menu.data ?? []).filter((meal) => meal.isAvailable), [menu.data]);
  const activeStories = useMemo(
    () => (query.data ?? []).filter((story) => story.isActive && new Date(story.expiresAt).getTime() > Date.now()),
    [query.data],
  );
  const pickedIsVideo = pickedAsset?.type?.startsWith('video') ?? false;

  const resetCompose = () => {
    setPickedAsset(null);
    setComposeCaption('');
    setComposeMealId('');
  };

  const openCompose = () => {
    resetCompose();
    composeSheetRef.current?.open();
  };

  const handlePickMedia = async () => {
    const result = await launchImageLibrary({ mediaType: 'mixed', quality: 0.8, selectionLimit: 1 });
    if (result.didCancel || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];
    setPickedAsset({ uri: asset.uri!, type: asset.type, fileName: asset.fileName, fileSize: asset.fileSize });
  };

  const handlePublish = () => {
    if (!pickedAsset) return;
    const mediaType = pickedIsVideo ? 'VIDEO' : 'IMAGE';
    upload.mutate(
      { asset: pickedAsset, purpose: 'STORY_MEDIA', fallbackType: mediaType === 'VIDEO' ? 'video/mp4' : 'image/jpeg' },
      {
        onSuccess: (res) =>
          publish.mutate(
            {
              mediaType,
              mediaUrl: res.url,
              caption: composeCaption.trim() || undefined,
              mealId: composeMealId || undefined,
              durationSec: mediaType === 'VIDEO' ? 15 : undefined,
            },
            {
              onSuccess: () => {
                composeSheetRef.current?.close();
                resetCompose();
              },
              onError: (error) =>
                Alert.alert('Could not post story', error instanceof KitchenApiError ? error.message : 'Please try again.'),
            },
          ),
        onError: (error) =>
          Alert.alert('Could not upload', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  const handleDelete = (story: KitchenStory) => {
    Alert.alert('Delete this story?', 'It will stop showing to customers immediately.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deactivate.mutate(story.id, {
            onError: (error) => Alert.alert('Could not delete story', error instanceof KitchenApiError ? error.message : 'Please try again.'),
          }),
      },
    ]);
  };

  const startEdit = (story: KitchenStory) => {
    setEditingId(story.id);
    setDraftCaption(story.caption ?? '');
  };

  const saveCaption = (id: string) => {
    updateCaption.mutate(
      { id, caption: draftCaption.trim() },
      {
        onSuccess: () => setEditingId(null),
        onError: (error) => Alert.alert('Could not save caption', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  return (
    <Screen background="page">
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={theme.text.h1}>Stories</Text>
          <Text style={styles.subtitle}>Live for 24 hours, with real engagement stats</Text>
        </View>
        <Button
          title="New story"
          leftIcon={<Camera size={16} color={theme.colors.palette.white} />}
          size="sm"
          fullWidth={false}
          onPress={openCompose}
        />
      </View>

      {query.isError ? (
        <View style={styles.emptyPadding}>
          <EmptyState title="Something went wrong" description="We couldn't load your stories." actionLabel="Retry" onAction={() => query.refetch()} />
        </View>
      ) : query.isLoading ? (
        <View style={styles.listPadding}>
          {[0, 1].map((i) => (
            <Skeleton key={i} height={200} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.sm }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={activeStories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={activeStories.length ? styles.listPadding : styles.emptyPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.colors.primary[600]} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Camera size={28} color={theme.colors.text.tertiary} />}
              title="No active stories"
              description="Publish one to show up in the customer app's Kitchen Stories rail — it stays live for 24 hours."
              actionLabel="Post your first story"
              onAction={openCompose}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.storyCard} padding="sm">
              <View>
                <Image source={{ uri: item.thumbnailUrl ?? item.mediaUrl }} style={styles.storyThumb} />
                <Badge label={timeLeft(item.expiresAt)} tone="neutral" size="sm" style={styles.expiryBadge} />
                {item.mediaType === 'VIDEO' ? (
                  <View style={styles.videoMark}>
                    <Video size={12} color={theme.colors.palette.white} />
                  </View>
                ) : null}
              </View>
              {item.mealName ? (
                <View style={styles.mealRow}>
                  <ShoppingBag size={11} color={theme.colors.text.tertiary} />
                  <Text style={styles.mealText} numberOfLines={1}>
                    {item.mealName}
                  </Text>
                </View>
              ) : null}

              {item.orderCount > 0 ? (
                <Badge label={`${item.orderCount} orders from this`} tone="accent" size="sm" style={styles.orderBadge} />
              ) : null}

              <View style={styles.statsRow}>
                <StatChip icon={<Eye size={11} color={theme.colors.text.tertiary} />} value={item.viewCount} />
                <StatChip icon={<Heart size={11} color={theme.colors.text.tertiary} />} value={item.likeCount} />
                <StatChip icon={<Share2 size={11} color={theme.colors.text.tertiary} />} value={item.shareCount} />
              </View>

              {editingId === item.id ? (
                <View>
                  <Input
                    value={draftCaption}
                    onChangeText={setDraftCaption}
                    placeholder="Caption…"
                    containerStyle={styles.captionInput}
                    maxLength={150}
                    multiline
                    size="md"
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity onPress={() => setEditingId(null)} style={styles.textButton} accessibilityRole="button">
                      <Text style={styles.editCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => saveCaption(item.id)} style={styles.textButton} accessibilityRole="button">
                      <Text style={styles.editSave}>{updateCaption.isPending ? 'Saving…' : 'Save'}</Text>
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
                    <TouchableOpacity onPress={() => startEdit(item)} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Edit caption">
                      <Pencil size={13} color={theme.colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Delete">
                      <Trash2 size={13} color={theme.colors.text.danger} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Card>
          )}
        />
      )}

      <Sheet ref={composeSheetRef} title="New story" eyebrow="Live for 24 hours" heightRatio={0.85} onClose={resetCompose}>
        <ScrollView contentContainerStyle={styles.composeBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.composeLabel}>Photo or short video (required)</Text>
          {pickedAsset ? (
            <View style={styles.previewWrap}>
              {pickedIsVideo ? (
                <View style={[styles.preview, styles.previewVideo]}>
                  <Video size={24} color={theme.colors.palette.white} />
                </View>
              ) : (
                <Image source={{ uri: pickedAsset.uri }} style={styles.preview} accessibilityLabel="Story preview" />
              )}
              <TouchableOpacity
                onPress={() => setPickedAsset(null)}
                style={styles.previewRemove}
                hitSlop={theme.layout.hitSlop}
                accessibilityRole="button"
                accessibilityLabel="Remove media"
              >
                <X size={14} color={theme.colors.text.inverse} />
              </TouchableOpacity>
            </View>
          ) : (
            <Card style={styles.pickCard} onPress={handlePickMedia}>
              <Camera size={22} color={theme.colors.text.tertiary} />
              <Text style={styles.pickText}>Add media</Text>
            </Card>
          )}

          <Input
            label={`Caption (optional) — ${composeCaption.length}/150`}
            value={composeCaption}
            onChangeText={(v) => setComposeCaption(v.slice(0, 150))}
            placeholder="Fresh out of the tandoor"
            maxLength={150}
            multiline
            containerStyle={styles.composeField}
          />

          <Text style={styles.composeLabel}>Link a dish (optional) — makes the story shoppable, with order tracking</Text>
          <ChipRow style={styles.composeField}>
            <Chip label="No dish linked" selected={composeMealId === ''} onPress={() => setComposeMealId('')} />
            {availableMeals.map((meal) => (
              <Chip
                key={meal.id}
                label={`${meal.name} — ₹${meal.price}`}
                selected={composeMealId === meal.id}
                onPress={() => setComposeMealId(meal.id)}
              />
            ))}
          </ChipRow>

          <Button
            title={upload.isPending ? 'Uploading…' : publish.isPending ? 'Publishing…' : 'Publish story'}
            onPress={handlePublish}
            disabled={!pickedAsset || upload.isPending || publish.isPending}
            loading={upload.isPending || publish.isPending}
          />
        </ScrollView>
      </Sheet>
    </Screen>
  );
};

function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  return hours > 0 ? `${hours}h left` : `${Math.max(1, Math.floor(ms / 60000))}m left`;
}

function StatChip({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <View style={styles.statChip}>
      {icon}
      <Text style={styles.statChipText}>{value}</Text>
    </View>
  );
}

export default KitchenStories;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.paddings.sm,
    paddingBottom: theme.spacing.paddings.md,
  },
  headerText: { flex: 1, paddingRight: theme.spacing.paddings.sm },
  subtitle: { ...theme.text.caption, color: theme.colors.text.tertiary },
  expiryBadge: { position: 'absolute', top: 6, left: 6 },
  videoMark: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.overlay.glassStrong,
  },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: theme.spacing.paddings.xs },
  mealText: { ...theme.text.caption, color: theme.colors.text.secondary, flex: 1 },
  composeBody: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl },
  composeLabel: { ...theme.text.label, color: theme.colors.text.primary, marginBottom: theme.spacing.paddings.xs },
  composeField: { marginBottom: theme.spacing.paddings.md },
  pickCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 140,
    width: 110,
    marginBottom: theme.spacing.paddings.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.borders.default,
  },
  pickText: { ...theme.text.caption, color: theme.colors.text.secondary, fontWeight: '700' as const },
  previewWrap: { width: 110, height: 140, marginBottom: theme.spacing.paddings.md },
  preview: { width: 110, height: 140, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.subtle },
  previewVideo: { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.neutral[900] },
  previewRemove: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.state.error,
  },
  listPadding: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl, gap: theme.spacing.paddings.sm },
  columnWrapper: { gap: theme.spacing.paddings.sm },
  emptyPadding: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.layout.screenPadding },
  storyCard: { flex: 1, marginBottom: theme.spacing.paddings.sm },
  storyThumb: { width: '100%', height: 120, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.subtle },
  orderBadge: { marginTop: theme.spacing.paddings.xs, alignSelf: 'flex-start' },
  statsRow: { flexDirection: 'row', gap: theme.spacing.paddings.sm, marginTop: theme.spacing.paddings.xs },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statChipText: { ...theme.text.caption, color: theme.colors.text.tertiary },
  captionText: { ...theme.text.caption, color: theme.colors.text.secondary, marginTop: theme.spacing.paddings.xs },
  captionInput: { marginTop: theme.spacing.paddings.xs },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.paddings.md, marginTop: theme.spacing.paddings.xs },
  textButton: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  editCancel: { ...theme.text.caption, color: theme.colors.text.tertiary, fontWeight: '700' as const },
  editSave: { ...theme.text.caption, color: theme.colors.brand.primary, fontWeight: '700' as const },
  rowActions: { flexDirection: 'row', gap: theme.spacing.paddings.sm, marginTop: theme.spacing.paddings.xs },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
