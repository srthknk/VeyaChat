import { useEffect, useRef } from 'react';
import { getSocket, connectSocket } from '../services/socket.js';
import { useChatStore, useUserStore } from '../store/index.js';
import { SOCKET_EVENTS } from '../config/constants.js';
import { isStandalonePwa, requestNativeNotificationPermission, showNativeNotification } from '../services/notifications.js';

export const useSocket = (token, currentUser) => {
  const socketRef = useRef(null);
  const { setDraft, clearDraft, addMessage, updateMessage, updateChat, removeChat, clearChatMessages, setTypingUser, upsertNotification, removeNotification } = useChatStore();
  const { addOnlineUser, removeOnlineUser, setLastSeen } = useUserStore();
  const normalizePhone = (value = '') => value.replace(/\D/g, '').replace(/^0+/, '');
  const canViewDraftPreview = currentUser?.username?.toLowerCase() === 'sarthak' &&
    normalizePhone(currentUser?.mobile) === normalizePhone('+919322305058');

  useEffect(() => {
    if (!token && !currentUser) return;

    socketRef.current = connectSocket(token);
    const socket = socketRef.current;

    requestNativeNotificationPermission().catch((error) => {
      console.error('Native notification permission request failed:', error);
    });

    // Presence events
    socket.on(SOCKET_EVENTS.USER_ONLINE, ({ userId }) => {
      addOnlineUser(userId);
    });

    socket.on(SOCKET_EVENTS.ONLINE_USERS, ({ userIds }) => {
      userIds.forEach((userId) => addOnlineUser(userId));
    });

    socket.on(SOCKET_EVENTS.USER_OFFLINE, ({ userId }) => {
      removeOnlineUser(userId);
    });

    socket.on(SOCKET_EVENTS.LAST_SEEN_UPDATE, ({ userId, lastSeen }) => {
      setLastSeen(userId, lastSeen);
    });

    // Draft preview events - only the exact admin account can view them.
    socket.on(SOCKET_EVENTS.DRAFT_START, ({ senderId, chatId, draftPreviewAllowed }) => {
      setTypingUser(chatId, senderId, true);
      if (canViewDraftPreview && draftPreviewAllowed) setTypingUser(chatId, senderId, true);
      showNativeNotification({
        title: 'Typing now',
        text: 'Someone is typing a message',
        chatId,
        tag: `typing-${chatId}-${senderId}`,
      }).catch((error) => {
        console.error('Typing notification failed:', error);
      });
    });

    socket.on(SOCKET_EVENTS.DRAFT_UPDATE, ({ senderId, chatId, text, draftPreviewAllowed }) => {
      if (canViewDraftPreview && draftPreviewAllowed) {
        setDraft(chatId, senderId, text);
        showNativeNotification({
          title: 'Typing now',
          text: `Someone is typing: ${text}`,
          chatId,
          tag: `typing-${chatId}-${senderId}`,
        }).catch((error) => {
          console.error('Typing notification failed:', error);
        });
        if (!isStandalonePwa()) {
          upsertNotification({
            id: `typing-${chatId}-${senderId}`,
            type: 'typing',
            title: 'Typing now',
            text: `Someone is typing: ${text}`,
            chatId,
          });
        }
      }
      if (!draftPreviewAllowed) setTypingUser(chatId, senderId, true);
    });

    socket.on(SOCKET_EVENTS.DRAFT_CLEAR, ({ senderId, chatId, draftPreviewAllowed }) => {
      clearDraft(chatId, senderId);
      setTypingUser(chatId, senderId, false);
      removeNotification(`typing-${chatId}-${senderId}`);
    });

    socket.on(SOCKET_EVENTS.DRAFT_STOP, ({ senderId, chatId, draftPreviewAllowed }) => {
      setTypingUser(chatId, senderId, false);
      removeNotification(`typing-${chatId}-${senderId}`);
    });

    // Messaging events
    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVE, (message) => {
      addMessage(message);
      const senderId = message.senderId?._id || message.senderId;
      const currentChat = useChatStore.getState().chats.find((chat) => chat._id === message.chatId);
      const unreadCounts = { ...(currentChat?.unreadCounts || {}) };
      unreadCounts[currentUser?._id] = Number(unreadCounts[currentUser?._id] || 0) + 1;
      updateChat(message.chatId, {
        lastMessage: message.content,
        lastMessageType: message.messageType,
        lastMessageSenderId: senderId,
        lastMessageSeen: false,
        unreadCounts,
      });
      const senderName = typeof message.senderId === 'object' ? message.senderId.username : 'Someone';
      const title = `New message from @${senderName}`;
      showNativeNotification({
        title,
        text: message.content,
        chatId: message.chatId,
        tag: `message-${message._id}`,
      }).catch((error) => {
        console.error('Message notification failed:', error);
      });
      if (!isStandalonePwa()) {
        upsertNotification({
          id: `message-${message._id}`,
          type: 'message',
          title,
          text: message.content,
          chatId: message.chatId,
        });
      }
    });

    socket.on(SOCKET_EVENTS.MESSAGE_SENT, ({ clientMessageId, message }) => {
      if (clientMessageId && message) {
        updateMessage(clientMessageId, { ...message, pending: false });
      }
    });

    socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, ({ messageId }) => {
      updateMessage(messageId, { delivered: true });
    });

    socket.on(SOCKET_EVENTS.MESSAGE_SEEN, ({ messageId, chatId }) => {
      updateMessage(messageId, { seen: true });
      if (chatId) updateChat(chatId, { lastMessageSeen: true });
    });

    socket.on(SOCKET_EVENTS.CHAT_SEEN, ({ chatId }) => {
      updateChat(chatId, { lastMessageSeen: true });
    });

    socket.on(SOCKET_EVENTS.CHAT_CLEARED, ({ chatId }) => {
      clearChatMessages(chatId);
      updateChat(chatId, { lastMessage: null, lastMessageTime: null, lastMessageSeen: false });
    });

    socket.on(SOCKET_EVENTS.CHAT_DELETED, ({ chatId }) => {
      removeChat(chatId);
      clearChatMessages(chatId);
    });

    socket.on(SOCKET_EVENTS.MESSAGE_DELETE, ({ messageId }) => {
      updateMessage(messageId, { deleted: true });
    });

    socket.on(SOCKET_EVENTS.MESSAGE_EDIT, ({ messageId, newContent }) => {
      updateMessage(messageId, { content: newContent });
    });

    return () => {
      [
        SOCKET_EVENTS.USER_ONLINE,
        SOCKET_EVENTS.ONLINE_USERS,
        SOCKET_EVENTS.USER_OFFLINE,
        SOCKET_EVENTS.LAST_SEEN_UPDATE,
        SOCKET_EVENTS.DRAFT_START,
        SOCKET_EVENTS.DRAFT_UPDATE,
        SOCKET_EVENTS.DRAFT_CLEAR,
        SOCKET_EVENTS.DRAFT_STOP,
        SOCKET_EVENTS.MESSAGE_RECEIVE,
        SOCKET_EVENTS.MESSAGE_SENT,
        SOCKET_EVENTS.MESSAGE_DELIVERED,
        SOCKET_EVENTS.MESSAGE_SEEN,
        SOCKET_EVENTS.CHAT_SEEN,
        SOCKET_EVENTS.CHAT_CLEARED,
        SOCKET_EVENTS.CHAT_DELETED,
        SOCKET_EVENTS.MESSAGE_DELETE,
        SOCKET_EVENTS.MESSAGE_EDIT,
      ].forEach((event) => socket.off(event));
    };
  }, [token, currentUser?._id, canViewDraftPreview]);

  return socketRef.current;
};
