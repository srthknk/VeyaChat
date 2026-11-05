import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(40).regex(/^[a-zA-Z ]+$/, 'Use letters only'),
  lastName: z.string().min(1, 'Last name is required').max(40).regex(/^[a-zA-Z ]+$/, 'Use letters only'),
  username: z
    .string()
    .min(4, 'Username must be at least 4 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  mobile: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format. Use E.164 format (e.g., +1234567890)'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  bio: z
    .string()
    .max(30, 'Bio must be at most 30 characters')
    .regex(/^[a-zA-Z0-9 ]*$/, 'Bio can only contain letters, numbers, and spaces')
    .optional(),
});

export const googleRegisterSchema = registerSchema.omit({ password: true });

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your username or phone number'),
  password: z.string().nonempty('Password is required'),
});

export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message is too long'),
});

export const profileSchema = z.object({
  firstName: z.string().max(40).regex(/^[a-zA-Z ]*$/, 'Use letters only').optional(),
  lastName: z.string().max(40).regex(/^[a-zA-Z ]*$/, 'Use letters only').optional(),
  bio: z
    .string()
    .max(30, 'Bio must be at most 30 characters')
    .regex(/^[a-zA-Z0-9 ]*$/, 'Bio can only contain letters, numbers, and spaces')
    .optional(),
});
