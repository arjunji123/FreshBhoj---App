import React, { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  Heart,
  Share2,
  UtensilsCrossed,
} from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { formatCurrency } from '@utils/format';
import {
  AppBar,
  AppBarAction,
  Badge,
  Button,
  Card,
  Divider,
  FoodTypeDot,
  Sheet,
  Skeleton,
  StickyBar,
  VerifiedBadge,
  type SheetHandle,
} from '@components/ui';
import { RatingPill } from '@components/ui/Rating';
import MealCard from '@components/MealCard';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { FOOD_TYPE_LABELS, GOAL_TAG_LABELS } from '@utils/labels';
import { useAddToCartFlow } from '@features/cart/hooks/useAddToCartFlow';
import { useCartCount } from '@features/cart/hooks/useCart';
import {
  useMealDetail,
  useMealReviews,
  useSimilarMeals,
  useToggleFavorite,
} from '../hooks/useMeals';
import MealHero from '../components/MealHero';
import NutritionPanel from '../components/NutritionPanel';
import CustomizationSheet from '../components/CustomizationSheet';
import ReviewCard from '../components/ReviewCard';

type MealDetailRoute = RouteProp<PrivateStackParamList, 'MealDetail'>;

/**
 * Nutrition-transparency page. Ordered so the trust content (macros,
 * ingredients, allergens) comes before the social proof, with the Add to Cart
 * bar pinned so the decision is always one tap away.
 */
