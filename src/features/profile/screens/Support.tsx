import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, ChevronUp, Mail, MessageCircle, Phone } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { AppBar, Card, Divider, Skeleton } from '@components/ui';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useFaqs, useSupportContact } from '../hooks/useProfile';

/** Support hub: one-tap WhatsApp, plus an FAQ accordion. */
const Support = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { data: contact } = useSupportContact();
  const { data: faqs, isLoading } = useFaqs();
  const [openId, setOpenId] = useState<string | null>(null);

  const open = (url: string) =>
    Linking.openURL(url).catch(() => Alert.alert('Could not open that link'));

  const grouped = (faqs ?? []).reduce<Record<string, typeof faqs>>((acc, faq) => {
    acc[faq.category] = [...(acc[faq.category] ?? []), faq];
    return acc;
  }, {} as any);

  return (
    <View style={styles.screen}>
      <AppBar title="Help & Support" onBack={navigation.goBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Card padding="lg" elevation="sm" style={styles.contactCard}>
          <Text style={theme.text.h3}>Talk to a human</Text>
          <Text style={[theme.text.bodySmall, styles.contactHours]}>
            {contact?.hours ?? 'Every day, 8:00 AM – 11:00 PM IST'}
          </Text>

          <View style={styles.contactRow}>
            <ContactButton
              icon={<MessageCircle size={19} color={theme.colors.accent[600]} strokeWidth={2.2} />}
              label="WhatsApp"
              tone="accent"
              onPress={() => contact && open(contact.whatsapp.url)}
            />
            <ContactButton
              icon={<Phone size={19} color={theme.colors.primary[600]} strokeWidth={2.2} />}
              label="Call us"
              tone="brand"
              onPress={() => contact && open(`tel:${contact.phone}`)}
            />
            <ContactButton
              icon={<Mail size={19} color={theme.colors.primary[600]} strokeWidth={2.2} />}
              label="Email"
              tone="brand"
              onPress={() => contact && open(`mailto:${contact.email}`)}
            />
          </View>
        </Card>

        <Text style={[theme.text.overline, styles.sectionLabel]}>FREQUENTLY ASKED</Text>

        {isLoading ? (
          <View style={styles.loading}>
            <Skeleton height={62} radius={theme.radius.card} />
            <Skeleton height={62} radius={theme.radius.card} />
            <Skeleton height={62} radius={theme.radius.card} />
          </View>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <View key={category} style={styles.group}>
              <Text style={[theme.text.label, styles.groupTitle]}>{titleCase(category)}</Text>
              <Card padding="none" elevation="xs">
                {(items ?? []).map((faq, index) => {
                  const isOpen = openId === faq.id;
                  return (
                    <View key={faq.id}>
                      {index > 0 ? <Divider spacing={0} /> : null}
                      <Pressable
                        onPress={() => setOpenId(isOpen ? null : faq.id)}
                        accessibilityRole="button"
                        accessibilityState={{ expanded: isOpen }}
                        style={styles.faqHeader}
                      >
                        <Text style={[theme.text.h4, styles.faqQuestion]}>{faq.question}</Text>
                        {isOpen ? (
                          <ChevronUp size={18} color={theme.colors.text.tertiary} strokeWidth={2.4} />
                        ) : (
                          <ChevronDown size={18} color={theme.colors.text.tertiary} strokeWidth={2.4} />
                        )}
                      </Pressable>
                      {isOpen ? (
                        <Text style={[theme.text.body, styles.faqAnswer]}>{faq.answer}</Text>
                      ) : null}
                    </View>
                  );
                })}
              </Card>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const ContactButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  tone: 'accent' | 'brand';
  onPress: () => void;
}> = ({ icon, label, tone, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={({ pressed }) => [
      styles.contactButton,
      tone === 'accent' ? styles.contactAccent : styles.contactBrand,
      pressed ? styles.pressed : null,
    ]}
  >
    {icon}
    <Text style={[theme.text.caption, styles.contactLabel]}>{label}</Text>
  </Pressable>
);

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default Support;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  scroll: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxxl,
  },
  contactCard: {
    marginBottom: theme.spacing.lg,
  },
  contactHours: {
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  contactRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  contactButton: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.card,
  },
  contactAccent: {
    backgroundColor: theme.colors.accent[50],
  },
  contactBrand: {
    backgroundColor: theme.colors.primary[50],
  },
  contactLabel: {
    color: theme.colors.text.secondary,
  },
  pressed: {
    opacity: 0.8,
  },
  sectionLabel: {
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.md,
  },
  loading: {
    gap: theme.spacing.sm,
  },
  group: {
    marginBottom: theme.spacing.lg,
  },
  groupTitle: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  faqQuestion: {
    flex: 1,
  },
  faqAnswer: {
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    marginTop: -theme.spacing.sm,
  },
});
