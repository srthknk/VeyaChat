import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import MessageItem from '../components/MessageItem.jsx';
import MessageInput from '../components/MessageInput.jsx';
import ChatItem from '../components/ChatItem.jsx';
import { chatService, messageService } from '../services/index.js';
import { getSocket } from '../services/socket.js';
import { useChatStore } from '../store/index.js';
import { useAuth } from '../hooks/useAuth.js';
import { formatRelativeTime } from '../utils/helpers.js';
import Avatar from '../components/Avatar.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEllipsisVertical, faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { messages: storeMessages, drafts, typingUsers, chats, addMessage: addStoreMessage, upsertChat, setChats } = useChatStore();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [callNotice, setCallNotice] = useState('');

  // Get draft text for current chat
  const otherUser = chat?.participants.find((p) => p._id !== currentUser?._id);
  const otherDisplayName = [otherUser?.firstName, otherUser?.lastName].filter(Boolean).join(' ') || otherUser?.username;
  const draftText = otherUser ? (drafts[chatId]?.[otherUser._id] || '') : '';
  const isTyping = !!draftText || !!typingUsers[chatId]?.[otherUser?._id];

  useEffect(() => {
    if (chatId && currentUser) {
      loadChat();
      loadMessages();
    }
  }, [chatId, currentUser]);

  const loadChat = async () => {
    try {
      const response = await chatService.getChatById(chatId);
      const loadedChat = response.data.data.chat;
      setChat(loadedChat);
      upsertChat(loadedChat);
    } catch (error) {
      console.error('Failed to load chat:', error);
      navigate('/home');
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getMessages(chatId, 1);
      const msgs = response.data.data.messages || [];
      const currentMessages = useChatStore.getState().messages;
      const mergedMessages = [...currentMessages, ...msgs].reduce((unique, message) => {
        if (!unique.some((item) => item._id === message._id)) unique.push(message);
        return unique;
      }, []).sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt));
      useChatStore.setState({ messages: mergedMessages });
      markMessagesSeen(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesSeen = (messages) => {
    const socket = getSocket();
    if (!socket || !currentUser) return;

    const currentUserId = String(currentUser._id);
    messages
      .filter((message) => String(message.receiverId?._id || message.receiverId) === currentUserId && !message.seen)
      .forEach((message) => {
        const senderId = message.senderId?._id || message.senderId;
        socket.emit('messageSeen', {
          messageId: message._id,
          receiverId: senderId,
          chatId,
        });
      });

    useChatStore.setState((state) => ({
      messages: state.messages.map((message) => (
        String(message.receiverId?._id || message.receiverId) === currentUserId
          ? { ...message, seen: true }
          : message
      )),
    }));
    useChatStore.getState().updateChat(chatId, {
      lastMessageSeen: true,
      unreadCounts: {
        ...(useChatStore.getState().chats.find((item) => item._id === chatId)?.unreadCounts || {}),
        [currentUserId]: 0,
      },
    });
  };

  const handleSendMessage = async (message) => {
    if (!otherUser) return;

    const payload = typeof message === 'string'
      ? { content: message, messageType: 'text' }
      : message;

    try {
      const socket = getSocket();

      // Clear draft on receiver side
      socket?.emit('draftClear', {
        receiverId: otherUser._id,
        chatId,
      });

      const response = await messageService.sendMessage({
        receiverId: otherUser._id,
        content: payload.content,
        messageType: payload.messageType,
        mediaUrl: payload.mediaUrl || null,
      });

      // Add message to store
      addStoreMessage(response.data.data.message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleClearChat = async () => {
    await chatService.clearChat(chatId);
    useChatStore.setState({ messages: [] });
    setChatMenuOpen(false);
    setChat((current) => ({ ...current, lastMessage: null, lastMessageTime: null }));
  };

  const handleDeleteChat = async () => {
    await chatService.deleteChat(chatId);
    setChats(chats.filter((item) => item._id !== chatId));
    navigate('/home', { replace: true });
  };

  const showCallNotice = (type) => {
    setCallNotice(`${type} calling will be available soon.`);
    window.setTimeout(() => setCallNotice(''), 3500);
  };

  if (!chat) {
    return <div className="text-center p-4">Loading chat...</div>;
  }

  const sidebarChat = chats.find((item) => item._id === chatId) || chat;

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar className="hidden md:block">
          <div className="p-4">
            <h3 className="mb-3 text-xl font-bold text-textPrimary">Messages</h3>
            <ChatItem chat={sidebarChat} isActive={true} onClick={() => {}} />
          </div>
        </Sidebar>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Chat Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[#d1d7db] bg-white px-3 py-2.5 shadow-sm dark:border-[#374045] dark:bg-[#202c33] sm:px-5">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button type="button" onClick={() => navigate('/home')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-textSecondary hover:bg-gray-100 dark:hover:bg-[#2a3942] md:hidden" aria-label="Back to messages" title="Back to messages">
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <button type="button" onClick={() => navigate(`/user/${otherUser?._id}`)} className="flex min-w-0 items-center gap-3 text-left">
                <Avatar user={otherUser} size="md" />
                <span className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-textPrimary sm:text-lg">{otherDisplayName}</h2>
                  <p className="truncate text-xs text-textSecondary sm:text-sm">
                    {otherUser?.isOnline ? <span className="text-secondary">● Online</span> : <span>Last seen {formatRelativeTime(otherUser?.lastSeen)}</span>}
                  </p>
                </span>
              </button>
            </div>
            <div className="relative flex items-center gap-1 sm:gap-2">
              <button type="button" onClick={() => showCallNotice('Voice')} className="flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-[#e7fce3] dark:hover:bg-[#1f3b32]" aria-label="Start voice call" title="Voice call">
                <FontAwesomeIcon icon={faPhone} />
              </button>
              <button type="button" onClick={() => showCallNotice('Video')} className="flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-[#e7fce3] dark:hover:bg-[#1f3b32]" aria-label="Start video call" title="Video call">
                <FontAwesomeIcon icon={faVideo} />
              </button>
              <button type="button" onClick={() => setChatMenuOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-full text-textSecondary hover:bg-gray-100 dark:hover:bg-[#2a3942]" aria-label="Chat actions" title="Chat actions">
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </button>
              {callNotice && <p className="absolute right-0 top-12 z-20 whitespace-nowrap rounded-lg bg-[#202c33] px-3 py-2 text-xs text-white shadow-lg">{callNotice}</p>}
              {chatMenuOpen && (
                <div className="absolute right-0 top-12 z-30 w-44 rounded-xl border border-[#d1d7db] bg-white p-2 shadow-xl dark:border-[#374045] dark:bg-[#202c33]">
                  <button type="button" onClick={handleClearChat} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-textPrimary hover:bg-gray-100 dark:hover:bg-[#2a3942]">Clear chat</button>
                  <button type="button" onClick={handleDeleteChat} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-red-50 dark:hover:bg-[#3b2529]">Delete chat</button>
                </div>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="chat-messages min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 sm:p-5">
            {loading ? (
              <div className="text-center text-textSecondary">Loading messages...</div>
            ) : storeMessages.length === 0 ? (
              <div className="text-center text-textSecondary">No messages yet. Start chatting!</div>
            ) : (
              storeMessages.map((msg) => (
                <MessageItem
                  key={msg._id}
                  message={msg}
                  isOwn={msg.senderId._id === currentUser._id}
                />
              ))
            )}

            {/* Draft Preview */}
            {isTyping && draftText && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="text-sm p-4 bg-[#f0f2f5] border border-[#d1d7db] rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                  <span className="font-semibold text-primary">{otherUser?.username}</span>
                </div>
                <span className="text-gray-600 text-xs block mt-2">is typing:</span>
                {draftText ? (
                  <span className="font-mono text-gray-700 block mt-2 text-xs bg-white rounded px-2 py-1 border border-[#d1d7db]">{draftText}</span>
                ) : (
                  <span className="mt-2 flex h-5 items-center gap-1" aria-label="Typing">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                  </span>
                )}
              </motion.div>
            )}
          </div>

          {/* Message Input */}
          <div className="shrink-0">
            <MessageInput onSend={handleSendMessage} disabled={!chat} chatId={chatId} receiverId={otherUser?._id} />
          </div>
        </main>
      </div>
    </div>
  );
}
