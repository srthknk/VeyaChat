import { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ChatItem from '../components/ChatItem.jsx';
import { chatService } from '../services/index.js';
import { useChatStore } from '../store/index.js';
import messageHero from '../assets/veya-message-hero.jpeg';

export default function HomePage() {
  const { chats, setChats } = useChatStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await chatService.getChats();
      setChats(response.data.data.chats || []);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-textPrimary">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-5 pb-3 pt-5">
              <div>
                <h1 className="text-2xl font-bold text-textPrimary">Messages</h1>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <p className="px-5 py-8 text-center text-sm text-textSecondary">Loading your chats...</p>
              ) : chats.length === 0 ? (
                <div className="mx-4 rounded-2xl border border-dashed border-[#d1d7db] p-5 text-center dark:border-[#374045]">
                  <p className="font-semibold text-textPrimary">No chats yet</p>
                  <p className="mt-1 text-sm leading-6 text-textSecondary">Search for a username above to start a conversation.</p>
                </div>
              ) : (
                chats.map((chat) => <ChatItem key={chat._id} chat={chat} onClick={() => {}} />)
              )}
            </div>
            <div className="border-t border-[#d1d7db] px-5 py-4 text-xs leading-5 text-textSecondary dark:border-[#374045]">
              Your messages are private and secured with end-to-end encryption.
            </div>
          </div>
        </Sidebar>

        <main className="relative hidden min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#f7f9fa] dark:bg-[#111b21] md:flex">
          <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(#d5dadd_0.8px,transparent_0.8px)] [background-size:18px_18px] dark:opacity-20 dark:[background-image:radial-gradient(#52616a_0.8px,transparent_0.8px)]" />
          <div className="relative z-10 mx-6 flex max-w-lg flex-col items-center text-center">
            <div className="mb-7 overflow-hidden rounded-[2rem] shadow-[0_20px_55px_rgba(74,54,170,0.2)] ring-8 ring-white/70 dark:ring-[#202c33]">
              <img src={messageHero} alt="Two VeyaChat message bubbles" className="h-auto w-[min(31rem,58vw)] object-cover" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-textPrimary sm:text-4xl">VeyaChat for everyone</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-textSecondary sm:text-base">
              Send and receive messages privately, simply, and securely. Choose a chat from the list or search for someone new.
            </p>
            <div className="mt-7 flex items-center gap-2 text-xs text-textSecondary">
              <span aria-hidden="true">🔒</span>
              <span>Your personal messages are end-to-end encrypted</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
