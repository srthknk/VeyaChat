import { body, validationResult } from 'express-validator';

export const validateSendMessage = [
  body('receiverId')
    .trim()
    .notEmpty()
    .withMessage('Receiver ID is required')
    .isMongoId()
    .withMessage('Invalid receiver ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 5000 })
    .withMessage('Message must not exceed 5000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'video', 'file', 'audio', 'gif'])
    .withMessage('Invalid message type'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};
