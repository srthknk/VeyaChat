import { MessageRepository } from '../repositories/messageRepository.js';
import { ChatRepository } from '../repositories/chatRepository.js';
import { encryptMessage } from '../utils/messageCrypto.js';

export class MessageService {
  static async sendMessage(chatId, senderId, receiverId, content, messageType = 'text', mediaUrl = null) {
    const chat = await ChatRepository.findById(chatId);
    const expiresAt = chat?.retentionHours ? new Date(Date.now() + chat.retentionHours * 60 * 60 * 1000) : null;
    const message = await MessageRepository.create({
      chatId,
      senderId,
      receiverId,
      content: encryptMessage(content),
      messageType,
      mediaUrl,
      expiresAt,
    });

    // Update last message in chat
    await MessageRepository.updateLastMessage(chatId, content, new Date(), senderId, receiverId, messageType);

    return await MessageRepository.findById(message._id);
  }

  static async getMessagesPaginated(chatId, page = 1) {
    return await MessageRepository.findByChatIdPaginated(chatId, page);
  }

  static async markMessageDelivered(messageId) {
    return await MessageRepository.markAsDelivered(messageId);
  }

  static async markMessageSeen(messageId) {
    return await MessageRepository.markAsSeen(messageId);
  }

  static async markChatSeen(chatId, receiverId) {
    const result = await MessageRepository.markChatMessagesSeen(chatId, receiverId);
    await MessageRepository.markChatLastMessageSeen(chatId, receiverId);
    return result;
  }

  static async deleteMessage(messageId) {
    const message = await MessageRepository.findById(messageId);
    if (!message) {
      const error = new Error('Message not found');
      error.statusCode = 404;
      throw error;
    }
    return await MessageRepository.delete(messageId);
  }

  static async editMessage(messageId, newContent) {
    const message = await MessageRepository.update(messageId, { content: encryptMessage(newContent) });
    if (!message) {
      const error = new Error('Message not found');
      error.statusCode = 404;
      throw error;
    }
    return message;
  }
}

export default MessageService;
