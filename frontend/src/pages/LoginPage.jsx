import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth.js';
import { loginSchema } from '../utils/validation.js';
import { Link } from 'react-router-dom';
import VeyaLogo from '../components/VeyaLogo.jsx';
import { authService } from '../services/index.js';
import { useAuthStore } from '../store/index.js';
import GoogleAuthButton from '../components/GoogleAuthButton.jsx';
import Attribution from '../components/Attribution.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const { setUser, setToken } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const identifier = data.identifier.trim();
      await login(identifier.startsWith('+')
        ? { mobile: identifier, password: data.password }
        : { username: identifier.replace(/^@/, ''), password: data.password });
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGoogleLogin = useCallback(async (credential) => {
    try {
      const response = await authService.googleLogin(credential);
      setUser(response.data.data.user);
      setToken(response.data.data.token);
      navigate('/home');
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        navigate('/register/google', { state: { credential } });
        return;
      }
      console.error('Google login failed:', requestError);
    }
  }, [navigate, setToken, setUser]);

  return (
    <div className="min-h-[100dvh] bg-background lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <section className="hidden min-h-screen bg-[#111b21] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <VeyaLogo />
        <div className="max-w-lg">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-secondary">Private conversations</p>
          <h1 className="text-5xl font-bold leading-tight">A calmer way to stay connected.</h1>
          <p className="mt-5 text-lg text-[#b8c5cb]">Simple conversations, thoughtful privacy, and a space that feels like yours.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {['Fast messaging', 'Private profiles', 'Works everywhere'].map((feature) => <div key={feature} className="rounded-xl border border-[#374045] bg-[#202c33] p-4 text-sm font-semibold">{feature}</div>)}
          </div>
        </div>
        <Attribution className="text-sm text-[#8696a0]" />
      </section>
      <section className="flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-10 sm:py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-5 inline-flex items-center rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-textSecondary transition hover:border-primary hover:text-primary">
            Home
          </Link>
          <div className="mb-8 lg:hidden"><VeyaLogo /></div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-textPrimary sm:text-3xl">Sign in</h2>
            <p className="mt-2 text-textSecondary">Continue to your conversations.</p>
          </div>
          {error && <div className="mb-5 rounded-lg border border-danger bg-danger bg-opacity-10 p-3 text-sm text-danger">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-textPrimary">Username or phone number</label>
              <input {...register('identifier')} type="text" autoComplete="username" placeholder="Username or +919322305058" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
              {errors.identifier && <p className="mt-1 text-sm text-danger">{errors.identifier.message}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-textPrimary">Password</label>
              <input {...register('password')} type="password" placeholder="Enter password" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
              {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-primary py-3 font-bold text-white hover:bg-[#075e54] disabled:opacity-50">{isLoading ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <div className="my-5 flex items-center gap-3 text-xs text-textSecondary"><span className="h-px flex-1 bg-gray-300" />OR<span className="h-px flex-1 bg-gray-300" /></div>
          <GoogleAuthButton onCredential={handleGoogleLogin} />
          <p className="mt-7 text-center text-sm text-textSecondary">New to Veya? <Link to="/register" className="font-bold text-primary hover:underline">Create an account</Link></p>
          <Attribution className="mt-8 text-center text-sm lg:hidden" />
        </div>
      </section>
    </div>
  );
}
