import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar.jsx';

export default function ChatItem({ chat, isActive, onClick }) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const otherUser = chat.participants.find((p) => p._id !== currentUser?._id);
  const displayName = [otherUser?.firstName, otherUser?.lastName].filter(Boolean).join(' ') || `@${otherUser?.username || 'Unknown user'}`;
  const isLastMessageOwn = String(chat.lastMessageSenderId) === String(currentUser?._id);
  const unreadCount = Number(chat.unreadCounts?.[currentUser?._id] || 0);
  const preview = chat.lastMessageType === 'image' ? '📸 Photo' : chat.lastMessageType === 'video' ? '🎥 Video' : ['file', 'audio'].includes(chat.lastMessageType) ? '📄 Doc' : chat.lastMessage;

  const handleClick = () => {
    navigate(`/chat/${chat._id}`);
    onClick?.();
  };

  return (
    <motion.div
      whileHover={{ x: 5 }}
      onClick={handleClick}
      className={`p-3 border-b cursor-pointer transition ${
        isActive
          ? 'bg-primary bg-opacity-10 border-l-4 border-primary'
          : 'hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar user={otherUser} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-textPrimary truncate">{displayName}</h3>
          <p className="text-sm text-textSecondary line-clamp-2 whitespace-pre-line break-words">{preview || 'No messages yet'}</p>
          {chat.lastMessage && isLastMessageOwn && (
            <p className="text-xs text-primary mt-1">{chat.lastMessageSeen ? 'Seen' : 'Sent'}</p>
          )}
        </div>
        <div className="flex min-w-7 flex-col items-end gap-2">
          {!isLastMessageOwn && unreadCount > 0 && (
            <div className="flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-bold text-white" title={`${unreadCount} unread message${unreadCount === 1 ? '' : 's'}`}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
