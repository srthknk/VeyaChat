import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import Avatar from './Avatar.jsx';
import VeyaLogo from './VeyaLogo.jsx';
import { useChatStore } from '../store/index.js';
import { chatService, userService } from '../services/index.js';

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { upsertChat } = useChatStore();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('incognitoTheme') === 'dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const showHomeBackButton = location.pathname.startsWith('/chat/')
    || location.pathname === '/profile'
    || location.pathname === '/settings'
    || location.pathname.startsWith('/user/');

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return undefined;
    }
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const response = await userService.search(query);
        if (active) setSearchResults(response.data.data.users || []);
      } catch {
        if (active) setSearchResults([]);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('incognitoTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="shrink-0 border-b border-[#d1d7db] bg-white px-2 py-2 shadow-sm sm:px-4 sm:py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Link to="/home" className="min-w-0"><VeyaLogo compact /></Link>
        </div>

        <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 pl-2 sm:gap-3 sm:pl-4">
          {user && (
            <>
              {showHomeBackButton && (
                <button type="button" onClick={() => navigate('/home')} className="flex h-10 shrink-0 items-center gap-1 rounded-full px-2 text-sm font-semibold text-primary hover:bg-gray-100 dark:hover:bg-gray-800 sm:px-3" aria-label="Back to home" title="Back to home">
                  <span className="text-xl leading-none">←</span>
                  <span className="hidden sm:inline">Home</span>
                </button>
              )}
              <div className="relative min-w-0 max-w-xl flex-1" ref={searchRef}>
                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search username" className="w-full rounded-full border border-[#d1d7db] bg-[#f0f2f5] px-3 py-2.5 text-xs text-textPrimary outline-none transition-[background-color,border-color,box-shadow] duration-300 placeholder:text-textSecondary focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(18,140,126,0.12)] sm:px-4 sm:text-sm" />
                {searchQuery && (
                  <div className="absolute left-0 top-12 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#d1d7db] bg-white p-3 shadow-xl">
                    <div className="mt-2 max-h-64 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button key={result._id} type="button" onClick={async () => { const response = await chatService.createChat(result._id); upsertChat(response.data.data.chat); setSearchQuery(''); navigate(`/chat/${response.data.data.chat._id}`); }} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-gray-100">
                          <Avatar user={result} size="sm" />
                          <span><strong className="block text-sm text-textPrimary">@{result.username}</strong><small className="text-textSecondary">{result.bio || 'Available to chat'}</small></span>
                        </button>
                      ))}
                      {searchQuery && searchResults.length === 0 && <p className="p-2 text-sm text-textSecondary">No users found</p>}
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                className="h-10 w-10 shrink-0 rounded-full border border-[#d1d7db] text-lg hover:bg-gray-100"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? '☀' : '☾'}
              </button>
              <div className="relative" ref={menuRef}>
                <button type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Open account menu" title="Account menu">
                  <Avatar user={user} size="sm" className="ring-2 ring-transparent hover:ring-secondary" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 z-40 w-52 rounded-xl border border-[#d1d7db] bg-white shadow-xl p-2">
                    <div className="px-3 py-2 border-b border-[#d1d7db]">
                      <p className="text-sm font-semibold text-textPrimary">@{user.username}</p>
                      <p className="text-xs text-textSecondary">Your account</p>
                    </div>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 mt-1 text-sm text-textPrimary hover:bg-gray-100">Profile</Link>
                    <Link to="/settings" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-textPrimary hover:bg-gray-100">Settings</Link>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
