import express from 'express';
import { sendMessage, getMessages, deleteMessage, editMessage } from '../controllers/messageController.js';
import { validateSendMessage, handleValidationErrors } from '../validators/messageValidator.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:chatId', verifyToken, getMessages);
router.post('/send', verifyToken, validateSendMessage, handleValidationErrors, sendMessage);
router.delete('/:id', verifyToken, deleteMessage);
router.patch('/:id', verifyToken, editMessage);

export default router;
