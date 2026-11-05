// Auth Types
export interface User {
  _id: string;
  username: string;
  mobile: string;
  profilePicture?: string;
  bio: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

// Chat Types
export interface Chat {
  _id: string;
  participants: User[];
  lastMessage: string;
  lastMessageTime: string;
  createdAt: string;
  updatedAt: string;
}

// Message Types
export interface Message {
  _id: string;
  chatId: string;
  senderId: User;
  receiverId: User;
  messageType: 'text' | 'image' | 'file';
  content: string;
  mediaUrl?: string;
  delivered: boolean;
  seen: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<any>;
}

// Pagination Types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Draft Types
export interface DraftData {
  receiverId: string;
  chatId: string;
  text: string;
}
