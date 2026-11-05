import { useCallback } from 'react';
import { useAuthStore } from '../store/index.js';
import { authService } from '../services/index.js';

export const useAuth = () => {
  const { user, token, isLoading, error, setUser, setToken, setLoading, setError, logout } = useAuthStore();

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      const { user, token } = response.data.data;
      setUser(user);
      setToken(token);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      const { user, token } = response.data.data;
      setUser(user);
      setToken(token);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      logout();
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return {
    user,
    token,
    setUser,
    isLoading,
    error,
    register,
    login,
    logout: handleLogout,
    isAuthenticated: !!token,
  };
};
