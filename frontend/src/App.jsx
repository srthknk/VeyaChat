import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth.js';
import { useSocket } from './hooks/useSocket.js';
import { authService } from './services/index.js';
import { useAuthStore } from './store/index.js';
import './index.css';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import NotificationCenter from './components/NotificationCenter.jsx';
import LocationConsent from './components/LocationConsent.jsx';
import GoogleRegisterPage from './pages/GoogleRegisterPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import OfflineNotice from './components/OfflineNotice.jsx';

const queryClient = new QueryClient();

// Protected Route Component
const AuthLoadingScreen = () => (
  <div className="flex min-h-[100dvh] items-center justify-center bg-background px-6 text-center">
    <div>
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      <p className="text-sm text-textSecondary">Restoring your Veya session...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, isAuthenticated, authReady }) => {
  if (!authReady) return <AuthLoadingScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { isAuthenticated, token } = useAuth();
  const { user, setUser, authReady, setAuthReady } = useAuthStore();
  useSocket(token, user);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', localStorage.getItem('incognitoTheme') === 'dark');
  }, []);

  useEffect(() => {
    let active = true;
    if (!token) {
      setAuthReady(true);
      return () => {
        active = false;
      };
    }

    authService
      .getMe()
      .then((response) => {
        if (active) setUser(response.data.data.user);
      })
      .catch((error) => {
        console.error('Failed to restore user:', error);
        if (active && error.response?.status === 401) {
          useAuthStore.getState().logout();
        }
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });

    return () => {
      active = false;
    };
  }, [token, setUser, setAuthReady]);

  if (!authReady) {
    return <AuthLoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <OfflineNotice />
        <NotificationCenter />
        <LocationConsent user={user} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/google" element={<GoogleRegisterPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} authReady={authReady}>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:chatId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} authReady={authReady}>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} authReady={authReady}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} authReady={authReady}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/:userId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} authReady={authReady}>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
