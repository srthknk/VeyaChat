import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { googleRegisterSchema } from '../utils/validation.js';
import { authService, userService } from '../services/index.js';
import { useAuthStore } from '../store/index.js';
import VeyaLogo from '../components/VeyaLogo.jsx';

export default function GoogleRegisterPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const credential = state?.credential;
  const { setUser, setToken } = useAuthStore();
  const [error, setError] = useState('');
  const [usernameValue, setUsernameValue] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(googleRegisterSchema),
  });

  const checkUsername = async (value) => {
    const username = value.trim().toLowerCase();
    setUsernameValue(value);
    if (username.length < 4 || !/^[a-z0-9_]+$/.test(username)) {
      setUsernameStatus(null);
      return;
    }
    try {
      const response = await userService.checkUsernameAvailability(username);
      setUsernameStatus(response.data.data.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('error');
    }
  };

  const onSubmit = async (data) => {
    if (!credential) {
      setError('Google registration expired. Please start again.');
      return;
    }
    try {
      setError('');
      const response = await authService.googleRegister({ ...data, credential });
      setUser(response.data.data.user);
      setToken(response.data.data.token);
      navigate('/home');
    } catch (requestError) {
      console.error('Google registration failed:', requestError);
      setError(requestError.response?.data?.message || 'Unable to create your account.');
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-md">
        <VeyaLogo />
        <div className="mt-8 mb-6">
          <h1 className="text-3xl font-bold text-textPrimary">Finish your Google sign-up</h1>
          <p className="mt-2 text-textSecondary">Choose your Veya username and add your phone number.</p>
        </div>
        {error && <div className="mb-5 rounded-lg border border-danger bg-danger bg-opacity-10 p-3 text-sm text-danger">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-2 block text-sm font-semibold text-textPrimary">First name</label><input {...register('firstName')} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3" />{errors.firstName && <p className="mt-1 text-sm text-danger">{errors.firstName.message}</p>}</div>
            <div><label className="mb-2 block text-sm font-semibold text-textPrimary">Last name</label><input {...register('lastName')} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3" />{errors.lastName && <p className="mt-1 text-sm text-danger">{errors.lastName.message}</p>}</div>
          </div>
          <div><label className="mb-2 block text-sm font-semibold text-textPrimary">Username</label><input {...register('username', { onChange: (event) => checkUsername(event.target.value) })} placeholder="Choose a unique username" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3" />{errors.username && <p className="mt-1 text-sm text-danger">{errors.username.message}</p>}{!errors.username && usernameValue && usernameStatus === 'available' && <p className="mt-1 text-sm text-green-600">Username is available</p>}{usernameStatus === 'taken' && <p className="mt-1 text-sm text-danger">Username is already taken</p>}</div>
          <div><label className="mb-2 block text-sm font-semibold text-textPrimary">Mobile number</label><input {...register('mobile')} type="tel" placeholder="+919322305058" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3" />{errors.mobile && <p className="mt-1 text-sm text-danger">{errors.mobile.message}</p>}</div>
          <div><label className="mb-2 block text-sm font-semibold text-textPrimary">Bio <span className="font-normal text-textSecondary">(optional)</span></label><textarea {...register('bio')} maxLength={30} rows="2" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3" />{errors.bio && <p className="mt-1 text-sm text-danger">{errors.bio.message}</p>}</div>
          <button type="submit" disabled={isSubmitting || usernameStatus === 'taken'} className="w-full rounded-lg bg-primary py-3 font-bold text-white disabled:opacity-50">{isSubmitting ? 'Creating account...' : 'Create account with Google'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-textSecondary"><Link to="/login" className="font-bold text-primary hover:underline">Back to sign in</Link></p>
      </div>
    </div>
  );
}
