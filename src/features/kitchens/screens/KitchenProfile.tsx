import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Clock, Heart, MapPin, Share2, ShieldCheck } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCompact } from '@utils/format';
import {
  AppBar,
  AppBarAction,
  Badge,
  Button,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  FoodTypeDot,
  Skeleton,
  VerifiedBadge,
} from '@components/ui';
import { RatingPill } from '@components/ui/Rating';
import MealCard from '@components/MealCard';
import ReviewCard from '@features/meals/components/ReviewCard';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import { useCartQuantityControls } from '@features/cart/hooks/useCart';
import { useToggleFavorite } from '@features/meals/hooks/useMeals';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { MINI_CART_BAR_CLEARANCE } from '@components/MiniCartBar';
import KitchenFoodFeedSection from '../components/KitchenFoodFeedSection';
import RatingSummary from '../components/RatingSummary';
import {
  useKitchen,
  useKitchenMedia,
  useKitchenMenu,
  useKitchenReviewSummary,
  useKitchenReviews,
  useToggleFollowKitchen,
} from '../hooks/useKitchens';

type Route = RouteProp<PrivateStackParamList, 'KitchenProfile'>;
type Tab = 'menu' | 'foodfeed' | 'reviews';
type VegFilter = 'ALL' | 'VEG' | 'NON_VEG';

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'menu', label: 'Menu' },
  { key: 'foodfeed', label: 'Food Feed' },
  { key: 'reviews', label: 'Reviews' },
];

const VEG_FILTERS: Array<{ key: VegFilter; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'VEG', label: 'Veg' },
  { key: 'NON_VEG', label: 'Non-Veg' },
];

/**
 * Kitchen profile — Phase 1.
 *
 * The Verified badge is given real estate right beside the name because the
 * whole curated-kitchen promise rests on it. Gallery is a plain grid, not a
 * feed: no follow-first social layer until content volume justifies it.
 */
