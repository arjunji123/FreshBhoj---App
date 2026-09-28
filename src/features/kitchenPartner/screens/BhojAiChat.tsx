import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { CheckCircle2, Circle, Clock3, RotateCcw, Send, ShieldAlert, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { AppBar, AppBarAction, Badge, Card, EmptyState, Input, Screen, Text } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useBhojAiHistory, useResetBhojAi, useSendBhojAiMessage } from '../hooks/useKitchenPortal';
import type { BhojAiCard, BhojAiMessage } from '../kitchenPartner.types';

const SUGGESTIONS = ['Check my FSSAI status', 'What documents do I need?', 'How much does this cost?'];

/**
 * The backend hands back `card` as an untyped record — this is the one place
 * that narrows it into a known shape. Anything unrecognised (or absent)
 * simply falls back to rendering `message.text` on its own, per spec.
 */
function parseBhojAiCard(raw: Record<string, unknown> | null | undefined): BhojAiCard | null {
  if (!raw || typeof raw.type !== 'string') return null;
  if (raw.type === 'FSSAI_STATUS' || raw.type === 'DOCUMENT_REJECTED' || raw.type === 'ESCALATION_CREATED') {
    return raw as unknown as BhojAiCard;
  }
  return null;
}

let localMessageSeq = 0;
function localId() {
  localMessageSeq += 1;
  return `local-${Date.now()}-${localMessageSeq}`;
}

const BhojAiChat = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const insets = useSafeAreaInsets();
  const history = useBhojAiHistory();
  const sendMessage = useSendBhojAiMessage();
  const resetChat = useResetBhojAi();

  const [messages, setMessages] = useState<BhojAiMessage[]>([]);
  const [draft, setDraft] = useState('');
  const hasLoadedHistory = useRef(false);
  const listRef = useRef<FlatList<BhojAiMessage>>(null);

  useEffect(() => {
    if (history.data && !hasLoadedHistory.current) {
      setMessages(history.data.messages);
      hasLoadedHistory.current = true;
    }
  }, [history.data]);

  const scrollToEnd = () => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sendMessage.isPending) return;

    const userMessage: BhojAiMessage = { id: localId(), role: 'USER', text: trimmed, card: null, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    scrollToEnd();

    sendMessage.mutate(trimmed, {
      onSuccess: (res) => {
        const modelMessage: BhojAiMessage = {
          id: localId(),
          role: 'MODEL',
          text: res.message,
          card: res.card,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, modelMessage]);
        scrollToEnd();
      },
      onError: (error) =>
        Alert.alert('BhojAI is unavailable', error instanceof KitchenApiError ? error.message : 'Please try again in a moment.'),
    });
  };

  const handleReset = () => {
    Alert.alert('Start a new conversation?', 'This clears your chat history with BhojAI.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () =>
          resetChat.mutate(undefined, {
            onSuccess: () => setMessages([]),
            onError: (error) =>
              Alert.alert('Could not reset', error instanceof KitchenApiError ? error.message : 'Please try again.'),
          }),
      },
    ]);
  };

  return (
    <Screen background="page">
      <AppBar
        title="BhojAI Assistant"
        onBack={() => navigation.goBack()}
        right={
          <AppBarAction accessibilityLabel="Reset conversation" onPress={handleReset}>
            <RotateCcw size={18} color={theme.colors.text.secondary} strokeWidth={2.5} />
          </AppBarAction>
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {history.isError ? (
          <EmptyState
            icon={<ShieldAlert size={28} color={theme.colors.text.tertiary} />}
            title="Couldn't load your chat"
            description="Check your connection and try again."
            actionLabel="Retry"
            onAction={() => history.refetch()}
          />
        ) : history.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.brand.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToEnd}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Sparkles size={24} color={theme.colors.brand.primary} />
                </View>
                <Text variant="h3" align="center">
                  Ask BhojAI anything
                </Text>
                <Text variant="bodySmall" color="secondary" align="center" style={styles.emptyBody}>
                  Your FSSAI application, documents, payouts — BhojAI can look it up for you.
                </Text>
                <View style={styles.suggestionWrap}>
                  {SUGGESTIONS.map((suggestion) => (
                    <Pressable
                      key={suggestion}
                      onPress={() => handleSend(suggestion)}
                      style={({ pressed }) => [styles.suggestionChip, pressed ? styles.pressed : null]}
                    >
                      <Text variant="label" color="brand">
                        {suggestion}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            }
            renderItem={({ item }) => <ChatBubble message={item} navigation={navigation} />}
            ListFooterComponent={
              sendMessage.isPending ? (
                <View style={[styles.bubbleRow, styles.bubbleRowAssistant]}>
                  <View style={[styles.bubble, styles.bubbleAssistant, styles.typingBubble]}>
                    <ActivityIndicator size="small" color={theme.colors.text.secondary} />
                  </View>
                </View>
              ) : null
            }
          />
        )}

        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, theme.spacing.paddings.md) }]}>
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask BhojAI…"
            containerStyle={styles.inputField}
            size="md"
            returnKeyType="send"
            onSubmitEditing={() => handleSend(draft)}
            editable={!sendMessage.isPending}
          />
          <Pressable
            onPress={() => handleSend(draft)}
            disabled={!draft.trim() || sendMessage.isPending}
            style={({ pressed }) => [
              styles.sendButton,
              (!draft.trim() || sendMessage.isPending) ? styles.sendButtonDisabled : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Send size={18} color={theme.colors.palette.white} strokeWidth={2.5} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

function ChatBubble({ message, navigation }: { message: BhojAiMessage; navigation: KitchenPartnerNavigation }) {
  const isUser = message.role === 'USER';
  const card = !isUser ? parseBhojAiCard(message.card) : null;

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant]}>
      {message.text ? (
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text
            variant="bodyMedium"
            style={{ color: isUser ? theme.colors.text.inverse : theme.colors.text.primary }}
          >
            {message.text}
          </Text>
        </View>
      ) : null}
      {card ? <BhojAiCardView card={card} navigation={navigation} /> : null}
    </View>
  );
}

