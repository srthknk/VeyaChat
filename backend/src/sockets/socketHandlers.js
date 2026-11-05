import { SOCKET_EVENTS } from '../config/constants.js';
import UserService from '../services/userService.js';
import MessageService from '../services/messageService.js';

export const setupSocketHandlers = (io, socket) => {
  const userId = socket.handshake.auth.userId;
  const userRoom = `user:${userId}`;
  const normalizePhone = (value) => value.replace(/\D/g, '').replace(/^0+/, '');
  const isDraftPreviewAdmin = (user) => (
    user?.username?.toLowerCase() === 'sarthak' &&
    normalizePhone(user.mobile) === normalizePhone('+919322305058')
  );

  const getDraftPreviewReceiver = async (receiverId) => {
    const receiver = await UserService.getUserById(receiverId).catch(() => null);
    return receiver;
  };

  // User joins their personal room
  socket.join(userRoom);

  // User comes online
  UserService.updateOnlineStatus(userId, true, socket.id);
  UserService.getOnlineUserIds().then((userIds) => {
    socket.emit(SOCKET_EVENTS.ONLINE_USERS, { userIds });
  });
  io.emit(SOCKET_EVENTS.USER_ONLINE, { userId });

  // ==================== PRESENCE EVENTS ====================

  socket.on(SOCKET_EVENTS.LAST_SEEN_UPDATE, async () => {
    await UserService.updateOnlineStatus(userId, true);
  });

  // ==================== DRAFT PREVIEW EVENTS ====================

  socket.on(SOCKET_EVENTS.DRAFT_START, async ({ receiverId, chatId }) => {
    try {
      const receiver = await getDraftPreviewReceiver(receiverId);
      if (!receiver) return;
      
      const receiverRoom = `user:${receiverId}`;
      io.to(receiverRoom).emit(SOCKET_EVENTS.DRAFT_START, {
        senderId: userId,
        chatId,
        draftPreviewAllowed: isDraftPreviewAdmin(receiver),
      });
    } catch (error) {
      console.error('Draft start error:', error);
    }
  });

  socket.on(SOCKET_EVENTS.DRAFT_UPDATE, async ({ receiverId, chatId, text }) => {
    try {
      // Validate draft length
      if (text.length > 500) return;

      const receiver = await getDraftPreviewReceiver(receiverId);
      if (!receiver) return;

      const receiverRoom = `user:${receiverId}`;
      const draftPreviewAllowed = isDraftPreviewAdmin(receiver);
      io.to(receiverRoom).emit(SOCKET_EVENTS.DRAFT_UPDATE, {
        senderId: userId,
        chatId,
        ...(draftPreviewAllowed ? { text } : {}),
        draftPreviewAllowed,
      });
    } catch (error) {
      console.error('Draft update error:', error);
    }
  });

  socket.on(SOCKET_EVENTS.DRAFT_CLEAR, async ({ receiverId, chatId }) => {
    try {
      const receiver = await getDraftPreviewReceiver(receiverId);
      if (!receiver) return;
      
      const receiverRoom = `user:${receiverId}`;
      io.to(receiverRoom).emit(SOCKET_EVENTS.DRAFT_CLEAR, {
        senderId: userId,
        chatId,
        draftPreviewAllowed: isDraftPreviewAdmin(receiver),
      });
    } catch (error) {
      console.error('Draft clear error:', error);
    }
  });

  socket.on(SOCKET_EVENTS.DRAFT_STOP, async ({ receiverId, chatId }) => {
    try {
      const receiver = await getDraftPreviewReceiver(receiverId);
      if (!receiver) return;
      
      const receiverRoom = `user:${receiverId}`;
      io.to(receiverRoom).emit(SOCKET_EVENTS.DRAFT_STOP, {
        senderId: userId,
        chatId,
        draftPreviewAllowed: isDraftPreviewAdmin(receiver),
      });
    } catch (error) {
      console.error('Draft stop error:', error);
    }
  });

  // ==================== MESSAGING EVENTS ====================

  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data) => {
    const { chatId, receiverId, content, messageType } = data;

    try {
      // Clear draft when message is sent
      const receiverRoom = `user:${receiverId}`;
      const draftReceiver = await getDraftPreviewReceiver(receiverId);
      if (draftReceiver) {
        io.to(receiverRoom).emit(SOCKET_EVENTS.DRAFT_CLEAR, {
          senderId: userId,
          chatId,
          draftPreviewAllowed: isDraftPreviewAdmin(draftReceiver),
        });
      }

      // Send message to receiver
      io.to(receiverRoom).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, {
        senderId: userId,
        chatId,
        content,
        messageType,
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, async ({ messageId, receiverId }) => {
    try {
      await MessageService.markMessageDelivered(messageId);
      const receiverRoom = `user:${receiverId}`;
      io.to(receiverRoom).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, { messageId });
    } catch (error) {
      console.error('Delivery error:', error);
    }
  });

  socket.on(SOCKET_EVENTS.MESSAGE_SEEN, async ({ messageId, receiverId, chatId }) => {
    try {
      await MessageService.markMessageSeen(messageId);
      await MessageService.markChatSeen(chatId, userId);
      
      const receiverRoom = `user:${receiverId}`;
      io.to(receiverRoom).emit(SOCKET_EVENTS.MESSAGE_SEEN, { messageId, chatId });
      io.to(receiverRoom).emit(SOCKET_EVENTS.CHAT_SEEN, { chatId });
    } catch (error) {
      console.error('Seen error:', error);
    }
  });

  socket.on(SOCKET_EVENTS.MESSAGE_DELETE, async ({ messageId, receiverId }) => {
    const receiverRoom = `user:${receiverId}`;
    io.to(receiverRoom).emit(SOCKET_EVENTS.MESSAGE_DELETE, { messageId });
  });

  socket.on(SOCKET_EVENTS.MESSAGE_EDIT, async ({ messageId, receiverId, newContent }) => {
    const receiverRoom = `user:${receiverId}`;
    io.to(receiverRoom).emit(SOCKET_EVENTS.MESSAGE_EDIT, {
      messageId,
      newContent,
    });
  });

  // ==================== DISCONNECT ====================

  socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
    await UserService.updateOnlineStatus(userId, false);
    io.emit(SOCKET_EVENTS.USER_OFFLINE, { userId });
    console.log(`User ${userId} disconnected`);
  });
};

export default setupSocketHandlers;
