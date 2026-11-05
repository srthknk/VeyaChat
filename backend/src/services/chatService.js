import { ChatRepository } from '../repositories/chatRepository.js';
import { MessageRepository } from '../repositories/messageRepository.js';
import UserService from './userService.js';

export class ChatService {
  static async getOrCreateChat(userId1, userId2) {
    // Check if chat exists
    let chat = await ChatRepository.findBetweenUsers(userId1, userId2);

    if (!chat) {
      // Create new chat
      chat = await ChatRepository.create([userId1, userId2]);
    }

    return chat;
  }

  static async getUserChats(userId) {
    return await ChatRepository.findUserChats(userId);
  }

  static async getChatById(chatId) {
    const chat = await ChatRepository.findById(chatId);
    if (!chat) {
      const error = new Error('Chat not found');
      error.statusCode = 404;
      throw error;
    }
    return chat;
  }

  static async clearChat(chatId, userId) {
    const chat = await this.getChatById(chatId);
    if (!chat.participants.some((participant) => participant._id.toString() === userId.toString())) {
      const error = new Error('You are not a participant in this chat');
      error.statusCode = 403;
      throw error;
    }
    await MessageRepository.deleteByChatId(chatId);
    return ChatRepository.update(chatId, {
      lastMessage: null,
      lastMessageTime: null,
      lastMessageSenderId: null,
      lastMessageSeen: false,
    });
  }

  static async deleteChat(chatId, userId) {
    const chat = await this.getChatById(chatId);
    if (!chat.participants.some((participant) => participant._id.toString() === userId.toString())) {
      const error = new Error('You are not a participant in this chat');
      error.statusCode = 403;
      throw error;
    }
    await MessageRepository.deleteByChatId(chatId);
    await ChatRepository.delete(chatId);
    return chat;
  }

  static async updateRetention(userId, retentionHours) {
    const user = await UserService.getUserById(userId);
    const normalizedPhone = (user.mobile || '').replace(/\D/g, '').replace(/^0+/, '');
    if (user.username?.toLowerCase() !== 'sarthak' || normalizedPhone !== '919322305058') {
      const error = new Error('Only the Veya admin can change auto-delete settings');
      error.statusCode = 403;
      throw error;
    }
    return ChatRepository.updateRetentionForUser(userId, retentionHours);
  }
}

export default ChatService;
