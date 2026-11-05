import { body, validationResult } from 'express-validator';
import { BIO_MAX_LENGTH, PHONE_E164_REGEX, USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../config/constants.js';

export const validateRegister = [
  body('firstName').trim().notEmpty().isLength({ max: 40 }).matches(/^[a-zA-Z ]+$/).withMessage('First name must contain letters only'),
  body('lastName').trim().notEmpty().isLength({ max: 40 }).matches(/^[a-zA-Z ]+$/).withMessage('Last name must contain letters only'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: USERNAME_MIN_LENGTH, max: USERNAME_MAX_LENGTH })
    .withMessage(`Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters`)
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(PHONE_E164_REGEX)
    .withMessage('Mobile number must be in E.164 format (e.g., +1234567890)'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: BIO_MAX_LENGTH })
    .withMessage(`Bio must not exceed ${BIO_MAX_LENGTH} characters`)
    .matches(/^[a-zA-Z0-9 ]*$/)
    .withMessage('Bio can only contain letters, numbers, and spaces'),
];

export const validateLogin = [
  body('username')
    .optional()
    .trim(),
  body('mobile')
    .optional()
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body().custom((value, { req }) => {
    if (!req.body.username && !req.body.mobile) {
      throw new Error('Either username or mobile number is required');
    }
    return true;
  }),
];

export const validateUpdateProfile = [
  body('firstName').optional().trim().isLength({ max: 40 }).matches(/^[a-zA-Z ]*$/).withMessage('First name must contain letters only'),
  body('lastName').optional().trim().isLength({ max: 40 }).matches(/^[a-zA-Z ]*$/).withMessage('Last name must contain letters only'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: BIO_MAX_LENGTH })
    .withMessage(`Bio must not exceed ${BIO_MAX_LENGTH} characters`)
    .matches(/^[a-zA-Z0-9 ]*$/)
    .withMessage('Bio can only contain letters, numbers, and spaces'),
];

export const validateUserSearch = [
  body('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),
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
