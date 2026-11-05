import 'dotenv/config';

// Username Validation
export const USERNAME_MIN_LENGTH = 4;
export const USERNAME_MAX_LENGTH = 20;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
export const BIO_MAX_LENGTH = 30;

// Password Validation
export const PASSWORD_MIN_LENGTH = 8;

// Phone Number Format
export const PHONE_E164_REGEX = /^\+[1-9]\d{1,14}$/;

// File Upload
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const ALLOWED_FILE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];

// Pagination
export const MESSAGES_PER_PAGE = 50;

// Draft Preview
export const DRAFT_DEBOUNCE_MS = 300;
export const MAX_DRAFT_LENGTH = 500;

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Presence
  USER_ONLINE: 'userOnline',
  ONLINE_USERS: 'onlineUsers',
  USER_OFFLINE: 'userOffline',
  LAST_SEEN_UPDATE: 'lastSeenUpdate',
  
  // Draft Preview
  DRAFT_START: 'draftStart',
  DRAFT_UPDATE: 'draftUpdate',
  DRAFT_CLEAR: 'draftClear',
  DRAFT_STOP: 'draftStop',
  
  // Messaging
  MESSAGE_SEND: 'messageSend',
  MESSAGE_SENT: 'messageSent',
  MESSAGE_RECEIVE: 'messageReceive',
  MESSAGE_DELIVERED: 'messageDelivered',
  MESSAGE_SEEN: 'messageSeen',
  CHAT_SEEN: 'chatSeen',
  CHAT_CLEARED: 'chatCleared',
  CHAT_DELETED: 'chatDeleted',
  MESSAGE_DELETE: 'messageDelete',
  MESSAGE_EDIT: 'messageEdit',
};

// JWT
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '365d';
