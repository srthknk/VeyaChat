import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Attribution from '../components/Attribution.jsx';
import {
  faBolt,
  faLock,
  faMoon,
  faSun,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/veya-brand-icon.png';
import darkBackground from '../assets/chat-dark.jpeg';
import lightBackground from '../assets/chat-light.jpeg';

const features = [
  {
    icon: faLock,
    title: 'Privacy First',
    description: 'Your chats stay between you and your people.',
  },
  {
    icon: faBolt,
    title: 'Real-Time',
    description: 'Send and receive messages instantly, without delays.',
  },
  {
    icon: faWandMagicSparkles,
    title: 'Simple & Clean',
    description: 'A minimal, focused experience for better conversations.',
  },
];

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('incognitoTheme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('incognitoTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <main
      key={darkMode ? 'dark' : 'light'}
      className={`landing-page min-h-screen overflow-hidden px-5 py-5 transition-colors duration-700 sm:px-8 lg:px-14 ${
        darkMode ? 'landing-dark text-white' : 'landing-light text-[#11152d]'
      }`}
      style={{ '--landing-background': `url(${darkMode ? darkBackground : lightBackground})` }}
    >
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3" aria-label="Veya home">
          <img src={logo} alt="Veya" className="h-9 w-9 rounded-xl border border-black/70 object-cover shadow-lg sm:h-10 sm:w-10" />
          <span className="text-lg font-bold tracking-tight sm:text-xl">Veya</span>
        </Link>
        <nav className="flex items-center gap-1.5 text-sm font-medium sm:gap-3 lg:gap-8">
          <a href="#features" className="hidden transition-opacity hover:opacity-70 sm:inline">Features</a>
          <Link to="/privacy" className="hidden transition-opacity hover:opacity-70 sm:inline">Privacy</Link>
          <a href="#download" className="hidden transition-opacity hover:opacity-70 sm:inline">Download</a>
          <button
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/70 bg-white/10 transition duration-300 hover:-translate-y-0.5 hover:bg-white/20 sm:h-10 sm:w-10"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
          </button>
          <Link to="/login" className="rounded-xl border border-black px-3 py-2 text-xs transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 sm:px-4 sm:py-2.5 sm:text-sm">Login</Link>
          <Link to="/register" className="rounded-xl border border-black bg-[#5b35c9] px-3 py-2 text-xs text-white shadow-lg shadow-[#5b35c9]/20 transition duration-300 hover:-translate-y-0.5 hover:bg-[#6e48df] sm:px-4 sm:py-2.5 sm:text-sm">Register</Link>
        </nav>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center pb-12 pt-8 text-center sm:pb-14 sm:pt-14 lg:pt-16"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#7655dd]/40 bg-[#7655dd]/10 px-4 py-2 text-sm font-semibold text-[#a88cff]">
          <FontAwesomeIcon icon={faBolt} />
          <span>Realtime Chat</span>
        </div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-6xl font-extrabold tracking-[-0.06em] sm:text-7xl lg:text-8xl">
          Veya
        </motion.h1>
        <h2 className="mt-4 max-w-4xl text-2xl font-bold leading-tight text-[#6d42da] sm:text-4xl lg:text-5xl">
          Private, real-time conversations
        </h2>
        <p className="mt-5 max-w-2xl text-sm opacity-75 sm:text-lg">
          Find people by username, share your profile, and keep conversations close.
        </p>
      </motion.section>

      <motion.section
        id="features"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 mx-auto grid max-w-6xl gap-5 pb-8 md:grid-cols-3"
      >
        {features.map((feature) => (
          <motion.article key={feature.title} whileHover={{ y: -5 }} transition={{ duration: 0.2 }} className="landing-feature rounded-2xl border border-current/10 p-6 shadow-xl backdrop-blur-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#7655dd]/20 text-xl text-[#7145dc]">
              <FontAwesomeIcon icon={feature.icon} />
            </div>
            <h3 className="text-xl font-bold">{feature.title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-6 opacity-75">{feature.description}</p>
          </motion.article>
        ))}
      </motion.section>

      <p className="relative z-10 mx-auto max-w-6xl pb-3 text-center text-xs opacity-60">
        <FontAwesomeIcon icon={faLock} className="mr-2" />
        Private conversations, designed for you.
      </p>
      <Attribution className="relative z-10 mx-auto pb-2 text-center text-base sm:text-lg" />
      <span id="download" className="sr-only">Install VeyaChat from your browser to use it as a PWA.</span>
    </main>
  );
}
