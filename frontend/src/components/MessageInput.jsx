import { useState, useEffect } from 'react';
import { getSocket } from '../services/socket.js';
import { useDraft } from '../hooks/useDraft.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faFaceSmile, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export default function MessageInput({ onSend, disabled, chatId, receiverId }) {
  const [message, setMessage] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [gifUrl, setGifUrl] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);
  const emojis = ['😀', '😂', '😍', '😊', '😎', '🥳', '😭', '😡', '👍', '❤️', '🔥', '🎉', '🙏', '✨', '💯', '👋'];

  const handleDraftEvent = (event) => {
    const socket = getSocket();
    if (!socket || !receiverId || !chatId) return;

    switch (event.type) {
      case 'draftStart':
        socket.emit('draftStart', { receiverId, chatId });
        break;
      case 'draftUpdate':
        socket.emit('draftUpdate', { receiverId, chatId, text: event.text });
        break;
      case 'draftClear':
        socket.emit('draftClear', { receiverId, chatId });
        break;
      case 'draftStop':
        socket.emit('draftStop', { receiverId, chatId });
        break;
      default:
        break;
    }
  };

  const { handleDraftChange, clearDraftInput } = useDraft(handleDraftEvent);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      clearDraftInput();
      setMessage('');
    }
  };

  const handleSendGif = () => {
    const url = gifUrl.trim();
    if (!/^https?:\/\//i.test(url)) return;
    onSend({ content: url, messageType: 'gif', mediaUrl: url });
    setGifUrl('');
    setGifOpen(false);
  };

  const addEmoji = (emoji) => {
    const nextMessage = `${message}${emoji}`;
    setMessage(nextMessage);
    handleDraftChange(nextMessage);
    setEmojiOpen(false);
  };

  const compressImage = (file) => new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();
    reader.onload = () => { image.src = reader.result; };
    image.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    image.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleAttachment = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('Attachments must be 20 MB or smaller');
      return;
    }
    try {
      const isImage = file.type.startsWith('image/');
      const dataUrl = isImage ? await compressImage(file) : await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      onSend({ content: file.name, messageType: file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : isImage ? 'image' : 'file', mediaUrl: dataUrl });
      setAttachOpen(false);
    } catch (error) {
      console.error('Attachment preparation failed:', error);
      alert('Could not prepare this attachment');
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setMessage(text);
    handleDraftChange(text);
  };

  return (
    <div className="relative flex items-end gap-1.5 border-t border-[#d1d7db] bg-white p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] dark:border-[#374045] dark:bg-[#202c33] sm:gap-3 sm:p-4">
      {emojiOpen && (
        <div className="absolute bottom-20 right-16 z-20 grid grid-cols-8 gap-1 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-[#374045] dark:bg-[#202c33] sm:right-24">
          {emojis.map((emoji) => (
            <button key={emoji} type="button" onClick={() => addEmoji(emoji)} className="h-8 w-8 rounded text-lg hover:bg-gray-100 dark:hover:bg-[#2a3942]" aria-label={`Add ${emoji}`}>
              {emoji}
            </button>
          ))}
        </div>
      )}
      {attachOpen && (
        <div className="absolute bottom-20 left-3 z-20 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-[#374045] dark:bg-[#202c33]">
          <p className="mb-2 text-xs font-semibold text-textSecondary">Send attachment</p>
          <label className="block cursor-pointer rounded-lg px-3 py-2 text-sm text-textPrimary hover:bg-gray-100 dark:hover:bg-[#2a3942]">Photo<input type="file" accept="image/*" onChange={handleAttachment} className="hidden" /></label>
          <label className="block cursor-pointer rounded-lg px-3 py-2 text-sm text-textPrimary hover:bg-gray-100 dark:hover:bg-[#2a3942]">Video<input type="file" accept="video/*" onChange={handleAttachment} className="hidden" /></label>
          <label className="block cursor-pointer rounded-lg px-3 py-2 text-sm text-textPrimary hover:bg-gray-100 dark:hover:bg-[#2a3942]">PDF or file<input type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx" onChange={handleAttachment} className="hidden" /></label>
          <label className="block cursor-pointer rounded-lg px-3 py-2 text-sm text-textPrimary hover:bg-gray-100 dark:hover:bg-[#2a3942]">Audio<input type="file" accept="audio/*" onChange={handleAttachment} className="hidden" /></label>
          <p className="mt-2 text-xs text-textSecondary">Maximum 20 MB</p>
        </div>
      )}
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type a message..."
        disabled={disabled}
        className="min-w-0 flex-1 rounded-full border border-[#d1d7db] bg-[#f0f2f5] px-3 py-3 text-sm text-textPrimary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#374045] dark:bg-[#2a3942] sm:px-4"
      />
      <button type="button" onClick={() => { setAttachOpen(!attachOpen); setEmojiOpen(false); }} disabled={disabled} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base text-textSecondary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#2a3942] sm:h-11 sm:w-11 sm:text-lg" title="Attach" aria-label="Attach a photo, file, or audio">
        <FontAwesomeIcon icon={faPaperclip} />
      </button>
      <button type="button" onClick={() => { setEmojiOpen(!emojiOpen); setAttachOpen(false); }} disabled={disabled} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base text-textSecondary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#2a3942] sm:h-11 sm:w-11 sm:text-lg" title="Emoji" aria-label="Open emoji picker">
        <FontAwesomeIcon icon={faFaceSmile} />
      </button>
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-[#075e54] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-11"
        title="Send message"
        aria-label="Send message"
      >
        <FontAwesomeIcon icon={faPaperPlane} />
      </button>
    </div>
  );
}
