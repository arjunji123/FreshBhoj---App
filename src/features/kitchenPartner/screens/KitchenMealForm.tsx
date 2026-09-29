import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Plus, Sparkles, Trash2, X } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { AppBar, Badge, Button, Card, Chip, ChipRow, Input, Screen } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import {
  useAnalyzeMeal,
  useCreateMeal,
  useKitchenMenu,
  useKitchenUpload,
  useUpdateMeal,
} from '../hooks/useKitchenPortal';
import type { MealCustomizationGroup, NutritionAnalysisResult } from '../kitchenPartner.types';

const FOOD_TYPES = ['VEG', 'EGG', 'NON_VEG', 'VEGAN'];
const JAIN_ELIGIBLE_FOOD_TYPES = ['VEG', 'VEGAN'];

function emptyGroup(): MealCustomizationGroup {
  return { name: '', isRequired: false, minSelect: 0, maxSelect: 1, options: [] };
}

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
  const [prepTimeMins, setPrepTimeMins] = useState('25');
  const [cuisineSlug, setCuisineSlug] = useState('');
  const [isJainAvailable, setIsJainAvailable] = useState(false);
  const [customizationGroups, setCustomizationGroups] = useState<MealCustomizationGroup[]>([]);

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
      setPrepTimeMins(existing.prepTimeMins != null ? String(existing.prepTimeMins) : '25');
      setCuisineSlug(existing.cuisineSlug ?? '');
      setIsJainAvailable(existing.isJainAvailable ?? false);
      setCustomizationGroups(existing.customizationGroups ?? []);
    }
  }, [existing]);

  // Jain is only meaningful for veg/vegan dishes — clear it the moment the
  // partner switches to a food type it doesn't apply to, so a stale "on"
  // state can't silently ride along to submit.
  useEffect(() => {
    if (!JAIN_ELIGIBLE_FOOD_TYPES.includes(foodType)) setIsJainAvailable(false);
  }, [foodType]);

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
    const cleanGroups = customizationGroups
      .filter((group) => group.name.trim())
      .map((group) => ({ ...group, options: group.options.filter((option) => option.name.trim()) }));

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
      isJainAvailable: JAIN_ELIGIBLE_FOOD_TYPES.includes(foodType) ? isJainAvailable : false,
      prepTimeMins: prepTimeMins.trim() ? Number(prepTimeMins) : undefined,
      cuisineSlug: cuisineSlug.trim() || undefined,
      customizationGroups: cleanGroups.length ? cleanGroups : undefined,
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
      <AppBar title={mealId ? 'Edit dish' : 'Add a dish'} onBack={() => navigation.goBack()} />

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
        <TouchableOpacity onPress={() => navigation.navigate('UploadGuide')} style={styles.uploadTipsLink}>
          <Text style={styles.uploadTipsText}>See upload tips</Text>
        </TouchableOpacity>

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
        <View style={styles.rowFields}>
          <Input
            label="Price (₹)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="199"
            containerStyle={[styles.field, styles.halfField]}
          />
          <Input
            label="Prep time (mins)"
            value={prepTimeMins}
            onChangeText={setPrepTimeMins}
            keyboardType="numeric"
            placeholder="25"
            containerStyle={[styles.field, styles.halfField]}
          />
        </View>
        <Input
          label="Cuisine (slug)"
          value={cuisineSlug}
          onChangeText={setCuisineSlug}
          placeholder="e.g. north-indian"
          autoCapitalize="none"
          containerStyle={styles.field}
        />

        <Text style={styles.label}>Food type</Text>
        <ChipRow style={styles.foodTypeRow}>
          {FOOD_TYPES.map((ft) => (
            <Chip key={ft} label={ft.replace('_', ' ')} selected={foodType === ft} onPress={() => setFoodType(ft)} />
          ))}
        </ChipRow>

        <View style={[styles.jainRow, styles.field]}>
          <View style={styles.jainTextWrap}>
            <Text style={styles.jainLabel}>Jain option available</Text>
            <Text style={styles.jainHint}>
              {JAIN_ELIGIBLE_FOOD_TYPES.includes(foodType) ? 'No onion, no garlic, no root vegetables' : 'Only available for veg or vegan dishes'}
            </Text>
          </View>
          <Switch
            value={isJainAvailable}
            onValueChange={setIsJainAvailable}
            disabled={!JAIN_ELIGIBLE_FOOD_TYPES.includes(foodType)}
            trackColor={{ true: theme.colors.brand.primary }}
          />
        </View>

        <Text style={styles.label}>Customizations (optional)</Text>
        {customizationGroups.map((group, groupIndex) => (
          <CustomizationGroupEditor
            key={groupIndex}
            group={group}
            onChange={(next) =>
              setCustomizationGroups((prev) => prev.map((g, i) => (i === groupIndex ? next : g)))
            }
            onRemove={() => setCustomizationGroups((prev) => prev.filter((_, i) => i !== groupIndex))}
          />
        ))}
        <TouchableOpacity
          onPress={() => setCustomizationGroups((prev) => [...prev, emptyGroup()])}
          style={styles.addGroupButton}
        >
          <Plus size={14} color={theme.colors.brand.primary} />
          <Text style={styles.addGroupText}>Add customization group</Text>
        </TouchableOpacity>

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

