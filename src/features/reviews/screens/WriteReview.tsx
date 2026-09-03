import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Leaf, PackageCheck, Sparkles } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { ApiError } from '@api';
import { AppBar, Button, Card, StickyBar } from '@components/ui';
import { StarRow } from '@components/ui/Rating';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { useCreateReview } from '../hooks/useReviews';

type Route = RouteProp<PrivateStackParamList, 'WriteReview'>;

const QUICK_TAGS = [
  { label: 'Clean', Icon: Sparkles },
  { label: 'Well-packed', Icon: PackageCheck },
  { label: 'Eco-friendly', Icon: Leaf },
];

const RATING_COPY: Record<number, string> = {
  1: 'What went wrong?',
  2: 'Below expectations',
  3: 'It was okay',
  4: 'Pretty good!',
  5: 'Loved it!',
};

/** Post-delivery feedback: taste rating, hygiene chips, and an optional note. */
const WriteReview = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();

  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const createReview = useCreateReview();

  const toggleTag = (tag: string) =>
    setTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Add a rating', 'Tap a star to rate your meal.');
      return;
    }

    createReview.mutate(
      {
        kitchenId: params.kitchenId,
        input: {
          rating,
          orderId: params.orderId,
          mealId: params.mealId,
          comment: comment.trim() || undefined,
          tags,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Thanks for your feedback!', 'It helps other people order with confidence.');
          navigation.goBack();
        },
        onError: (error) =>
          Alert.alert(
            'Could not submit',
            error instanceof ApiError ? error.message : 'Please try again.',
          ),
      },
    );
  };

  return (
    <View style={styles.screen}>
      <AppBar title="Rate your order" onBack={navigation.goBack} />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <Card padding="md" elevation="xs" style={styles.mealCard}>
          {params.mealImage ? (
            <Image source={{ uri: params.mealImage }} style={styles.mealImage} />
          ) : (
            <View style={[styles.mealImage, styles.mealImageFallback]} />
          )}
          <View style={styles.mealText}>
            <Text style={[theme.text.overline, styles.eyebrow]}>RECENTLY DELIVERED</Text>
            <Text style={theme.text.h3} numberOfLines={2}>
              {params.mealName ?? 'Your order'}
            </Text>
            <Text style={[theme.text.caption, styles.kitchenName]} numberOfLines={1}>
              {params.kitchenName}
            </Text>
          </View>
        </Card>

        <Text style={[theme.text.h3, styles.sectionTitle]}>Taste & portion size</Text>
        <View style={styles.ratingBlock}>
          <StarRow value={rating} size={38} onChange={setRating} />
          <Text style={[theme.text.body, styles.ratingCopy]}>
            {rating ? RATING_COPY[rating] : 'Tap to rate your meal experience'}
          </Text>
        </View>

        <Text style={[theme.text.h3, styles.sectionTitle]}>Hygiene & packaging</Text>
        <View style={styles.tagRow}>
          {QUICK_TAGS.map(({ label, Icon }) => {
            const isSelected = tags.includes(label);
            return (
              <Pressable
                key={label}
                onPress={() => toggleTag(label)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                style={[styles.tagCard, isSelected ? styles.tagCardSelected : null]}
              >
                <Icon
                  size={20}
                  color={isSelected ? theme.colors.primary[600] : theme.colors.text.secondary}
                  strokeWidth={2.2}
                />
                <Text
                  style={[
                    theme.text.caption,
                    { color: isSelected ? theme.colors.primary[600] : theme.colors.text.secondary },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[theme.text.h3, styles.sectionTitle]}>Share your experience</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="The flavours were amazing, but the portion could be slightly larger. Packaging was perfect!"
          placeholderTextColor={theme.colors.text.tertiary}
          multiline
          maxLength={1000}
          style={[theme.text.body, styles.commentInput]}
        />
      </KeyboardAwareScrollView>

      <StickyBar>
        <Button
          title="Submit Feedback"
          onPress={handleSubmit}
          loading={createReview.isPending}
          disabled={rating === 0}
        />
        <Text style={[theme.text.overline, styles.footerNote]}>POWERED BY FRESHBHOJ</Text>
      </StickyBar>
    </View>
  );
};

export default WriteReview;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  scroll: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxl,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.primary[50],
  },
  mealImage: {
    width: 54,
    height: 54,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.neutral[100],
  },
  mealImageFallback: {
    backgroundColor: theme.colors.primary[100],
  },
  mealText: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.primary[600],
    marginBottom: 2,
  },
  kitchenName: {
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  sectionTitle: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  ratingBlock: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  ratingCopy: {
    color: theme.colors.text.secondary,
  },
  tagRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  tagCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.card,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.surface.raised,
  },
  tagCardSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.surface.brandWash,
  },
  commentInput: {
    minHeight: 110,
    borderRadius: theme.radius.control,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.neutral[50],
    padding: theme.spacing.md,
    textAlignVertical: 'top',
    color: theme.colors.text.primary,
  },
  footerNote: {
    textAlign: 'center',
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
  },
});
