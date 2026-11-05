import express from 'express';
import { getChats, createChat, getChatById, clearChat, deleteChat, updateRetention } from '../controllers/chatController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getChats);
router.post('/create', verifyToken, createChat);
router.patch('/retention', verifyToken, updateRetention);
router.post('/:chatId/clear', verifyToken, clearChat);
router.delete('/:chatId', verifyToken, deleteChat);
router.get('/:chatId', verifyToken, getChatById);

export default router;
