import ChatService from '../services/chatService.js';
import { io } from '../server.js';

export const getChats = async (req, res, next) => {
  try {
    const userId = req.userId;

    const chats = await ChatService.getUserChats(userId);

    res.status(200).json({
      success: true,
      data: { chats },
    });
  } catch (error) {
    next(error);
  }
};

export const createChat = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { recipientId } = req.body;

    const chat = await ChatService.getOrCreateChat(userId, recipientId);

    res.status(201).json({
      success: true,
      message: 'Chat created/fetched successfully',
      data: { chat },
    });
  } catch (error) {
    next(error);
  }
};

export const getChatById = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const chat = await ChatService.getChatById(chatId);

    res.status(200).json({
      success: true,
      data: { chat },
    });
  } catch (error) {
    next(error);
  }
};

export const clearChat = async (req, res, next) => {
  try {
    const chat = await ChatService.clearChat(req.params.chatId, req.userId);
    chat.participants.forEach((participant) => {
      if (participant._id.toString() !== req.userId.toString()) {
        io.to(`user:${participant._id}`).emit('chatCleared', { chatId: req.params.chatId });
      }
    });
    res.status(200).json({ success: true, message: 'Chat messages cleared' });
  } catch (error) {
    next(error);
  }
};

export const deleteChat = async (req, res, next) => {
  try {
    const chat = await ChatService.deleteChat(req.params.chatId, req.userId);
    chat.participants.forEach((participant) => {
      if (participant._id.toString() !== req.userId.toString()) {
        io.to(`user:${participant._id}`).emit('chatDeleted', { chatId: req.params.chatId });
      }
    });
    res.status(200).json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    next(error);
  }
};

export const updateRetention = async (req, res, next) => {
  try {
    const retentionHours = Number(req.body.retentionHours);
    if (![0, 24, 48, 72].includes(retentionHours)) {
      return res.status(400).json({ success: false, message: 'Retention must be 0, 24, 48, or 72 hours' });
    }
    await ChatService.updateRetention(req.userId, retentionHours);
    res.status(200).json({ success: true, data: { retentionHours } });
  } catch (error) {
    next(error);
  }
};
