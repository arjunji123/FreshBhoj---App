import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Send, ShieldAlert } from 'lucide-react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { AppBar, Badge, EmptyState, Input, Screen, Text } from '@components/ui';
import type { KitchenPartnerNavigation, KitchenPartnerStackParamList } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useOrderMessages, useSendOrderMessage } from '../hooks/useKitchenPortal';
import type { OrderMessage, OrderStatus } from '../kitchenPartner.types';

type OrderChatRoute = RouteProp<KitchenPartnerStackParamList, 'OrderChat'>;

/**
 * Only "Out for delivery" has a sensible 1:1 status mapping — the other two
 * quick replies just send plain text, no `advanceToStatus`.
 */
const QUICK_REPLIES: { label: string; advanceToStatus?: OrderStatus }[] = [
  { label: 'Your order is ready' },
  { label: '5 more minutes' },
  { label: 'Out for delivery', advanceToStatus: 'OUT_FOR_DELIVERY' },
];

let localMessageSeq = 0;
function localId() {
  localMessageSeq += 1;
  return `local-${Date.now()}-${localMessageSeq}`;
}

const OrderChat = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const route = useRoute<OrderChatRoute>();
  const { orderId, orderNumber } = route.params;
  const insets = useSafeAreaInsets();

  const messagesQuery = useOrderMessages(orderId);
  const sendMessage = useSendOrderMessage(orderId);

  const [draft, setDraft] = useState('');
  // Optimistic messages not yet confirmed by the send mutation — spliced out
  // in `handleSend`'s onSuccess/onError, never left to rely on the next poll.
  const [pending, setPending] = useState<OrderMessage[]>([]);
  const listRef = useRef<FlatList<OrderMessage>>(null);

  const serverMessages = messagesQuery.data ?? [];
  const messages = [...serverMessages, ...pending];

  const scrollToEnd = () => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const handleSend = (text: string, advanceToStatus?: OrderStatus) => {
    const trimmed = text.trim();
    if (!trimmed || sendMessage.isPending) return;

    const optimistic: OrderMessage = {
      id: localId(),
      sender: 'KITCHEN',
      body: trimmed,
      triggeredStatus: advanceToStatus ?? null,
      isRead: true,
      createdAt: new Date().toISOString(),
    };
    setPending((prev) => [...prev, optimistic]);
    setDraft('');
    scrollToEnd();

    sendMessage.mutate(
      { body: trimmed, advanceToStatus },
      {
        onSuccess: () => {
          setPending((prev) => prev.filter((m) => m.id !== optimistic.id));
          scrollToEnd();
        },
        onError: (error) => {
          setPending((prev) => prev.filter((m) => m.id !== optimistic.id));
          Alert.alert(
            'Message not sent',
            error instanceof KitchenApiError ? error.message : 'Please try again.',
          );
        },
      },
    );
  };

  return (
    <Screen background="page">
      <AppBar title={orderNumber ? `Order #${orderNumber}` : 'Order Chat'} onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messagesQuery.isError ? (
          <EmptyState
            icon={<ShieldAlert size={28} color={theme.colors.text.tertiary} />}
            title="Couldn't load this chat"
            description="Check your connection and try again."
            actionLabel="Retry"
            onAction={() => messagesQuery.refetch()}
          />
        ) : messagesQuery.isLoading ? (
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
                <Text variant="h3" align="center">
                  No messages yet
                </Text>
                <Text variant="bodySmall" color="secondary" align="center" style={styles.emptyBody}>
                  Send an update and the customer will see it right away.
                </Text>
              </View>
            }
            renderItem={({ item }) => <ChatBubble message={item} />}
          />
        )}

        <View style={styles.suggestionRow}>
          {QUICK_REPLIES.map((reply) => (
            <Pressable
              key={reply.label}
              onPress={() => handleSend(reply.label, reply.advanceToStatus)}
              disabled={sendMessage.isPending}
              style={({ pressed }) => [styles.suggestionChip, pressed ? styles.pressed : null]}
            >
              <Text variant="label" color="brand">
                {reply.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, theme.spacing.paddings.md) }]}>
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder="Message the customer…"
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
              !draft.trim() || sendMessage.isPending ? styles.sendButtonDisabled : null,
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

function ChatBubble({ message }: { message: OrderMessage }) {
  const isKitchen = message.sender === 'KITCHEN';

  return (
    <View style={[styles.bubbleRow, isKitchen ? styles.bubbleRowKitchen : styles.bubbleRowCustomer]}>
      <View style={[styles.bubble, isKitchen ? styles.bubbleKitchen : styles.bubbleCustomer]}>
        <Text variant="bodyMedium" style={isKitchen ? styles.bubbleTextKitchen : styles.bubbleTextCustomer}>
          {message.body}
        </Text>
      </View>
      {message.triggeredStatus ? (
        <Badge
          label={`Status → ${message.triggeredStatus.replace(/_/g, ' ')}`}
          tone="info"
          size="sm"
          style={isKitchen ? styles.statusBadgeRight : styles.statusBadgeLeft}
        />
      ) : null}
    </View>
  );
}

export default OrderChat;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: theme.layout.screenPadding, paddingVertical: theme.spacing.paddings.md, flexGrow: 1 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: theme.spacing.paddings.xxl },
  emptyBody: { marginTop: theme.spacing.paddings.xs, maxWidth: 280 },
  bubbleRow: { marginBottom: theme.spacing.paddings.sm, maxWidth: '86%' },
  bubbleRowKitchen: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleRowCustomer: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { borderRadius: theme.radius.lg, paddingHorizontal: theme.spacing.paddings.md, paddingVertical: theme.spacing.paddings.sm },
  bubbleKitchen: { backgroundColor: theme.colors.brand.primary, borderBottomRightRadius: 4 },
  bubbleCustomer: { backgroundColor: theme.colors.neutral[100], borderBottomLeftRadius: 4 },
  bubbleTextKitchen: { color: theme.colors.text.inverse },
  bubbleTextCustomer: { color: theme.colors.text.primary },
  statusBadgeRight: { marginTop: 4 },
  statusBadgeLeft: { marginTop: 4 },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.paddings.xs,
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.spacing.paddings.sm,
  },
  suggestionChip: {
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.paddings.xs,
    paddingHorizontal: theme.spacing.paddings.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.paddings.sm,
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.paddings.sm,
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
