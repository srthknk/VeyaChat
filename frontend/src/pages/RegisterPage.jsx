import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth.js';
import { registerSchema } from '../utils/validation.js';
import { userService } from '../services/index.js';
import VeyaLogo from '../components/VeyaLogo.jsx';
import GoogleAuthButton from '../components/GoogleAuthButton.jsx';
import Attribution from '../components/Attribution.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: authRegister, isLoading, error } = useAuth();
  const [usernameValue, setUsernameValue] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    const username = usernameValue.trim().toLowerCase();
    if (username.length < 4 || !/^[a-z0-9_]+$/.test(username)) {
      setUsernameStatus(null);
      return undefined;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const response = await userService.checkUsernameAvailability(username);
        if (active) setUsernameStatus(response.data.data.available ? 'available' : 'taken');
      } catch {
        if (active) setUsernameStatus('error');
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [usernameValue]);

  const onSubmit = async (data) => {
    try {
      await authRegister(data);
      navigate('/home');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const startGoogleRegistration = (credential) => {
    navigate('/register/google', { state: { credential } });
  };

  return (
    <div className="min-h-[100dvh] bg-background lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <section className="hidden min-h-screen bg-[#111b21] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <VeyaLogo />
        <div className="max-w-lg">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-secondary">Your space, your identity</p>
          <h1 className="text-5xl font-bold leading-tight">Meet people without the noise.</h1>
          <p className="mt-5 text-lg text-[#b8c5cb]">Create a profile that feels personal and keep every conversation close.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {['Unique identity', 'Private profiles', 'Simple by design'].map((feature) => <div key={feature} className="rounded-xl border border-[#374045] bg-[#202c33] p-4 text-sm font-semibold">{feature}</div>)}
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
          <div className="mb-6"><h2 className="text-2xl font-bold text-textPrimary sm:text-3xl">Create your account</h2><p className="mt-2 text-textSecondary">A few details and you are ready to chat.</p></div>
          {error && <div className="mb-5 rounded-lg border border-danger bg-danger bg-opacity-10 p-3 text-sm text-danger">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-2 block text-sm font-semibold text-textPrimary">First name</label><input {...register('firstName')} type="text" placeholder="First Name" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />{errors.firstName && <p className="mt-1 text-sm text-danger">{errors.firstName.message}</p>}</div>
              <div><label className="mb-2 block text-sm font-semibold text-textPrimary">Last name</label><input {...register('lastName')} type="text" placeholder="Last Name" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />{errors.lastName && <p className="mt-1 text-sm text-danger">{errors.lastName.message}</p>}</div>
            </div>
            <div><label className="mb-2 block text-sm font-semibold text-textPrimary">Username</label><input {...register('username', { onChange: (event) => setUsernameValue(event.target.value) })} type="text" placeholder="Choose a unique username" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />{errors.username && <p className="mt-1 text-sm text-danger">{errors.username.message}</p>}{!errors.username && usernameStatus === 'available' && <p className="mt-1 text-sm text-green-600">Username is available</p>}{!errors.username && usernameStatus === 'taken' && <p className="mt-1 text-sm text-danger">Username is already taken</p>}</div>
            <div><label className="mb-2 block text-sm font-semibold text-textPrimary">Mobile number</label><input {...register('mobile')} type="tel" placeholder="+919322305058" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />{errors.mobile && <p className="mt-1 text-sm text-danger">{errors.mobile.message}</p>}</div>
            <div><label className="mb-2 block text-sm font-semibold text-textPrimary">Password</label><input {...register('password')} type="password" placeholder="Create a strong password" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />{errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}</div>
            <div><label className="mb-2 block text-sm font-semibold text-textPrimary">Bio <span className="font-normal text-textSecondary">(optional)</span></label><textarea {...register('bio')} placeholder="30 characters maximum" maxLength={30} rows="2" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />{errors.bio && <p className="mt-1 text-sm text-danger">{errors.bio.message}</p>}</div>
            <button type="submit" disabled={isLoading || usernameStatus === 'taken'} className="w-full rounded-lg bg-primary py-3 font-bold text-white hover:bg-[#075e54] disabled:opacity-50">{isLoading ? 'Creating account...' : 'Create account'}</button>
          </form>
          <div className="my-5 flex items-center gap-3 text-xs text-textSecondary"><span className="h-px flex-1 bg-gray-300" />OR<span className="h-px flex-1 bg-gray-300" /></div>
          <GoogleAuthButton onCredential={startGoogleRegistration} label="Sign up with Google" />
          <p className="mt-7 text-center text-sm text-textSecondary">Already have an account? <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link></p>
          <Attribution className="mt-8 text-center text-sm lg:hidden" />
        </div>
      </section>
    </div>
  );
}
