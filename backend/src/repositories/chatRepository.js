import Chat from '../models/Chat.js';
import { decryptMessage } from '../utils/messageCrypto.js';

const decryptChat = (chat) => {
  if (chat?.lastMessage) chat.lastMessage = decryptMessage(chat.lastMessage);
  return chat;
};

export class ChatRepository {
  static async findById(chatId) {
    return decryptChat(await Chat.findById(chatId).populate('participants', 'username firstName lastName mobile bio profilePicture isOnline lastSeen'));
  }

  static async findBetweenUsers(userId1, userId2) {
    return decryptChat(await Chat.findOne({
      participants: {
        $all: [userId1, userId2],
      },
    }).populate('participants', 'username firstName lastName mobile bio profilePicture isOnline lastSeen'));
  }

  static async create(participants) {
    const chat = new Chat({ participants });
    return decryptChat(await chat.save());
  }

  static async findUserChats(userId) {
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'username firstName lastName mobile bio profilePicture isOnline lastSeen')
      .sort({ updatedAt: -1 });
    return chats.map(decryptChat);
  }

  static async update(chatId, updateData) {
    return decryptChat(await Chat.findByIdAndUpdate(chatId, updateData, { new: true }).populate('participants', 'username firstName lastName mobile bio profilePicture isOnline lastSeen'));
  }

  static async delete(chatId) {
    return await Chat.findByIdAndDelete(chatId);
  }

  static async updateRetentionForUser(userId, retentionHours) {
    return await Chat.updateMany({ participants: userId }, { retentionHours });
  }
}

export default ChatRepository;
