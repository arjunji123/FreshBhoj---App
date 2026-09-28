import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Camera, CheckCircle2, FileText, XCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, Card, Screen, Text } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';

interface TipRow {
  good: boolean;
  text: string;
}

const PHOTO_TIPS: TipRow[] = [
  { good: true, text: 'Shoot in bright, natural light — near a window works well.' },
  { good: true, text: 'Fill the frame with the dish, shot from a 45° angle.' },
  { good: true, text: 'Use a plain plate or bowl so the food is the focus.' },
  { good: false, text: "Don't use flash — it flattens the food and washes out colour." },
  { good: false, text: "Don't include hands, packaging, or cluttered backgrounds." },
  { good: false, text: "Don't upload blurry, dark, or heavily filtered photos." },
];

const FSSAI_TIPS: TipRow[] = [
  { good: true, text: 'Photograph the full certificate — all four corners visible.' },
  { good: true, text: 'Make sure the licence number and expiry date are sharp and legible.' },
  { good: true, text: 'A flat scan or PDF works better than a photo if you have one.' },
  { good: false, text: "Don't crop out the QR code or the issuing authority's seal." },
  { good: false, text: "Don't upload a screenshot of a screenshot — quality degrades fast." },
];

const GENERAL_DOS = [
  'Keep photos consistent across your menu — same lighting style builds trust.',
  "Update photos if a dish's presentation changes.",
  'Re-upload documents immediately if a submission is rejected.',
];

const GENERAL_DONTS = [
  "Don't use photos of a similar dish from the internet — customers notice.",
  "Don't upload documents under someone else's name.",
  "Don't wait until the last minute to renew an expiring licence.",
];

const UploadGuide = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();

  return (
    <Screen background="page">
      <AppBar title="Upload Guide" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Section icon={<Camera size={18} color={theme.colors.brand.primary} />} title="Dish photos" tips={PHOTO_TIPS} />
        <Section icon={<FileText size={18} color={theme.colors.brand.primary} />} title="FSSAI certificate" tips={FSSAI_TIPS} />

        <Card style={styles.card}>
          <Text variant="overline" color="tertiary" style={styles.cardHeading}>
            DO
          </Text>
          {GENERAL_DOS.map((text, i) => (
            <TipLine key={i} good text={text} />
          ))}
          <Text variant="overline" color="tertiary" style={[styles.cardHeading, styles.dontHeading]}>
            DON&apos;T
          </Text>
          {GENERAL_DONTS.map((text, i) => (
            <TipLine key={i} good={false} text={text} />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
};

function Section({ icon, title, tips }: { icon: React.ReactNode; title: string; tips: TipRow[] }) {
  return (
    <Card style={styles.card}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionIconWrap}>{icon}</View>
        <Text variant="h4">{title}</Text>
      </View>
      {tips.map((tip, i) => (
        <TipLine key={i} good={tip.good} text={tip.text} />
      ))}
    </Card>
  );
}

function TipLine({ good, text }: { good: boolean; text: string }) {
  return (
    <View style={styles.tipRow}>
      {good ? (
        <CheckCircle2 size={16} color={theme.colors.accent[600]} />
      ) : (
        <XCircle size={16} color={theme.colors.state.error} />
      )}
      <Text variant="bodySmall" color="secondary" style={styles.tipText}>
        {text}
      </Text>
    </View>
  );
}

export default UploadGuide;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, paddingBottom: theme.spacing.paddings.xxl },
  card: { marginBottom: theme.spacing.paddings.md },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm, marginBottom: theme.spacing.paddings.sm },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.brand.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeading: { marginBottom: theme.spacing.paddings.sm },
  dontHeading: { marginTop: theme.spacing.paddings.md },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.paddings.sm, marginBottom: theme.spacing.paddings.sm },
  tipText: { flex: 1 },
});
