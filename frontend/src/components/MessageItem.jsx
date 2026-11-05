import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '../utils/helpers.js';
import Avatar from './Avatar.jsx';

export default function MessageItem({ message, isOwn }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const mediaUrl = message.mediaUrl || message.content;
  const shareMedia = async () => {
    if (navigator.share) await navigator.share({ title: 'Veya attachment', url: mediaUrl });
    else await navigator.clipboard.writeText(mediaUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {!isOwn && <Avatar user={message.senderId} size="sm" className="mr-2 self-end mb-1" />}
      <div
        className={`max-w-[85%] px-3 py-2 rounded-2xl sm:max-w-md sm:px-4 ${
          isOwn
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-white text-textPrimary rounded-bl-none shadow-sm'
        }`}
      >
        {message.messageType === 'gif' ? (
          <img src={message.mediaUrl || message.content} alt="GIF" className="max-w-full rounded-lg" loading="lazy" />
        ) : message.messageType === 'image' ? (
          <button type="button" onClick={() => setViewerOpen(true)} className="block"><img src={message.mediaUrl} alt={message.content || 'Image'} className="max-w-full cursor-zoom-in rounded-lg" loading="lazy" /></button>
        ) : message.messageType === 'video' ? (
          <button type="button" onClick={() => setViewerOpen(true)} className="block"><video src={message.mediaUrl} className="max-w-full cursor-zoom-in rounded-lg" muted /></button>
        ) : message.messageType === 'audio' ? (
          <audio controls src={message.mediaUrl} className="max-w-full" />
        ) : message.messageType === 'file' ? (
          <a href={message.mediaUrl} target="_blank" rel="noreferrer" className="text-sm underline">{message.content || 'Download file'}</a>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}
        <p className={`mt-1 text-xs ${isOwn ? 'text-green-100' : 'text-textSecondary'}`}>
          {formatTime(message.createdAt)}
          {isOwn && (message.pending ? ' · Sending' : message.seen ? ' ✓✓' : message.delivered ? ' ✓' : '')}
        </p>
      </div>
      {viewerOpen && (message.messageType === 'image' || message.messageType === 'video') && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4" onClick={() => setViewerOpen(false)}>
          <div className="relative max-h-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            {message.messageType === 'image' ? <img src={mediaUrl} alt="Full-size attachment" className="max-h-[80vh] max-w-full object-contain" /> : <video src={mediaUrl} controls autoPlay className="max-h-[80vh] max-w-full" />}
            <div className="mt-4 flex justify-center gap-3">
              <button type="button" onClick={shareMedia} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900">Share</button>
              <a href={mediaUrl} download target="_blank" rel="noreferrer" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Download</a>
              <button type="button" onClick={() => setViewerOpen(false)} className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white">Close</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