function BhojAiCardView({ card, navigation }: { card: BhojAiCard; navigation: KitchenPartnerNavigation }) {
  if (card.type === 'FSSAI_STATUS') {
    return (
      <Card style={styles.card} padding="md">
        <View style={styles.cardHeaderRow}>
          <Text variant="overline" color="secondary">
            FSSAI APPLICATION STATUS
          </Text>
          <Badge label={card.status.replace(/_/g, ' ')} tone="info" size="sm" />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, card.progressPercent))}%` }]} />
        </View>
        {card.timeline.map((stage, index) => (
          <View key={stage.stage} style={styles.timelineRow}>
            {stage.isComplete ? (
              <CheckCircle2 size={15} color={theme.colors.accent[600]} />
            ) : stage.isCurrent ? (
              <Clock3 size={15} color={theme.colors.brand.primary} />
            ) : (
              <Circle size={15} color={theme.colors.neutral[300]} />
            )}
            <Text
              variant="bodySmall"
              color={stage.isComplete || stage.isCurrent ? 'primary' : 'tertiary'}
              style={styles.timelineLabel}
            >
              {stage.stage.replace(/_/g, ' ')}
            </Text>
            {index === card.timeline.length - 1 && card.estimatedDaysLeft != null ? (
              <Text variant="caption" color="tertiary">
                ~{card.estimatedDaysLeft}d left
              </Text>
            ) : null}
          </View>
        ))}
      </Card>
    );
  }

  if (card.type === 'DOCUMENT_REJECTED') {
    return (
      <Card style={styles.card} padding="md">
        <View style={styles.cardHeaderRow}>
          <Text variant="overline" color="danger">
            DOCUMENT REJECTED
          </Text>
        </View>
        {card.rejectionReason ? (
          <Text variant="bodySmall" color="secondary" style={styles.cardSpacing}>
            {card.rejectionReason}
          </Text>
        ) : null}
        {card.rejectedDocuments.map((doc, i) => (
          <View key={`${doc.type}-${i}`} style={styles.rejectedDocRow}>
            <Text variant="label">{doc.type.replace(/_/g, ' ')}</Text>
            {doc.remarks ? (
              <Text variant="caption" color="secondary">
                {doc.remarks}
              </Text>
            ) : null}
          </View>
        ))}
        {card.nextSteps.length ? (
          <View style={styles.cardSpacing}>
            <Text variant="overline" color="secondary" style={styles.cardSpacing}>
              NEXT STEPS
            </Text>
            {card.nextSteps.map((step, i) => (
              <View key={i} style={styles.nextStepRow}>
                <Circle size={6} color={theme.colors.text.tertiary} fill={theme.colors.text.tertiary} />
                <Text variant="bodySmall" color="secondary" style={styles.timelineLabel}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <Pressable
          onPress={() => navigation.navigate('FssaiAssistance')}
          style={({ pressed }) => [styles.reuploadButton, pressed ? styles.pressed : null]}
        >
          <Text variant="label" color="brand">
            Re-upload documents
          </Text>
        </Pressable>
      </Card>
    );
  }

  // ESCALATION_CREATED
  return (
    <Badge label={`Escalated: ${card.reason}`} tone="warning" size="md" style={styles.card} />
  );
}

export default BhojAiChat;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: theme.layout.screenPadding, paddingVertical: theme.spacing.paddings.md, flexGrow: 1 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: theme.spacing.paddings.xxl },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.brand.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.paddings.md,
  },
  emptyBody: { marginTop: theme.spacing.paddings.xs, marginBottom: theme.spacing.paddings.lg, maxWidth: 280 },
  suggestionWrap: { gap: theme.spacing.paddings.sm, width: '100%' },
  suggestionChip: {
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.paddings.sm,
    paddingHorizontal: theme.spacing.paddings.md,
    alignItems: 'center',
  },
  bubbleRow: { marginBottom: theme.spacing.paddings.sm, maxWidth: '86%' },
  bubbleRowUser: { alignSelf: 'flex-end' },
  bubbleRowAssistant: { alignSelf: 'flex-start' },
  bubble: { borderRadius: theme.radius.lg, paddingHorizontal: theme.spacing.paddings.md, paddingVertical: theme.spacing.paddings.sm },
  bubbleUser: { backgroundColor: theme.colors.brand.primary, borderBottomRightRadius: 4 },
  bubbleAssistant: { backgroundColor: theme.colors.neutral[100], borderBottomLeftRadius: 4 },
  typingBubble: { paddingVertical: theme.spacing.paddings.md, paddingHorizontal: theme.spacing.paddings.lg },
  card: { marginTop: theme.spacing.paddings.xs, width: '100%' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.paddings.sm },
  cardSpacing: { marginTop: theme.spacing.paddings.sm },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: theme.colors.neutral[100], overflow: 'hidden', marginBottom: theme.spacing.paddings.sm },
  progressFill: { height: '100%', backgroundColor: theme.colors.brand.primary, borderRadius: 3 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.xs, paddingVertical: 3 },
  timelineLabel: { flex: 1 },
  rejectedDocRow: { marginTop: theme.spacing.paddings.xs },
  nextStepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.paddings.xs, marginTop: 4 },
  reuploadButton: { marginTop: theme.spacing.paddings.md, alignSelf: 'flex-start' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.paddings.sm,
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.paddings.sm,
    paddingBottom: theme.spacing.paddings.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.surface.base,
  },
  inputField: { flex: 1 },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
});