const MealDetailScreen = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<MealDetailRoute>();
  const sheetRef = useRef<SheetHandle>(null);

  const { data: meal, isLoading, isError, refetch } = useMealDetail(params.mealId);
  const { data: similar } = useSimilarMeals(params.mealId);
  const { data: reviews } = useMealReviews(params.mealId, 3);
  const { data: cartCount } = useCartCount();

  const toggleFavorite = useToggleFavorite();
  const { addToCart, conflictDialog, isAdding } = useAddToCartFlow();

  const hasCustomizations = Boolean(meal?.customizationGroups?.length);

  const handleAddPress = () => {
    if (!meal) return;
    // Meals with add-ons open the sheet; simple ones go straight into the cart.
    if (hasCustomizations) {
      sheetRef.current?.open();
      return;
    }
    addToCart(meal, { quantity: 1 });
  };

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <Skeleton height={300} radius={0} />
        <View style={styles.loadingBody}>
          <Skeleton width="70%" height={26} />
          <Skeleton width="45%" height={16} />
          <Skeleton height={140} radius={theme.radius.card} />
          <Skeleton height={90} radius={theme.radius.card} />
        </View>
      </View>
    );
  }

  if (isError || !meal) {
    return (
      <View style={styles.screen}>
        <AppBar title="Meal" onBack={navigation.goBack} />
        <View style={styles.errorState}>
          <Text style={theme.text.h3}>We could not load this meal</Text>
          <Text style={[theme.text.body, styles.errorBody]}>
            Check your connection and try again.
          </Text>
          <Button title="Retry" onPress={() => refetch()} fullWidth={false} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <MealHero images={meal.images} />

        <View style={styles.floatingBar} pointerEvents="box-none">
          <AppBar
            variant="transparent"
            onBack={navigation.goBack}
            centerTitle={false}
            right={
              <>
                <AppBarAction
                  floating
                  accessibilityLabel={meal.isFavorite ? 'Remove favourite' : 'Add favourite'}
                  onPress={() => toggleFavorite.mutate(meal.id)}
                >
                  <Heart
                    size={18}
                    color={meal.isFavorite ? theme.colors.primary[600] : theme.colors.text.primary}
                    fill={meal.isFavorite ? theme.colors.primary[600] : 'transparent'}
                    strokeWidth={2.2}
                  />
                </AppBarAction>
                <AppBarAction floating accessibilityLabel="Share">
                  <Share2 size={18} color={theme.colors.text.primary} strokeWidth={2.2} />
                </AppBarAction>
              </>
            }
          />
        </View>

        <View style={styles.sheet}>
          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <FoodTypeDot type={meal.foodType} size={16} />
              <Text style={[theme.text.h1, styles.title]}>{meal.name}</Text>
            </View>

            <Pressable
              style={styles.kitchenRow}
              onPress={() =>
                navigation.navigate('KitchenProfile', {
                  kitchenId: meal.kitchen.id,
                  kitchenName: meal.kitchen.name,
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`View ${meal.kitchen.name}`}
            >
              <Text style={[theme.text.bodyMedium, styles.kitchenName]}>{meal.kitchen.name}</Text>
              {meal.kitchen.isVerified ? <VerifiedBadge /> : null}
              <ChevronRight size={16} color={theme.colors.text.tertiary} strokeWidth={2.4} />
            </Pressable>

            <View style={styles.metaRow}>
              <RatingPill value={meal.rating} count={meal.ratingCount} size="md" />
              <View style={styles.metaItem}>
                <Clock size={14} color={theme.colors.text.tertiary} strokeWidth={2.2} />
                <Text style={[theme.text.caption, styles.metaText]}>
                  {meal.prepTimeMins} min prep
                </Text>
              </View>
              {meal.orderCount > 0 ? (
                <Text style={[theme.text.caption, styles.metaText]}>
                  {meal.orderCount}+ ordered
                </Text>
              ) : null}
            </View>

            {meal.description ? (
              <Text style={[theme.text.bodyLarge, styles.description]}>{meal.description}</Text>
            ) : null}

            <View style={styles.tagRow}>
              {meal.goalTags.map((tag) => (
                <Badge key={tag} label={GOAL_TAG_LABELS[tag] ?? tag} tone="accent" size="md" />
              ))}
              <Badge
                label={FOOD_TYPE_LABELS[meal.foodType]}
                tone={meal.foodType === 'NON_VEG' ? 'danger' : 'accent'}
                size="md"
              />
            </View>
          </View>

          <NutritionPanel nutrition={meal.nutrition} servingSize={meal.servingSize} />

          {meal.ingredients.length ? (
            <View style={styles.section}>
              <Text style={theme.text.h3}>Ingredients</Text>
              <Card padding="md" elevation="xs" style={styles.ingredientCard}>
                {meal.ingredients.map((ingredient, index) => (
                  <View key={ingredient}>
                    {index > 0 ? <Divider spacing={theme.spacing.sm} /> : null}
                    <View style={styles.ingredientRow}>
                      <View style={styles.ingredientDot} />
                      <Text style={theme.text.body}>{ingredient}</Text>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          ) : null}

          {meal.allergens.length ? (
            <View style={styles.section}>
              <View style={styles.allergenCard}>
                <AlertTriangle size={18} color={theme.colors.amber[600]} strokeWidth={2.2} />
                <View style={styles.allergenText}>
                  <Text style={[theme.text.h4, styles.allergenTitle]}>Allergen information</Text>
                  <Text style={[theme.text.bodySmall, styles.allergenBody]}>
                    Contains {meal.allergens.join(', ')}. Prepared in a kitchen that also handles
                    other allergens.
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {meal.servingSize ? (
            <View style={styles.section}>
              <Text style={theme.text.h3}>Portion</Text>
              <Card padding="md" elevation="xs" style={styles.portionCard}>
                <UtensilsCrossed size={18} color={theme.colors.primary[600]} strokeWidth={2.2} />
                <Text style={theme.text.body}>{meal.servingSize}</Text>
              </Card>
            </View>
          ) : null}

          {reviews?.items.length ? (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={theme.text.h3}>Reviews</Text>
                <Pressable
                  onPress={() =>
                    navigation.navigate('KitchenReviews', {
                      kitchenId: meal.kitchen.id,
                      kitchenName: meal.kitchen.name,
                    })
                  }
                  hitSlop={theme.layout.hitSlop}
                >
                  <Text style={[theme.text.label, styles.seeAll]}>See all</Text>
                </Pressable>
              </View>

              <View style={styles.reviewList}>
                {reviews.items.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </View>
            </View>
          ) : null}

          {similar?.length ? (
            <View style={styles.section}>
              <Text style={theme.text.h3}>You may also like</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarRow}
              >
                {similar.map((item) => (
                  <MealCard
                    key={item.id}
                    meal={item}
                    layout="compact"
                    onPress={() =>
                      navigation.push('MealDetail', { mealId: item.id, mealName: item.name })
                    }
                    onAdd={() => addToCart(item)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <StickyBar>
        <View style={styles.stickyRow}>
          <View>
            <Text style={[theme.text.caption, styles.stickyLabel]}>
              {meal.mrp && meal.mrp > meal.price ? `${meal.discountPercent}% OFF` : 'PRICE'}
            </Text>
            <View style={styles.stickyPriceRow}>
              <Text style={theme.text.h2}>{formatCurrency(meal.price)}</Text>
              {meal.mrp && meal.mrp > meal.price ? (
                <Text style={[theme.text.bodySmall, styles.stickyMrp]}>
                  {formatCurrency(meal.mrp)}
                </Text>
              ) : null}
            </View>
          </View>

          <Button
            title={meal.isOrderable ? 'Add to Cart' : 'Unavailable'}
            onPress={handleAddPress}
            disabled={!meal.isOrderable}
            loading={isAdding && !hasCustomizations}
            fullWidth={false}
            style={styles.addButton}
          />
        </View>

        {cartCount && cartCount.itemCount > 0 ? (
          <Pressable style={styles.viewCart} onPress={() => navigation.navigate('Cart')}>
            <Text style={[theme.text.label, styles.viewCartText]}>
              View cart ({cartCount.itemCount} {cartCount.itemCount === 1 ? 'item' : 'items'})
            </Text>
          </Pressable>
        ) : null}
      </StickyBar>

      <Sheet ref={sheetRef} eyebrow="ADD TO PLATE" title={meal.name} heightRatio={0.82}>
        <CustomizationSheet
          meal={meal}
          isSubmitting={isAdding}
          onConfirm={(input) => {
            addToCart(meal, input, { onSuccess: () => sheetRef.current?.close() });
          }}
        />
      </Sheet>

      {conflictDialog}
    </View>
  );
};

export default MealDetailScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  scroll: {
    paddingBottom: theme.spacing.xxl,
  },
  loadingBody: {
    padding: theme.layout.screenPadding,
    gap: theme.spacing.md,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  errorBody: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  floatingBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    marginTop: -theme.spacing.xl,
    borderTopLeftRadius: theme.radius.sheet,
    borderTopRightRadius: theme.radius.sheet,
    backgroundColor: theme.colors.surface.page,
    paddingTop: theme.spacing.xl,
  },
  titleBlock: {
    paddingHorizontal: theme.layout.screenPadding,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    flex: 1,
  },
  kitchenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  kitchenName: {
    color: theme.colors.text.brand,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: theme.colors.text.tertiary,
  },
  description: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  section: {
    paddingHorizontal: theme.layout.screenPadding,
    marginTop: theme.spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAll: {
    color: theme.colors.primary[600],
  },
  ingredientCard: {
    marginTop: theme.spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: 4,
  },
  ingredientDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.accent[500],
  },
  allergenCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.amber[50],
    borderWidth: 1,
    borderColor: theme.colors.amber[100],
  },
  allergenText: {
    flex: 1,
  },
  allergenTitle: {
    color: theme.colors.amber[700],
  },
  allergenBody: {
    color: theme.colors.amber[700],
    marginTop: 3,
  },
  portionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  reviewList: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  similarRow: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },
  stickyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  stickyLabel: {
    color: theme.colors.text.tertiary,
  },
  stickyPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  stickyMrp: {
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flex: 1,
    maxWidth: 200,
  },
  viewCart: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  viewCartText: {
    color: theme.colors.primary[600],
  },
});
