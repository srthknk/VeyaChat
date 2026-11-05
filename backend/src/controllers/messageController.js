import MessageService from '../services/messageService.js';
import ChatService from '../services/chatService.js';
import { io } from '../server.js';
import { SOCKET_EVENTS } from '../config/constants.js';
import cloudinary from '../config/cloudinary.js';

export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { receiverId, content, messageType, mediaUrl } = req.body;

    // Get or create chat
    const chat = await ChatService.getOrCreateChat(userId, receiverId);

    let uploadedMediaUrl = mediaUrl || null;
    if (typeof uploadedMediaUrl === 'string' && uploadedMediaUrl.startsWith('data:')) {
      const upload = await cloudinary.uploader.upload(uploadedMediaUrl, {
        folder: 'veya/messages',
        resource_type: 'auto',
      });
      uploadedMediaUrl = upload.secure_url;
    }

    // Send message
    const message = await MessageService.sendMessage(
      chat._id,
      userId,
      receiverId,
      content,
      messageType || 'text',
      uploadedMediaUrl
    );

    // Emit socket event to receiver
    const receiverRoom = `user:${receiverId}`;
    io.to(receiverRoom).emit(SOCKET_EVENTS.MESSAGE_RECEIVE, {
      _id: message._id,
      chatId: message.chatId,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      messageType: message.messageType,
      mediaUrl: message.mediaUrl,
      createdAt: message.createdAt,
      delivered: message.delivered,
      seen: message.seen,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page = 1 } = req.query;

    const result = await MessageService.getMessagesPaginated(chatId, parseInt(page));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    await MessageService.deleteMessage(id);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const editMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const message = await MessageService.editMessage(id, content);

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};
