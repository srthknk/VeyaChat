import express from 'express';
import { register, login, logout, getMe, googleLogin, linkGoogleAccount, googleRegister } from '../controllers/authController.js';
import { validateRegister, validateLogin, handleValidationErrors } from '../validators/authValidator.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/google', googleLogin);
router.post('/google/link', verifyToken, linkGoogleAccount);
router.post('/google/register', googleRegister);
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getMe);

export default router;
