import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageSquare, Send, ShieldAlert } from 'lucide-react-native';
import { ApiError, qk } from '@api';
import { useQueryClient } from '@tanstack/react-query';
import { AppBar, EmptyState, Input, Screen, Text } from '@components/ui';
import type { OrderChatMessage } from '@api/types';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { useTheme } from '@app/theme/useTheme';
import { formatTime } from '@utils/format';
import { useOrderMessages, useSendOrderMessage } from '../hooks/useOrderChat';

type Route = RouteProp<PrivateStackParamList, 'OrderChat'>;

const MAX_LENGTH = 500;

/** Customer side of the per-order chat. Opening it marks the kitchen's messages as read. */
const OrderChat = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<PrivateNavigation>();
  const { orderId, orderNumber, kitchenName } = useRoute<Route>().params;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const messagesQuery = useOrderMessages(orderId);
  const sendMessage = useSendOrderMessage(orderId);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<OrderChatMessage>>(null);

  const messages = messagesQuery.data ?? [];

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  // Opening the thread marks the kitchen's messages read server-side, so the
  // "new message" dot on the tracking screen must be re-checked on the way out.
  const handleBack = () => {
    queryClient.invalidateQueries({ queryKey: qk.orders.tracking(orderId) });
    queryClient.invalidateQueries({ queryKey: qk.notifications.unreadCount });
    navigation.goBack();
  };

  const handleSend = () => {
    const body = draft.trim();
    if (!body || sendMessage.isPending) return;

    sendMessage.mutate(body, {
      onSuccess: () => {
        setDraft('');
        scrollToEnd();
      },
      onError: (error) =>
        Alert.alert(
          'Message not sent',
          error instanceof ApiError ? error.message : 'Please try again.',
        ),
    });
  };

  const canSend = draft.trim().length > 0 && !sendMessage.isPending;

  const renderBody = () => {
    if (messagesQuery.isLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary[600]} />
        </View>
      );
    }
    if (messagesQuery.isError && !messagesQuery.data) {
      return (
        <EmptyState
          icon={<ShieldAlert size={32} color={theme.colors.state.error} strokeWidth={1.8} />}
          title="Could not load this chat"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => messagesQuery.refetch()}
        />
      );
    }
    return (
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToEnd}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MessageSquare size={32} color={theme.colors.text.tertiary} strokeWidth={1.8} />
            <Text variant="h3" align="center">
              No messages yet
            </Text>
            <Text variant="bodySmall" color="secondary" align="center">
              Ask the kitchen about your order, like spice level or delivery instructions.
            </Text>
          </View>
        }
        renderItem={({ item }) => <ChatBubble message={item} />}
      />
    );
  };

  return (
    <Screen background="page">
      <AppBar
        title={kitchenName ?? 'Chat with kitchen'}
        subtitle={orderNumber ? `Order #${orderNumber}` : undefined}
        onBack={handleBack}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {renderBody()}

        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, theme.spacing.md) }]}>
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder="Message the kitchen…"
            containerStyle={styles.inputField}
            size="md"
            maxLength={MAX_LENGTH}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={!sendMessage.isPending}
            accessibilityLabel="Message to the kitchen"
          />
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            style={({ pressed }) => [
              styles.sendButton,
              !canSend ? styles.sendButtonDisabled : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Send size={18} color={theme.colors.text.inverse} strokeWidth={2.5} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const ChatBubble = ({ message }: { message: OrderChatMessage }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const mine = message.sender === 'CUSTOMER';

  return (
    <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text variant="body" style={mine ? styles.textMine : styles.textTheirs}>
          {message.body}
        </Text>
        <Text variant="caption" style={mine ? styles.timeMine : styles.timeTheirs}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
};

export default OrderChat;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    flex: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    listContent: { padding: theme.layout.screenPadding, flexGrow: 1, gap: theme.spacing.sm },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xl,
    },
    bubbleRow: { flexDirection: 'row' },
    bubbleRowMine: { justifyContent: 'flex-end' },
    bubbleRowTheirs: { justifyContent: 'flex-start' },
    bubble: {
      maxWidth: '82%',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.lg,
      gap: 2,
    },
    bubbleMine: { backgroundColor: theme.colors.primary[600], borderBottomRightRadius: theme.radius.xs },
    bubbleTheirs: {
      backgroundColor: theme.colors.surface.base,
      borderWidth: 1,
      borderColor: theme.colors.borders.subtle,
      borderBottomLeftRadius: theme.radius.xs,
    },
    textMine: { color: theme.colors.text.inverse },
    textTheirs: { color: theme.colors.text.primary },
    timeMine: { color: theme.colors.text.inverse, opacity: 0.8, alignSelf: 'flex-end' },
    timeTheirs: { color: theme.colors.text.tertiary, alignSelf: 'flex-end' },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.layout.screenPadding,
      paddingTop: theme.spacing.sm,
      backgroundColor: theme.colors.surface.base,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borders.subtle,
    },
    inputField: { flex: 1 },
    sendButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary[600],
    },
    sendButtonDisabled: { opacity: 0.4 },
    pressed: { opacity: 0.8 },
  });
