import { create } from 'zustand';
import { clearPersistedToken } from '../services/authStorage.js';

const readStoredValue = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Unable to read persistent auth storage for ${key}:`, error);
    return null;
  }
};

const writeStoredValue = (key, value) => {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    console.error(`Unable to write persistent auth storage for ${key}:`, error);
  }
};

export const useAuthStore = create((set) => ({
  user: (() => {
    try {
      const stored = readStoredValue('user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Unable to restore the persisted user:', error);
      return null;
    }
  })(),
  token: null,
  authReady: false,
  isLoading: false,
  error: null,

  setUser: (user) => {
    writeStoredValue('user', user ? JSON.stringify(user) : null);
    set({ user });
  },
  setToken: (token) => {
    if (!token) {
      writeStoredValue('token', null);
      clearPersistedToken().catch((error) => {
        console.warn('Unable to clear the legacy Veya session cache:', error);
      });
    }
    set({ token });
  },
  setAuthReady: (authReady) => set({ authReady }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => {
    writeStoredValue('user', null);
    clearPersistedToken().catch((error) => {
      console.error('Unable to clear the Veya session:', error);
    });
    set({ user: null, token: null });
  },
}));

export const useChatStore = create((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  messagesPagination: null,
  drafts: {}, // { chatId: { senderId: text } }
  typingUsers: {}, // { chatId: { senderId: true/false } }
  notifications: [],

  setChats: (chats) => set({ chats }),
  upsertChat: (chat) => {
    set((state) => ({
      chats: state.chats.some((item) => item._id === chat._id)
        ? state.chats.map((item) => item._id === chat._id ? { ...item, ...chat } : item)
        : [chat, ...state.chats],
    }));
  },
  updateChat: (chatId, updates) => {
    set((state) => ({
      chats: state.chats.map((chat) => chat._id === chatId ? { ...chat, ...updates } : chat),
    }));
  },
  removeChat: (chatId) => set((state) => ({ chats: state.chats.filter((chat) => chat._id !== chatId) })),
  clearChatMessages: () => set({ messages: [] }),
  setCurrentChat: (chat) => set({ currentChat: chat }),
  setMessages: (messages) => set({ messages }),
  setMessagesPagination: (pagination) => set({ messagesPagination: pagination }),

  upsertNotification: (notification) => {
    set((state) => ({
      notifications: [
        ...state.notifications.filter((item) => item.id !== notification.id),
        { ...notification, createdAt: Date.now() },
      ].slice(-5),
    }));
  },

  removeNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.filter((item) => item.id !== notificationId),
    }));
  },

  addMessage: (message) => {
    set((state) => {
      if (state.messages.some((item) => item._id === message._id)) return state;
      return { messages: [...state.messages, message] };
    });
  },

  updateMessage: (messageId, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, ...updates } : msg
      ),
    }));
  },

  deleteMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== messageId),
    }));
  },

  setDraft: (chatId, senderId, text) => {
    set((state) => ({
      drafts: {
        ...state.drafts,
        [chatId]: {
          ...state.drafts[chatId],
          [senderId]: text,
        },
      },
    }));
  },

  clearDraft: (chatId, senderId) => {
    set((state) => {
      const newDrafts = { ...state.drafts };
      if (newDrafts[chatId]) {
        delete newDrafts[chatId][senderId];
      }
      return { drafts: newDrafts };
    });
  },

  setTypingUser: (chatId, senderId, isTyping) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: {
          ...state.typingUsers[chatId],
          [senderId]: isTyping,
        },
      },
    }));
  },
}));

export const useUserStore = create((set) => ({
  onlineUsers: new Set(),
  userLastSeen: {}, // { userId: lastSeenDate }

  addOnlineUser: (userId) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.add(userId);
      return { onlineUsers: newSet };
    });
  },

  removeOnlineUser: (userId) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(userId);
      return { onlineUsers: newSet };
    });
  },

  setLastSeen: (userId, lastSeenDate) => {
    set((state) => ({
      userLastSeen: {
        ...state.userLastSeen,
        [userId]: lastSeenDate,
      },
    }));
  },
}));
