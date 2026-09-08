import React, { forwardRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '@app/theme/index';
import { Sheet, type SheetHandle } from '@components/ui';
import type { LegalDoc } from '../constants/legalContent';

interface LegalSheetProps {
  doc: LegalDoc | null;
}

/** Bottom sheet for Terms / Privacy / Content policy — same shell as every other sheet in the app. */
const LegalSheet = forwardRef<SheetHandle, LegalSheetProps>(({ doc }, ref) => (
  <Sheet ref={ref} eyebrow={doc?.eyebrow ?? 'LEGAL'} title={doc?.title ?? ''} heightRatio={0.8}>
    <ScrollView
      style={styles.scrollFlex}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {doc?.sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text style={[theme.text.h4, styles.heading]}>{section.heading}</Text>
          <Text style={[theme.text.body, styles.body]}>{section.body}</Text>
        </View>
      ))}
      <Text style={[theme.text.caption, styles.footer]}>
        FreshBhoj · Jaipur · Last updated 2026
      </Text>
    </ScrollView>
  </Sheet>
));

LegalSheet.displayName = 'LegalSheet';

export default LegalSheet;

const styles = StyleSheet.create({
  scrollFlex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  heading: {
    color: theme.colors.primary[700],
    marginBottom: 6,
  },
  body: {
    color: theme.colors.text.secondary,
  },
  footer: {
    textAlign: 'center',
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.md,
  },
});
