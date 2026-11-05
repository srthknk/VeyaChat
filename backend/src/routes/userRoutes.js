import express from 'express';
import { searchUsers, checkUsernameAvailability, getUserById, updateProfile, updateAvatar, updateLocation, requestAccountDeletion, confirmAccountDeletion } from '../controllers/userController.js';
import { validateUpdateProfile, handleValidationErrors } from '../validators/authValidator.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/username-availability', checkUsernameAvailability);
router.post('/search', verifyToken, searchUsers);
router.get('/:id', verifyToken, getUserById);
router.patch('/profile', verifyToken, validateUpdateProfile, handleValidationErrors, updateProfile);
router.patch('/avatar', verifyToken, updateAvatar);
router.patch('/location', verifyToken, updateLocation);
router.post('/account-deletion/request', verifyToken, requestAccountDeletion);
router.post('/account-deletion/confirm', verifyToken, confirmAccountDeletion);

export default router;
