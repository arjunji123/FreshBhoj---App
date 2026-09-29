import React from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Share2 } from 'lucide-react-native';
import { useTheme } from '@app/theme/useTheme';
import { AppBar, AppBarAction, Screen } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import type { LegalDoc } from '@features/authentication/constants/legalContent';

/** `LEGAL_DOCS` has no explicit date field — same hardcoded convention `LegalSheet.tsx` already uses at signup. */
const LAST_UPDATED = 'September 2026';

function buildShareText(doc: LegalDoc): string {
  const sections = doc.sections
    .map((section, index) => `${index + 1}. ${section.heading}\n${section.body}`)
    .join('\n\n');
  return `FreshBhoj ${doc.title}\nLast updated: ${LAST_UPDATED}\n\n${sections}`;
}

/**
 * Shared renderer for the static Privacy Policy / Terms of Service screens —
 * both read from the same `LEGAL_DOCS` copy already used in the signup
 * consent sheet (`LegalSheet.tsx`), just as a full page instead of a sheet.
 *
 * No PDF-generation mechanism exists anywhere in this app, so "Download as
 * PDF" would be dishonest here — this uses RN's built-in `Share` sheet
 * instead (the same pattern `ReferralScreen` uses for sharing a referral
 * link), labelled plainly as "Share" rather than implying a PDF file.
 */
const LegalDocScreen: React.FC<{ doc: LegalDoc }> = ({ doc }) => {
  const navigation = useNavigation<PrivateNavigation>();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const handleShare = () => {
    Share.share({ message: buildShareText(doc), title: `FreshBhoj ${doc.title}` });
  };

  return (
    <Screen background="page">
      <AppBar
        title={doc.title}
        onBack={navigation.goBack}
        right={
          <AppBarAction onPress={handleShare} accessibilityLabel={`Share ${doc.title}`}>
            <Share2 size={18} color={theme.colors.text.primary} strokeWidth={2.2} />
          </AppBarAction>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[theme.text.caption, styles.lastUpdated]}>LAST UPDATED · {LAST_UPDATED.toUpperCase()}</Text>

        {doc.sections.map((section, index) => (
          <View key={section.heading} style={styles.section}>
            <View style={styles.headingRow}>
              <Text style={[theme.text.h2, styles.number]}>{index + 1}</Text>
              <Text style={[theme.text.h4, styles.heading]}>{section.heading}</Text>
            </View>
            <Text style={[theme.text.body, styles.body]}>{section.body}</Text>
          </View>
        ))}

        <Text style={[theme.text.caption, styles.footer]}>FreshBhoj · Jaipur</Text>
      </ScrollView>
    </Screen>
  );
};

export default LegalDocScreen;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    scroll: {
      paddingHorizontal: theme.layout.screenPadding,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xxxl,
    },
    lastUpdated: {
      color: theme.colors.text.tertiary,
      marginBottom: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    headingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    number: {
      color: theme.colors.primary[600],
      minWidth: 28,
    },
    heading: {
      flex: 1,
      color: theme.colors.text.primary,
    },
    body: {
      color: theme.colors.text.secondary,
      marginLeft: 28 + theme.spacing.sm,
    },
    footer: {
      textAlign: 'center',
      color: theme.colors.text.tertiary,
      marginTop: theme.spacing.lg,
    },
  });
