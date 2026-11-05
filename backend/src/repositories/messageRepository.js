import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import { decryptMessage, encryptMessage } from '../utils/messageCrypto.js';

const decryptDocument = (message) => {
  if (message) message.content = decryptMessage(message.content);
  return message;
};

export class MessageRepository {
  static async create(messageData) {
    const message = new Message(messageData);
    return await message.save();
  }

  static async findById(messageId) {
    return decryptDocument(await Message.findById(messageId).populate('senderId', 'username profilePicture').populate('receiverId', 'username profilePicture'));
  }

  static async findByChatIdPaginated(chatId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'username profilePicture')
      .populate('receiverId', 'username profilePicture');

    const total = await Message.countDocuments({ chatId });

    return {
      messages: messages.reverse().map(decryptDocument), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async update(messageId, updateData) {
    const updated = await Message.findByIdAndUpdate(messageId, updateData, { new: true })
      .populate('senderId', 'username profilePicture')
      .populate('receiverId', 'username profilePicture');
    return decryptDocument(updated);
  }

  static async delete(messageId) {
    return await Message.findByIdAndDelete(messageId);
  }

  static async markAsDelivered(messageId) {
    return await Message.findByIdAndUpdate(messageId, { delivered: true }, { new: true });
  }

  static async markAsSeen(messageId) {
    return await Message.findByIdAndUpdate(messageId, { seen: true }, { new: true });
  }

  static async markChatMessagesSeen(chatId, receiverId) {
    return await Message.updateMany(
      { chatId, receiverId, seen: false },
      { seen: true },
      { new: true }
    );
  }

  static async updateLastMessage(chatId, lastMessage, lastMessageTime, senderId, receiverId, messageType = 'text') {
    return await Chat.findByIdAndUpdate(
      chatId,
      {
        lastMessage: encryptMessage(lastMessage),
        lastMessageTime,
        lastMessageSenderId: senderId,
        lastMessageSeen: false,
        lastMessageType: messageType,
        $inc: { [`unreadCounts.${receiverId}`]: 1 },
      },
      { new: true }
    );
  }

  static async markChatLastMessageSeen(chatId, receiverId) {
    return await Chat.updateOne(
      {
        _id: chatId,
        lastMessageSenderId: { $ne: receiverId },
      },
      {
        lastMessageSeen: true,
        [`unreadCounts.${receiverId}`]: 0,
      }
    );
  }

  static async deleteByChatId(chatId) {
    return await Message.deleteMany({ chatId });
  }
}

export default MessageRepository;
