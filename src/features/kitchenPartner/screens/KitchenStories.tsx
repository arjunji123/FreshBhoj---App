import React, { useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, Eye, Heart, Pencil, Share2, Trash2 } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { Badge, Button, Card, EmptyState, Screen, Skeleton } from '@components/ui';
import { KitchenApiError } from '../api/kitchenClient';
import {
  useDeactivateStory,
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

  const handleCompose = async () => {
    const result = await launchImageLibrary({ mediaType: 'mixed', quality: 0.8, selectionLimit: 1 });
    if (result.didCancel || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];
    const mediaType = asset.type?.startsWith('video') ? 'VIDEO' : 'IMAGE';

    upload.mutate(
      {
        asset: { uri: asset.uri!, type: asset.type, fileName: asset.fileName },
        purpose: 'STORY_MEDIA',
        fallbackType: mediaType === 'VIDEO' ? 'video/mp4' : 'image/jpeg',
      },
      {
        onSuccess: (res) =>
          publish.mutate(
            { mediaType, mediaUrl: res.url },
            {
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
      { text: 'Delete', style: 'destructive', onPress: () => deactivate.mutate(story.id) },
    ]);
  };

  const startEdit = (story: KitchenStory) => {
    setEditingId(story.id);
    setDraftCaption(story.caption ?? '');
  };

  const saveCaption = (id: string) => {
    updateCaption.mutate({ id, caption: draftCaption }, { onSuccess: () => setEditingId(null) });
  };

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Text style={theme.text.h1}>Stories</Text>
        <Button
          title={upload.isPending || publish.isPending ? 'Posting…' : 'New story'}
          leftIcon={<Camera size={16} color={theme.colors.palette.white} />}
          size="sm"
          fullWidth={false}
          loading={upload.isPending || publish.isPending}
          onPress={handleCompose}
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
          data={query.data ?? []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: theme.spacing.paddings.sm }}
          contentContainerStyle={query.data?.length ? styles.listPadding : styles.emptyPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={theme.colors.primary[600]} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Camera size={28} color={theme.colors.text.tertiary} />}
              title="No stories yet"
              description="Post a photo or video of a dish — customers see it for 24 hours."
              actionLabel="Post your first story"
              onAction={handleCompose}
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.storyCard} padding="sm">
              <Image source={{ uri: item.thumbnailUrl ?? item.mediaUrl }} style={styles.storyThumb} />

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
  listPadding: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl, gap: theme.spacing.paddings.sm },
  emptyPadding: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.layout.screenPadding },
  storyCard: { flex: 1, marginBottom: theme.spacing.paddings.sm },
  storyThumb: { width: '100%', height: 120, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface.subtle },
  orderBadge: { marginTop: theme.spacing.paddings.xs, alignSelf: 'flex-start' },
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
