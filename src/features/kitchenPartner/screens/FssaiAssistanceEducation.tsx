import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BookOpen, CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Button, Card, Screen } from '@components/ui';

const POINTS = [
  'FSSAI (Food Safety and Standards Authority of India) registration is legally required for anyone selling food in India.',
  'It signals to customers that your kitchen meets basic food-safety standards.',
  'FreshBhoj files the government application on your behalf, using the documents you upload next.',
  'Government processing typically takes a few weeks — we’ll keep this screen updated at every stage.',
];

interface Props {
  onNext: () => void;
  onBack: () => void;
}

/** Step 2 of the assistance flow — a short explainer before the pricing screen. */
const FssaiAssistanceEducation: React.FC<Props> = ({ onNext, onBack }) => {
  const insets = useSafeAreaInsets();

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Button title="Back" variant="ghost" size="sm" fullWidth={false} onPress={onBack} />
      </View>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: theme.spacing.paddings.xxl + Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <BookOpen size={28} color={theme.colors.brand.primary} />
        </View>
        <Text style={styles.title}>Why you need FSSAI</Text>

        <Card style={styles.card}>
          {POINTS.map((point) => (
            <View key={point} style={styles.pointRow}>
              <CheckCircle2 size={16} color={theme.colors.accent[600]} style={styles.pointIcon} />
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </Card>

        <Button title="Continue" onPress={onNext} style={styles.button} />
      </ScrollView>
    </Screen>
  );
};

export default FssaiAssistanceEducation;

const styles = StyleSheet.create({
  header: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, alignItems: 'center' },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.brand.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.paddings.lg,
  },
  title: { ...theme.text.h2, color: theme.colors.text.primary, textAlign: 'center', marginBottom: theme.spacing.paddings.lg },
  card: { width: '100%' },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.paddings.sm, marginBottom: theme.spacing.paddings.md },
  pointIcon: { marginTop: 2 },
  pointText: { ...theme.text.bodySmall, color: theme.colors.text.secondary, flex: 1 },
  button: { width: '100%', marginTop: theme.spacing.paddings.lg },
});
