import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock, faMoon, faShieldHalved, faSun, faTrashCan, faUserShield } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/veya-brand-icon.png';
import Attribution from '../components/Attribution.jsx';

const sections = [
  {
    icon: faLock,
    title: 'Message encryption',
    text: 'Text messages are encrypted on the server with AES-256-GCM before they are stored. Encryption keys are kept in the backend environment and are never exposed to the browser.',
  },
  {
    icon: faShieldHalved,
    title: 'Secure account access',
    text: 'Passwords are stored as one-way hashes. Sessions use signed authentication tokens, and Google sign-in is accepted only after the identity token is verified by the backend.',
  },
  {
    icon: faUserShield,
    title: 'What your profile contains',
    text: 'Your account may contain your username, name, phone number, optional bio, profile image, and linked Google account details. Your Gmail address is not editable after it is linked.',
  },
  {
    icon: faTrashCan,
    title: 'Your control and deletion',
    text: 'You can manage your profile and request account deletion from Profile settings. Deletion requires a time-limited email verification code and removes your account, chats, messages, profile data, and identifiable media.',
  },
];

export default function PrivacyPage() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('incognitoTheme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('incognitoTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <main className="min-h-[100dvh] bg-background px-4 py-4 text-textPrimary transition-colors duration-500 sm:px-8 sm:py-8">
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="Back to Veya home">
          <img src={logo} alt="Veya" className="h-10 w-10 rounded-xl border border-black/70 object-cover shadow-md" />
          <span className="text-xl font-bold">Veya</span>
        </Link>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setDarkMode((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d1d7db] text-textSecondary hover:bg-gray-100 dark:border-[#374045] dark:hover:bg-[#2a3942]" aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={darkMode ? 'Light mode' : 'Dark mode'}>
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
          </button>
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d1d7db] text-textPrimary hover:bg-gray-100 dark:border-[#374045] dark:hover:bg-[#2a3942] sm:h-auto sm:w-auto sm:gap-2 sm:px-3 sm:py-2" aria-label="Back to home">
            <FontAwesomeIcon icon={faArrowLeft} />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl pb-10 pt-10 sm:pb-12 sm:pt-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6d42da]">Veya privacy</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-6xl">Your conversations are yours.</h1>
          <p className="mt-5 text-base leading-7 text-textSecondary sm:text-lg">
            Veya is built to keep private conversations focused, secure, and under your control. This page explains the protections used by the app.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-[#d1d7db] bg-white p-5 shadow-sm dark:border-[#374045] dark:bg-[#202c33] sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7655dd]/15 text-lg text-[#7145dc]">
                <FontAwesomeIcon icon={section.icon} />
              </div>
              <h2 className="mt-5 text-xl font-bold text-textPrimary">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-textSecondary">{section.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-[#d1d7db] bg-white p-6 dark:border-[#374045] dark:bg-[#202c33]">
          <h2 className="text-xl font-bold text-textPrimary">Data sharing</h2>
          <p className="mt-2 text-sm leading-6 text-textSecondary">
            Veya does not sell your personal conversations. The service uses necessary infrastructure providers for database hosting, media storage, email delivery, and authentication. These services receive only the information needed to provide the requested feature.
          </p>
        </div>

        <footer className="mt-10 border-t border-[#d1d7db] pt-5 dark:border-[#374045]">
          <Attribution className="text-sm" />
        </footer>
      </section>
    </main>
  );
}
