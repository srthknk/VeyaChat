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

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { isAuthenticated, token } = useAuth();
  const { user, setUser } = useAuthStore();
  useSocket(token, user);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', localStorage.getItem('incognitoTheme') === 'dark');
  }, []);

  // Restore user from token on app load
  useEffect(() => {
    if (token && !user) {
      authService
        .getMe()
        .then((response) => {
          setUser(response.data.data.user);
        })
        .catch((error) => {
          console.error('Failed to restore user:', error);
          // Only clear persisted auth when the server confirms the token is invalid.
          if (error.response?.status === 401) {
            useAuthStore.getState().setToken(null);
            useAuthStore.getState().setUser(null);
          }
        });
    }
  }, [token]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:chatId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/:userId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
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
