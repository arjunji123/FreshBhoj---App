import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { X } from 'lucide-react-native';
import PressableScale from '@animations/PressableScale';
import { useTheme } from '@app/theme/useTheme';
import { ACTIVITY_OPTIONS, FIT, FIT_GOALS, MACRO_COLORS, type Activity, type FitGoal, type Sex } from '../fit.constants';
import { calcTargets, type FitProfile } from '../fit.utils';

interface TargetSheetProps {
  visible: boolean;
  initial: FitProfile | null;
  onClose: () => void;
  onSave: (profile: FitProfile) => void;
}

const DEFAULTS: FitProfile = { sex: 'MALE', age: 25, heightCm: 170, weightKg: 70, activity: 'MODERATE', goal: 'BALANCED' };

const GOAL_CHOICES = FIT_GOALS.filter((g) => g.key !== 'ALL');

/** Bottom sheet that turns body stats into daily calorie + macro targets, live as you type. */
const TargetSheet: React.FC<TargetSheetProps> = ({ visible, initial, onClose, onSave }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const start = initial ?? DEFAULTS;
  const [sex, setSex] = useState<Sex>(start.sex);
  const [age, setAge] = useState(String(start.age));
  const [height, setHeight] = useState(String(start.heightCm));
  const [weight, setWeight] = useState(String(start.weightKg));
  const [activity, setActivity] = useState<Activity>(start.activity);
  const [goal, setGoal] = useState<FitGoal>(start.goal === 'ALL' ? 'BALANCED' : start.goal);

  const profile: FitProfile | null = useMemo(() => {
    const a = parseInt(age, 10);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!(a >= 13 && a <= 90 && h >= 120 && h <= 230 && w >= 30 && w <= 250)) return null;
    return { sex, age: a, heightCm: h, weightKg: w, activity, goal };
  }, [sex, age, height, weight, activity, goal]);
  const preview = profile ? calcTargets(profile) : null;

  const seg = <T extends string>(options: Array<{ key: T; label: string }>, value: T, onChange: (v: T) => void) => (
    <View style={styles.seg}>
      {options.map((o) => (
        <PressableScale key={o.key} haptic={false} scaleTo={0.97} onPress={() => onChange(o.key)} style={[styles.segItem, value === o.key ? styles.segOn : null]}>
          <Text style={[styles.segText, value === o.key ? styles.segTextOn : null]}>{o.label}</Text>
        </PressableScale>
      ))}
    </View>
  );

  const field = (label: string, value: string, set: (v: string) => void, unit: string) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={(t) => set(t.replace(/[^0-9.]/g, ''))}
          keyboardType="decimal-pad"
          maxLength={5}
          style={styles.input}
          placeholderTextColor={theme.colors.text.tertiary}
          accessibilityLabel={label}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Your daily target</Text>
                <Text style={styles.subtitle}>We calculate calories and protein for you</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
                <X size={22} color={theme.colors.text.secondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
              <Text style={styles.section}>I am</Text>
              {seg([{ key: 'MALE' as Sex, label: 'Male' }, { key: 'FEMALE' as Sex, label: 'Female' }], sex, setSex)}

              <View style={styles.fieldRow}>
                {field('Age', age, setAge, 'yrs')}
                {field('Height', height, setHeight, 'cm')}
                {field('Weight', weight, setWeight, 'kg')}
              </View>

              <Text style={styles.section}>How active are you?</Text>
              {seg(ACTIVITY_OPTIONS.map((a) => ({ key: a.key, label: a.label })), activity, setActivity)}
              <Text style={styles.hint}>{ACTIVITY_OPTIONS.find((a) => a.key === activity)?.hint}</Text>

              <Text style={styles.section}>My goal</Text>
              {seg(GOAL_CHOICES.map((g) => ({ key: g.key, label: g.label })), goal, setGoal)}

              <View style={styles.preview}>
                {preview ? (
                  <>
                    <Text style={styles.previewKcal}>
                      {preview.kcal}
                      <Text style={styles.previewUnit}> kcal / day</Text>
                    </Text>
                    <View style={styles.previewRow}>
                      <Text style={[styles.previewMacro, { color: MACRO_COLORS.protein }]}>{preview.proteinG}g protein</Text>
                      <Text style={[styles.previewMacro, { color: MACRO_COLORS.carbs }]}>{preview.carbsG}g carbs</Text>
                      <Text style={[styles.previewMacro, { color: MACRO_COLORS.fat }]}>{preview.fatG}g fat</Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.previewHint}>Enter your age, height and weight to see your target.</Text>
                )}
              </View>
              <Text style={styles.disclaimer}>A starting point based on a standard formula, not medical advice.</Text>
            </ScrollView>

            <PressableScale
              disabled={!profile}
              onPress={() => profile && onSave(profile)}
              accessibilityRole="button"
              accessibilityLabel="Save my target"
              style={[styles.save, !profile ? styles.saveOff : null]}
            >
              <Text style={styles.saveText}>Save my target</Text>
            </PressableScale>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default TargetSheet;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: {
      maxHeight: '92%',
      backgroundColor: theme.colors.surface.base,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: theme.spacing.lg,
      paddingHorizontal: theme.layout.screenPadding,
      paddingBottom: theme.spacing.xl,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
    title: { ...theme.text.h2, color: theme.colors.text.primary },
    subtitle: { ...theme.text.bodySmall, color: theme.colors.text.secondary },
    content: { gap: theme.spacing.sm, paddingBottom: theme.spacing.md },
    section: { ...theme.text.label, color: theme.colors.text.primary, marginTop: theme.spacing.sm },
    seg: { flexDirection: 'row', gap: 6, padding: 4, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface.subtle },
    segItem: { flex: 1, paddingVertical: 10, borderRadius: theme.radius.pill, alignItems: 'center' },
    segOn: { backgroundColor: FIT.deep },
    segText: { ...theme.text.caption, fontWeight: '700', color: theme.colors.text.secondary },
    segTextOn: { color: FIT.onHero },
    hint: { ...theme.text.caption, color: theme.colors.text.tertiary },
    fieldRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
    field: { flex: 1, gap: 4 },
    fieldLabel: { ...theme.text.caption, color: theme.colors.text.secondary, fontWeight: '700' },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface.subtle,
      borderWidth: 1,
      borderColor: theme.colors.borders.subtle,
    },
    input: { flex: 1, paddingVertical: 12, fontSize: 17, fontWeight: '700', color: theme.colors.text.primary },
    unit: { ...theme.text.caption, color: theme.colors.text.tertiary },
    preview: { marginTop: theme.spacing.md, padding: theme.spacing.md, borderRadius: theme.radius.xl, backgroundColor: FIT.forest, gap: 6 },
    previewKcal: { color: FIT.lime, fontSize: 32, fontWeight: '800' },
    previewUnit: { color: FIT.heroMuted, fontSize: 14, fontWeight: '600' },
    previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
    previewMacro: { fontSize: 13, fontWeight: '800', color: FIT.onHero },
    previewHint: { color: FIT.heroMuted, fontSize: 13 },
    disclaimer: { ...theme.text.caption, color: theme.colors.text.tertiary, textAlign: 'center' },
    save: { marginTop: theme.spacing.sm, paddingVertical: 15, borderRadius: theme.radius.pill, alignItems: 'center', backgroundColor: FIT.emerald },
    saveOff: { opacity: 0.4 },
    saveText: { color: FIT.onHero, fontSize: 16, fontWeight: '800' },
  });