/**
 * One customization group (e.g. "Spice level") with its nested list of
 * priced options. Kept fully controlled — the parent owns the array and this
 * just hands back a replacement group object on every edit — so there's a
 * single source of truth for the `customizationGroups` payload at submit.
 */
function CustomizationGroupEditor({
  group,
  onChange,
  onRemove,
}: {
  group: MealCustomizationGroup;
  onChange: (next: MealCustomizationGroup) => void;
  onRemove: () => void;
}) {
  const updateOption = (index: number, patch: Partial<{ name: string; priceDelta: number }>) => {
    onChange({ ...group, options: group.options.map((option, i) => (i === index ? { ...option, ...patch } : option)) });
  };
  const removeOption = (index: number) => {
    onChange({ ...group, options: group.options.filter((_, i) => i !== index) });
  };

  return (
    <Card style={styles.groupCard} padding="sm">
      <View style={styles.groupTopRow}>
        <Input
          value={group.name}
          onChangeText={(value) => onChange({ ...group, name: value })}
          placeholder="Group name, e.g. Spice level"
          size="md"
          containerStyle={styles.groupNameInput}
        />
        <TouchableOpacity onPress={onRemove} style={styles.groupRemoveButton} hitSlop={theme.layout.hitSlop}>
          <Trash2 size={15} color={theme.colors.text.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.groupMetaRow}>
        <View style={styles.requiredToggle}>
          <Text style={styles.smallLabel}>Required</Text>
          <Switch
            value={group.isRequired}
            onValueChange={(value) => onChange({ ...group, isRequired: value })}
            trackColor={{ true: theme.colors.brand.primary }}
          />
        </View>
        <View style={styles.minMaxRow}>
          <Text style={styles.smallLabel}>Min</Text>
          <Input
            value={String(group.minSelect)}
            onChangeText={(value) => onChange({ ...group, minSelect: parseInt(value, 10) || 0 })}
            keyboardType="number-pad"
            size="md"
            containerStyle={styles.miniInput}
            inputStyle={styles.miniInputText}
          />
          <Text style={styles.smallLabel}>Max</Text>
          <Input
            value={String(group.maxSelect)}
            onChangeText={(value) => onChange({ ...group, maxSelect: parseInt(value, 10) || 0 })}
            keyboardType="number-pad"
            size="md"
            containerStyle={styles.miniInput}
            inputStyle={styles.miniInputText}
          />
        </View>
      </View>

      {group.options.map((option, optionIndex) => (
        <View key={optionIndex} style={styles.optionRow}>
          <Input
            value={option.name}
            onChangeText={(value) => updateOption(optionIndex, { name: value })}
            placeholder="Option name"
            size="md"
            containerStyle={styles.optionNameInput}
          />
          <Input
            value={String(option.priceDelta)}
            onChangeText={(value) => updateOption(optionIndex, { priceDelta: Number(value) || 0 })}
            placeholder="+₹0"
            keyboardType="numeric"
            size="md"
            containerStyle={styles.optionPriceInput}
          />
          <TouchableOpacity onPress={() => removeOption(optionIndex)} hitSlop={theme.layout.hitSlop}>
            <X size={14} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={() => onChange({ ...group, options: [...group.options, { name: '', priceDelta: 0 }] })}>
        <Text style={styles.addOptionText}>+ Add option</Text>
      </TouchableOpacity>
    </Card>
  );
}

export default KitchenMealForm;

const styles = StyleSheet.create({
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
  uploadTipsLink: { alignSelf: 'flex-start', marginBottom: theme.spacing.paddings.md },
  uploadTipsText: { ...theme.text.caption, color: theme.colors.text.brand, fontWeight: '700' as const },
  rowFields: { flexDirection: 'row', gap: theme.spacing.paddings.sm },
  halfField: { flex: 1 },
  foodTypeRow: { marginBottom: theme.spacing.paddings.sm },
  jainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.paddings.md,
    paddingVertical: theme.spacing.paddings.sm,
  },
  jainTextWrap: { flex: 1, marginRight: theme.spacing.paddings.sm },
  jainLabel: { ...theme.text.label, color: theme.colors.text.primary },
  jainHint: { ...theme.text.caption, color: theme.colors.text.tertiary, marginTop: 2 },
  groupCard: { marginBottom: theme.spacing.paddings.sm },
  groupTopRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm },
  groupNameInput: { flex: 1 },
  groupRemoveButton: { padding: 4 },
  groupMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.paddings.sm,
  },
  requiredToggle: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.xs },
  smallLabel: { ...theme.text.caption, color: theme.colors.text.secondary },
  minMaxRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.xs },
  miniInput: { width: 64 },
  miniInputText: { textAlign: 'center' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm, marginTop: theme.spacing.paddings.sm },
  optionNameInput: { flex: 1 },
  optionPriceInput: { width: 92 },
  addOptionText: { ...theme.text.caption, color: theme.colors.brand.primary, fontWeight: '700' as const, marginTop: theme.spacing.paddings.sm },
  addGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.paddings.md,
  },
  addGroupText: { ...theme.text.label, color: theme.colors.brand.primary },
});
