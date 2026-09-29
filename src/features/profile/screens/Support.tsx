import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Mail,
  MessageCircle,
  Phone,
  Receipt,
  Send,
} from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { AppBar, Card, Divider, Skeleton } from '@components/ui';
import AppGradient from '@components/AppGradient';
import type { PrivateNavigation } from '@app/navigation/navigation.types';
import { useFaqs, useSupportContact } from '../hooks/useProfile';

/** Support hub: quick-action tiles, a WhatsApp-backed "instant help" card, one-tap WhatsApp/call/email, and an FAQ accordion. */
const Support = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { data: contact, isLoading: isContactLoading } = useSupportContact();
  const { data: faqs, isLoading } = useFaqs();
  const [openId, setOpenId] = useState<string | null>(null);

  const open = (url: string) =>
    Linking.openURL(url).catch(() => Alert.alert('Could not open that link'));

  const handleStartChat = () => {
    if (contact) open(contact.whatsapp.url);
  };

  const handleTrackOrder = () => navigation.navigate('MainTabs', { screen: 'Orders' });

  // OrdersAndSubscriptions has no route param to pre-select its internal
  // Subscriptions segment, so this lands on the same screen as "Track Order"
  // and the customer flips the in-screen toggle themselves.
  const handleSubscription = () => navigation.navigate('MainTabs', { screen: 'Orders' });

  const handlePayments = () => navigation.navigate('PaymentMethods');

  const grouped = (faqs ?? []).reduce<Record<string, typeof faqs>>((acc, faq) => {
    acc[faq.category] = [...(acc[faq.category] ?? []), faq];
    return acc;
  }, {} as any);

  return (
    <View style={styles.screen}>
      <AppBar title="Help & Support" onBack={navigation.goBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[theme.text.overline, styles.sectionLabel]}>QUICK SUPPORT</Text>
        <View style={styles.quickRow}>
          <QuickTile
            icon={<Receipt size={20} color={theme.colors.primary[600]} strokeWidth={2.2} />}
            label="Track Order"
            onPress={handleTrackOrder}
          />
          <QuickTile
            icon={<CreditCard size={20} color={theme.colors.primary[600]} strokeWidth={2.2} />}
            label="Payments"
            onPress={handlePayments}
          />
          <QuickTile
            icon={<CalendarClock size={20} color={theme.colors.primary[600]} strokeWidth={2.2} />}
            label="Subscription"
            onPress={handleSubscription}
          />
        </View>

        {/*
         * There is no customer-facing AI chat today — BhojAI is a separate,
         * kitchen-partner-only system. This card keeps the prominent,
         * "instant help" visual treatment the design calls for, but the copy
         * is deliberately honest about where "Start Chat" actually goes:
         * the same real WhatsApp support channel as the card below, not a
         * fabricated AI conversation.
         */}
        <Pressable
          onPress={handleStartChat}
          disabled={isContactLoading}
          accessibilityRole="button"
          accessibilityLabel="Start a WhatsApp chat with support"
          style={({ pressed }) => [pressed ? styles.aiCardPressed : null]}
        >
          <AppGradient
            colors={theme.colors.gradients.brand}
            locations={theme.colors.gradients.brandLocations}
            direction="diagonal"
            style={styles.aiCard}
          >
            <View style={styles.aiCardTop}>
              <View style={styles.aiIconWrap}>
                <MessageCircle size={22} color={theme.colors.palette.white} strokeWidth={2.2} />
              </View>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>INSTANT</Text>
              </View>
            </View>

            <Text style={styles.aiTitle}>Need help fast?</Text>
            <Text style={styles.aiSubtitle}>
              Message our support team directly on WhatsApp for order, delivery & payment help.
            </Text>

            <View style={styles.aiButton}>
              <Send size={15} color={theme.colors.primary[700]} strokeWidth={2.4} />
              <Text style={styles.aiButtonText}>Start Chat</Text>
            </View>
          </AppGradient>
        </Pressable>

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
              disabled={isContactLoading}
              onPress={() => contact && open(contact.whatsapp.url)}
            />
            <ContactButton
              icon={<Phone size={19} color={theme.colors.primary[600]} strokeWidth={2.2} />}
              label="Call us"
              tone="brand"
              disabled={isContactLoading}
              onPress={() => contact && open(`tel:${contact.phone}`)}
            />
            <ContactButton
              icon={<Mail size={19} color={theme.colors.primary[600]} strokeWidth={2.2} />}
              label="Email"
              tone="brand"
              disabled={isContactLoading}
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

const QuickTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}> = ({ icon, label, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={({ pressed }) => [styles.quickTile, pressed ? styles.pressed : null]}
  >
    <View style={styles.quickTileIcon}>{icon}</View>
    <Text style={[theme.text.label, styles.quickTileLabel]} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);

const ContactButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  tone: 'accent' | 'brand';
  disabled?: boolean;
  onPress: () => void;
}> = ({ icon, label, tone, disabled, onPress }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
    style={({ pressed }) => [
      styles.contactButton,
      tone === 'accent' ? styles.contactAccent : styles.contactBrand,
      disabled ? styles.contactDisabled : null,
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
  sectionLabel: {
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.md,
  },
  quickRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  quickTile: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface.raised,
    borderWidth: 1,
    borderColor: theme.colors.borders.subtle,
  },
  quickTileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[50],
  },
  quickTileLabel: {
    color: theme.colors.text.secondary,
  },
  aiCardPressed: {
    opacity: 0.94,
  },
  aiCard: {
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.elevation.primary,
  },
  aiCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  aiBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  aiBadgeText: {
    ...theme.text.caption,
    color: theme.colors.palette.white,
    letterSpacing: 0.5,
  },
  aiTitle: {
    ...theme.text.h3,
    color: theme.colors.palette.white,
    marginTop: theme.spacing.md,
  },
  aiSubtitle: {
    ...theme.text.bodySmall,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 4,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.palette.white,
  },
  aiButtonText: {
    ...theme.text.label,
    color: theme.colors.primary[700],
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
  contactDisabled: {
    opacity: 0.5,
  },
  contactLabel: {
    color: theme.colors.text.secondary,
  },
  pressed: {
    opacity: 0.8,
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
