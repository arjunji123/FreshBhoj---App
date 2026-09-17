import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Badge, Button, Card, Chip, ChipRow, Input, Screen } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import {
  useAnalyzeMeal,
  useCreateMeal,
  useKitchenMenu,
  useKitchenUpload,
  useUpdateMeal,
} from '../hooks/useKitchenPortal';
import type { NutritionAnalysisResult } from '../kitchenPartner.types';

const FOOD_TYPES = ['VEG', 'EGG', 'NON_VEG', 'VEGAN'];

const KitchenMealForm = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const mealId: string | undefined = route.params?.mealId;
  const menu = useKitchenMenu();
  const existing = mealId ? menu.data?.find((m) => m.id === mealId) : undefined;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [foodType, setFoodType] = useState('VEG');
  const [images, setImages] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [nutrition, setNutrition] = useState<NutritionAnalysisResult | null>(null);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setDescription(existing.description ?? '');
      setPrice(String(existing.price));
      setFoodType(existing.foodType);
      setImages(existing.images ?? []);
      setIsAvailable(existing.isAvailable);
      setNutrition({
        calories: existing.nutrition.calories,
        proteinG: existing.nutrition.proteinG,
        carbsG: existing.nutrition.carbsG,
        fatG: existing.nutrition.fatG,
        fiberG: existing.nutrition.fiberG,
        healthScore: 0,
        isJunkFood: false,
        reason: 'Previously saved nutrition — run AI again to refresh it.',
        suggestedGoalTags: [],
      });
    }
  }, [existing]);

  const analyze = useAnalyzeMeal();
  const upload = useKitchenUpload();
  const create = useCreateMeal();
  const update = useUpdateMeal();
  const isSaving = create.isPending || update.isPending;
  const isSaveBlocked = isSaving || upload.isPending;

  const handlePickPhoto = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 });
    if (result.didCancel || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];
    upload.mutate(
      { asset: { uri: asset.uri!, type: asset.type, fileName: asset.fileName }, purpose: 'MENU_IMAGE', fallbackType: 'image/jpeg' },
      {
        onSuccess: (res) => setImages((prev) => [...prev, res.url]),
        onError: (error) =>
          Alert.alert('Could not upload photo', error instanceof KitchenApiError ? error.message : 'Please try again.'),
      },
    );
  };

  const handleAnalyze = () => {
    if (!name.trim()) {
      Alert.alert('Add a dish name first', 'AI needs at least the name to estimate nutrition.');
      return;
    }
    analyze.mutate(
      { name, description },
      {
        onSuccess: (result) => setNutrition(result),
        onError: (error) =>
          Alert.alert('AI analysis unavailable', error instanceof KitchenApiError ? error.message : 'Please try again later.'),
      },
    );
  };

  const handleSave = () => {
    if (!name.trim() || !price.trim() || !nutrition) {
      Alert.alert('Almost there', 'Add a name, price, and run AI analysis before publishing.');
      return;
    }
    const input = {
      name,
      description,
      images,
      price: Number(price),
      foodType,
      calories: nutrition.calories,
      proteinG: nutrition.proteinG,
      carbsG: nutrition.carbsG,
      fatG: nutrition.fatG,
      fiberG: nutrition.fiberG,
      isAvailable,
    };
    const onSuccess = () => navigation.goBack();
    const onError = (error: unknown) =>
      Alert.alert('Could not save dish', error instanceof KitchenApiError ? error.message : 'Please try again.');

    if (mealId) {
      update.mutate({ id: mealId, input }, { onSuccess, onError });
    } else {
      create.mutate(input, { onSuccess, onError });
    }
  };

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Button
          title="Back"
          variant="ghost"
          size="sm"
          fullWidth={false}
          leftIcon={<ArrowLeft size={15} color={theme.colors.text.secondary} />}
          onPress={() => navigation.goBack()}
        />
        <Text style={theme.text.h2}>{mealId ? 'Edit dish' : 'Add a dish'}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: theme.spacing.paddings.xxl + Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.photoCard} onPress={handlePickPhoto}>
          {upload.isPending ? (
            <Text style={styles.photoHint}>Uploading…</Text>
          ) : images.length > 0 ? (
            <Text style={styles.photoHint}>{images.length > 1 ? `${images.length} photos added — tap to add another` : 'Photo added — tap to add another'}</Text>
          ) : (
            <Text style={styles.photoHint}>Tap to add a photo</Text>
          )}
        </Card>

        <Input label="Dish name" value={name} onChangeText={setName} placeholder="e.g. Paneer Tikka Salad" containerStyle={styles.field} />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="What goes into this dish?"
          multiline
          numberOfLines={3}
          containerStyle={styles.field}
        />
        <Input
          label="Price (₹)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="199"
          containerStyle={styles.field}
        />

        <Text style={styles.label}>Food type</Text>
        <ChipRow style={styles.field}>
          {FOOD_TYPES.map((ft) => (
            <Chip key={ft} label={ft.replace('_', ' ')} selected={foodType === ft} onPress={() => setFoodType(ft)} />
          ))}
        </ChipRow>

        <Button
          title={analyze.isPending ? 'Analyzing…' : 'Analyze with AI'}
          variant="secondary"
          leftIcon={<Sparkles size={16} color={theme.colors.palette.white} />}
          onPress={handleAnalyze}
          loading={analyze.isPending}
          style={styles.field}
        />

        {nutrition ? (
          <Card style={styles.field}>
            <View style={styles.nutritionHeader}>
              <Badge label="AI-estimated — review before publishing" tone="info" size="sm" />
              {nutrition.isJunkFood ? <Badge label="Junk food" tone="danger" size="sm" /> : <Badge label={`Health ${nutrition.healthScore}/100`} tone="accent" size="sm" />}
            </View>
            <Text style={styles.nutritionReason}>{nutrition.reason}</Text>
            <View style={styles.nutritionGrid}>
              <NutritionStat label="Calories" value={nutrition.calories} />
              <NutritionStat label="Protein" value={`${nutrition.proteinG}g`} />
              <NutritionStat label="Carbs" value={`${nutrition.carbsG}g`} />
              <NutritionStat label="Fat" value={`${nutrition.fatG}g`} />
            </View>
          </Card>
        ) : null}

        <Button
          title={isSaving ? 'Saving…' : upload.isPending ? 'Waiting for photo…' : mealId ? 'Save changes' : 'Publish dish'}
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaveBlocked}
          style={styles.field}
        />
      </ScrollView>
    </Screen>
  );
};

function NutritionStat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.nutritionStat}>
      <Text style={styles.nutritionValue}>{value}</Text>
      <Text style={styles.nutritionLabel}>{label}</Text>
    </View>
  );
}

export default KitchenMealForm;

const styles = StyleSheet.create({
  header: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, gap: theme.spacing.paddings.xs },
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl, paddingTop: theme.spacing.paddings.sm },
  photoCard: { alignItems: 'center', justifyContent: 'center', height: 120, marginBottom: theme.spacing.paddings.md, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.borders.default },
  photoHint: { ...theme.text.bodySmall, color: theme.colors.text.secondary },
  field: { marginBottom: theme.spacing.paddings.md },
  label: { ...theme.text.label, color: theme.colors.text.primary, marginBottom: theme.spacing.paddings.xs },
  nutritionHeader: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: theme.spacing.paddings.sm },
  nutritionReason: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginBottom: theme.spacing.paddings.sm },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.paddings.md },
  nutritionStat: { width: '22%' },
  nutritionValue: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  nutritionLabel: { ...theme.text.caption, color: theme.colors.text.tertiary },
});
