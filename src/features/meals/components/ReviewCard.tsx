import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MessageCircle, ThumbsUp } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatRelativeTime } from '@utils/format';
import { Avatar, Badge } from '@components/ui';
import { StarRow } from '@components/ui/Rating';
import type { Review } from '@api/types';

interface ReviewCardProps {
  review: Review;
  onHelpful?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onHelpful }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Avatar uri={review.author.avatar} name={review.author.name} size={38} />
      <View style={styles.headerText}>
        <Text style={theme.text.h4} numberOfLines={1}>
          {review.author.name}
        </Text>
        <View style={styles.metaRow}>
          <StarRow value={review.rating} size={12} />
          <Text style={[theme.text.caption, styles.time]}>
            {formatRelativeTime(review.createdAt)}
          </Text>
        </View>
      </View>
      {review.isVerified ? <Badge label="Verified" tone="accent" /> : null}
    </View>

    {review.comment ? (
      <Text style={[theme.text.body, styles.comment]}>{review.comment}</Text>
    ) : null}

    {review.tags.length ? (
      <View style={styles.tagRow}>
        {review.tags.map((tag) => (
          <Badge key={tag} label={tag} tone="neutral" />
        ))}
      </View>
    ) : null}

    {review.photos.length ? (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photoRow}
      >
        {review.photos.map((photo) => (
          <Image key={photo} source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
        ))}
      </ScrollView>
    ) : null}

    <View style={styles.footer}>
      <Pressable
        onPress={onHelpful}
        hitSlop={theme.layout.hitSlop}
        accessibilityRole="button"
        accessibilityLabel="Mark as helpful"
        style={styles.footerAction}
      >
        <ThumbsUp size={14} color={theme.colors.text.tertiary} strokeWidth={2.2} />
        <Text style={[theme.text.caption, styles.footerText]}>{review.likeCount}</Text>
      </Pressable>

      {review.meal ? (
        <View style={styles.footerAction}>
          <MessageCircle size={14} color={theme.colors.text.tertiary} strokeWidth={2.2} />
          <Text style={[theme.text.caption, styles.footerText]} numberOfLines={1}>
            {review.meal.name}
          </Text>
        </View>
      ) : null}
    </View>
  </View>
);

export default ReviewCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface.raised,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    ...theme.elevation.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: 3,
  },
  time: {
    color: theme.colors.text.tertiary,
  },
  comment: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: theme.spacing.md,
  },
  photoRow: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.neutral[100],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    color: theme.colors.text.tertiary,
  },
});