const KitchenProfile = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();
  const [tab, setTab] = useState<Tab>('menu');
  const [vegFilter, setVegFilter] = useState<VegFilter>('ALL');
  const [descExpanded, setDescExpanded] = useState(false);

  const { data: kitchen, isLoading } = useKitchen(params.kitchenId);
  const { data: media } = useKitchenMedia(params.kitchenId);
  const { data: menu } = useKitchenMenu(params.kitchenId);
  const { data: reviews } = useKitchenReviews(params.kitchenId, 4);
  const { data: reviewSummary } = useKitchenReviewSummary(params.kitchenId);

  const toggleFollow = useToggleFollowKitchen(params.kitchenId);
  const { addToCart, conflictDialog } = useAddToCartFlow();
  const { getQuantity, changeQuantity } = useCartQuantityControls();
  const toggleFavorite = useToggleFavorite();

  const menuSections = useMemo(() => {
    const items = menu?.items ?? [];
    const filtered = items.filter((meal) => {
      if (vegFilter === 'ALL') return true;
      if (vegFilter === 'VEG') return meal.foodType === 'VEG' || meal.foodType === 'VEGAN';
      return meal.foodType === 'NON_VEG' || meal.foodType === 'EGG';
    });

    const order: string[] = [];
    const groups = new Map<string, typeof filtered>();
    filtered.forEach((meal) => {
      const key = meal.category?.name ?? 'Other';
      if (!groups.has(key)) {
        groups.set(key, []);
        order.push(key);
      }
      groups.get(key)!.push(meal);
    });

    return order.map((key) => ({ title: key, items: groups.get(key)! }));
  }, [menu, vegFilter]);

  if (isLoading || !kitchen) {
    return (
      <View style={styles.screen}>
        <Skeleton height={220} radius={0} />
        <View style={styles.loading}>
          <Skeleton width="60%" height={24} />
          <Skeleton width="40%" height={14} />
          <Skeleton height={120} radius={theme.radius.card} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── Cover ─────────────────────────────────────────────────── */}
        <View style={styles.cover}>
          {kitchen.coverImage ? (
            <Image
              source={{ uri: kitchen.coverImage }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
          ) : null}
          <LinearGradient
            colors={theme.colors.overlay.imageFade}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.coverBar} pointerEvents="box-none">
            <AppBar
              variant="transparent"
              onBack={navigation.goBack}
              centerTitle={false}
              right={
                <>
                  <AppBarAction
                    floating
                    accessibilityLabel={kitchen.isFollowing ? 'Unfollow' : 'Follow'}
                    onPress={() => toggleFollow.mutate()}
                  >
                    <Heart
                      size={18}
                      color={
                        kitchen.isFollowing ? theme.colors.primary[600] : theme.colors.text.primary
                      }
                      fill={kitchen.isFollowing ? theme.colors.primary[600] : 'transparent'}
                      strokeWidth={2.2}
                    />
                  </AppBarAction>
                  <AppBarAction floating accessibilityLabel="Share kitchen">
                    <Share2 size={18} color={theme.colors.text.primary} strokeWidth={2.2} />
                  </AppBarAction>
                </>
              }
            />
          </View>
        </View>

        {/* ── Identity ──────────────────────────────────────────────── */}
        <View style={styles.identity}>
          <View style={styles.logoWrap}>
            {kitchen.logoUrl ? (
              <Image source={{ uri: kitchen.logoUrl }} style={styles.logo} resizeMode="cover" />
            ) : (
              <View style={[styles.logo, styles.logoFallback]} />
            )}
            {kitchen.isVerified ? (
              <View style={styles.logoVerified}>
                <ShieldCheck size={13} color={theme.colors.text.inverse} strokeWidth={2.6} />
              </View>
            ) : null}
          </View>

          <View style={styles.identityText}>
            <View style={styles.nameRow}>
              <Text style={[theme.text.h1, styles.name]} numberOfLines={2}>
                {kitchen.name}
              </Text>
            </View>
            {kitchen.tagline ? (
              <Text style={[theme.text.body, styles.tagline]} numberOfLines={2}>
                {kitchen.tagline}
              </Text>
            ) : null}

            <View style={styles.metaRow}>
              <RatingPill value={kitchen.rating} count={kitchen.ratingCount} size="md" />
              <View style={styles.metaItem}>
                <Clock size={13} color={theme.colors.text.tertiary} strokeWidth={2.2} />
                <Text style={[theme.text.caption, styles.metaText]}>
                  {kitchen.prepTimeMins} min
                </Text>
              </View>
              {kitchen.locality ? (
                <View style={styles.metaItem}>
                  <MapPin size={13} color={theme.colors.text.tertiary} strokeWidth={2.2} />
                  <Text style={[theme.text.caption, styles.metaText]}>{kitchen.locality}</Text>
                </View>
              ) : null}
              <Badge
                label={kitchen.isOpenNow ? 'Open now' : 'Closed'}
                tone={kitchen.isOpenNow ? 'accent' : 'neutral'}
              />
            </View>
          </View>
        </View>

        {/* ── Trust strip ───────────────────────────────────────────── */}
        {kitchen.isVerified ? (
          <Card padding="md" elevation="xs" style={styles.trustCard}>
            <View style={styles.trustRow}>
              <VerifiedBadge />
              <Text style={[theme.text.bodySmall, styles.trustText]}>
                Inspected in person, FSSAI licence checked
                {kitchen.hygieneScore ? `, hygiene score ${kitchen.hygieneScore}/5` : ''}.
              </Text>
            </View>
          </Card>
        ) : null}

        {kitchen.description ? (
          <Pressable onPress={() => setDescExpanded((current) => !current)}>
            <Text
              style={[theme.text.body, styles.description]}
              numberOfLines={descExpanded ? undefined : 1}
            >
              {kitchen.description}
            </Text>
            <Text style={[theme.text.label, styles.descriptionToggle]}>
              {descExpanded ? 'Show less' : 'Read more'}
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.statsRow}>
          <Stat label="Dishes" value={String(kitchen.counts.meals)} />
          <Stat label="Followers" value={formatCompact(kitchen.followerCount)} />
          <Stat label="Reviews" value={formatCompact(kitchen.counts.reviews)} />
        </View>

        <View style={styles.followRow}>
          <Button
            title={kitchen.isFollowing ? 'Following' : 'Follow Kitchen'}
            variant={kitchen.isFollowing ? 'outline' : 'primary'}
            onPress={() => toggleFollow.mutate()}
            size="md"
          />
        </View>

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <ChipRow style={styles.tabs}>
          {TABS.map((item) => (
            <Chip
              key={item.key}
              label={item.label}
              selected={tab === item.key}
              onPress={() => setTab(item.key)}
            />
          ))}
        </ChipRow>

        {tab === 'menu' ? (
          menu?.items.length ? (
            <>
              <View style={styles.vegFilterRow}>
                {VEG_FILTERS.map((option) => {
                  const isActive = vegFilter === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => setVegFilter(option.key)}
                      style={[styles.vegFilterPill, isActive ? styles.vegFilterPillActive : null]}
                    >
                      {option.key !== 'ALL' ? (
                        <FoodTypeDot type={option.key === 'VEG' ? 'VEG' : 'NON_VEG'} size={9} />
                      ) : null}
                      <Text
                        style={[
                          theme.text.label,
                          { color: isActive ? theme.colors.primary[700] : theme.colors.text.secondary },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {menuSections.map((section) => (
                <View key={section.title} style={styles.menuSection}>
                  <Text style={[theme.text.h4, styles.menuSectionTitle]}>{section.title}</Text>
                  <View style={styles.menuList}>
                    {section.items.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        onPress={() =>
                          navigation.navigate('MealDetail', { mealId: meal.id, mealName: meal.name })
                        }
                        onAdd={() => addToCart(meal)}
                        quantity={getQuantity(meal.id)}
                        onChangeQuantity={(next) => changeQuantity(meal.id, next)}
                        onToggleFavorite={() => toggleFavorite.mutate(meal.id)}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </>
          ) : (
            <EmptyState title="No dishes listed yet" description="Check back soon." />
          )
        ) : null}

        {tab === 'foodfeed' ? (
          media?.length ? (
            <KitchenFoodFeedSection
              media={media}
              onPressItem={(index) =>
                navigation.navigate('KitchenGallery', {
                  kitchenId: kitchen.id,
                  initialIndex: index,
                })
              }
            />
          ) : (
            <EmptyState
              title="No posts yet"
              description="This kitchen has not shared any behind-the-scenes shots or reels."
            />
          )
        ) : null}

        {tab === 'reviews' ? (
          <View style={styles.reviewsSection}>
            {reviewSummary && reviewSummary.total > 0 ? (
              <RatingSummary summary={reviewSummary} />
            ) : null}

            {reviews?.items.length ? (
              <>
                <View style={styles.reviewList}>
                  {reviews.items.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </View>
                <Pressable
                  onPress={() =>
                    navigation.navigate('KitchenReviews', {
                      kitchenId: kitchen.id,
                      kitchenName: kitchen.name,
                    })
                  }
                  style={styles.seeAllReviews}
                >
                  <Text style={[theme.text.label, styles.seeAllText]}>See all reviews</Text>
                </Pressable>
              </>
            ) : (
              <EmptyState
                title="No reviews yet"
                description="Be the first to tell others what you thought."
                actionLabel="Write a review"
                onAction={() =>
                  navigation.navigate('WriteReview', {
                    kitchenId: kitchen.id,
                    kitchenName: kitchen.name,
                  })
                }
              />
            )}
          </View>
        ) : null}
      </ScrollView>

      {conflictDialog}
    </View>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={theme.text.h3}>{value}</Text>
    <Text style={[theme.text.caption, styles.statLabel]}>{label}</Text>
  </View>
);

export default KitchenProfile;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  loading: {
    padding: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  scroll: {
    paddingBottom: theme.spacing.xxxl + MINI_CART_BAR_CLEARANCE,
  },
  cover: {
    height: 200,
    backgroundColor: theme.colors.neutral[200],
  },
  coverBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  identity: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.layout.screenPadding,
    marginTop: -34,
  },
  logoWrap: {
    width: 76,
    height: 76,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: theme.radius.card,
    borderWidth: 3,
    borderColor: theme.colors.surface.base,
    backgroundColor: theme.colors.neutral[100],
  },
  logoFallback: {
    backgroundColor: theme.colors.primary[100],
  },
  logoVerified: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.accent[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface.base,
  },
  identityText: {
    flex: 1,
    paddingTop: theme.spacing.xxl,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  name: {
    flexShrink: 1,
  },
  tagline: {
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: theme.colors.text.tertiary,
  },
  trustCard: {
    marginHorizontal: theme.layout.screenPadding,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.accent[50],
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  trustText: {
    flex: 1,
    color: theme.colors.accent[700],
  },
  description: {
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.layout.screenPadding,
    marginTop: theme.spacing.lg,
  },
  descriptionToggle: {
    color: theme.colors.primary[600],
    paddingHorizontal: theme.layout.screenPadding,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
    marginHorizontal: theme.layout.screenPadding,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface.raised,
    ...theme.elevation.xs,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  followRow: {
    paddingHorizontal: theme.layout.screenPadding,
    marginTop: theme.spacing.md,
  },
  tabs: {
    paddingVertical: theme.spacing.lg,
  },
  vegFilterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.layout.screenPadding,
    marginBottom: theme.spacing.lg,
  },
  vegFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface.raised,
    borderWidth: 1,
    borderColor: theme.colors.borders.subtle,
  },
  vegFilterPillActive: {
    backgroundColor: theme.colors.surface.brandWash,
    borderColor: theme.colors.borders.brand,
  },
  menuSection: {
    marginBottom: theme.spacing.xl,
  },
  menuSectionTitle: {
    paddingHorizontal: theme.layout.screenPadding,
    marginBottom: theme.spacing.md,
  },
  menuList: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  reviewsSection: {
    gap: theme.spacing.md,
  },
  reviewList: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  seeAllReviews: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  seeAllText: {
    color: theme.colors.primary[600],
  },
});
