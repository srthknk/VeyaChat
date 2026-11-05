import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/index.js';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const { notifications, removeNotification } = useChatStore();

  useEffect(() => {
    const timers = notifications.map((notification) => (
      setTimeout(() => removeNotification(notification.id), notification.type === 'typing' ? 3500 : 5000)
    ));

    return () => timers.forEach(clearTimeout);
  }, [notifications, removeNotification]);

  return (
    <div className="fixed top-20 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] space-y-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {notifications.map((notification) => (
          <motion.button
            key={notification.id}
            type="button"
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (notification.chatId) navigate(`/chat/${notification.chatId}`);
              removeNotification(notification.id);
            }}
            className="pointer-events-auto block w-full rounded-xl border border-[#d1d7db] bg-white p-3 text-left shadow-lg"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-primary">
              <span className={`h-2 w-2 rounded-full ${notification.type === 'typing' ? 'bg-secondary animate-pulse' : 'bg-primary'}`} />
              {notification.title}
            </span>
            <span className="mt-1 block line-clamp-2 whitespace-pre-line break-words text-sm text-textSecondary">
              {notification.text}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
