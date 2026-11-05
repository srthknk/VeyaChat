import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Header from '../components/Header.jsx';
import { profileSchema } from '../utils/validation.js';
import { userService } from '../services/index.js';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import GoogleAuthButton from '../components/GoogleAuthButton.jsx';
import { authService } from '../services/index.js';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [googleMessage, setGoogleMessage] = useState('');
  const [googleEmail, setGoogleEmail] = useState(user?.googleEmail || '');
  const [deletionStep, setDeletionStep] = useState('idle');
  const [deletionCode, setDeletionCode] = useState('');
  const [deletionMessage, setDeletionMessage] = useState('');
  const [deletionMessageType, setDeletionMessageType] = useState('info');
  const [deletionBusy, setDeletionBusy] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await userService.updateProfile(data);
      setUser(response.data.data.user);
      reset({
        firstName: response.data.data.user.firstName || '',
        lastName: response.data.data.user.lastName || '',
        bio: response.data.data.user.bio || '',
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Profile images must be smaller than 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const image = new Image();
        image.src = reader.result;
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });
        const size = Math.min(image.naturalWidth, image.naturalHeight);
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;
        canvas.getContext('2d').drawImage(
          image,
          (image.naturalWidth - size) / 2,
          (image.naturalHeight - size) / 2,
          size,
          size,
          0,
          0,
          800,
          800
        );
        setAvatarLoading(true);
        const response = await userService.updateAvatar({ profilePicture: canvas.toDataURL('image/jpeg', 0.82) });
        setUser(response.data.data.user);
      } catch (error) {
        console.error('Avatar update failed:', error);
        alert('Failed to update profile photo');
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = async () => {
    try {
      setAvatarLoading(true);
      const response = await userService.updateAvatar({ profilePicture: null });
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Avatar removal failed:', error);
      alert('Failed to remove profile photo');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleGoogleLink = async (credential) => {
    try {
      const response = await authService.linkGoogleAccount(credential, googleEmail);
      setUser(response.data.data.user);
      setGoogleMessage('Google account linked successfully.');
    } catch (error) {
      console.error('Google account linking failed:', error);
      setGoogleMessage(error.response?.data?.message || 'Unable to link Google account.');
    }
  };

  const requestDeletionCode = async () => {
    if (!window.confirm('Are you sure? This permanently deletes your account, chats, messages, and profile data.')) return;
    try {
      setDeletionBusy(true);
      setDeletionMessage('');
      setDeletionMessageType('info');
      await userService.requestAccountDeletion();
      setDeletionStep('verify');
      setDeletionMessageType('success');
      setDeletionMessage('A 6-digit deletion code was sent to your linked Gmail address.');
    } catch (error) {
      console.error('Account deletion code request failed:', error);
      setDeletionMessageType('error');
      setDeletionMessage(error.response?.data?.message || 'Unable to send the deletion code.');
    } finally {
      setDeletionBusy(false);
    }
  };

  const confirmDeletion = async (event) => {
    event.preventDefault();
    try {
      setDeletionBusy(true);
      setDeletionMessage('');
      setDeletionMessageType('info');
      await userService.confirmAccountDeletion(deletionCode);
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Account deletion confirmation failed:', error);
      setDeletionMessageType('error');
      setDeletionMessage(error.response?.data?.message || 'Unable to delete the account.');
      setDeletionBusy(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl p-4 sm:p-8"
      >
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Account</p>
          <h1 className="mt-2 text-3xl font-bold text-textPrimary">Your profile</h1>
          <p className="mt-2 text-textSecondary">Manage your identity, photo, and personal details.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-2xl border border-[#d1d7db] bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <Avatar user={user} size="lg" className="h-28 w-28 text-4xl" />
              <h2 className="mt-4 text-xl font-bold text-textPrimary">@{user.username}</h2>
              <p className="mt-1 text-sm text-textSecondary">{user.mobile}</p>
              <div className="mt-6 flex w-full flex-col gap-2">
                <label className="cursor-pointer rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-[#e7fce3]">
                  {avatarLoading ? 'Uploading...' : 'Change profile photo'}
                  <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={avatarLoading} className="hidden" />
                </label>
                {user.profilePicture && <button type="button" onClick={removeAvatar} disabled={avatarLoading} className="rounded-lg px-4 py-2 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-50">Remove photo</button>}
              </div>
            </div>
            <div className="mt-8 border-t border-[#d1d7db] pt-5 text-sm">
              <div className="flex justify-between gap-4 py-2"><span className="text-textSecondary">Member since</span><span className="text-right text-textPrimary">{new Date(user.createdAt).toLocaleDateString()}</span></div>
              <div className="flex justify-between gap-4 py-2"><span className="text-textSecondary">Account ID</span><span className="max-w-[9rem] truncate text-right text-textPrimary">{user._id}</span></div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#d1d7db] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-textPrimary">Edit profile</h3>
            <p className="mt-1 text-sm text-textSecondary">Your username and phone number are permanent.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div><label className="mb-2 block text-sm font-semibold text-textPrimary">Username</label><input value={`@${user.username}`} readOnly className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-textSecondary" /></div>
              <div><label className="mb-2 block text-sm font-semibold text-textPrimary">Phone number</label><input value={user.mobile} readOnly className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-textSecondary" /></div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-semibold text-textPrimary">First name</label><input {...register('firstName')} placeholder="First Name" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />{errors.firstName && <p className="mt-1 text-sm text-danger">{errors.firstName.message}</p>}</div><div><label className="mb-2 block text-sm font-semibold text-textPrimary">Last name</label><input {...register('lastName')} placeholder="Last Name" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />{errors.lastName && <p className="mt-1 text-sm text-danger">{errors.lastName.message}</p>}</div></div>
              <div><label className="mb-2 block text-sm font-semibold text-textPrimary">Bio</label><textarea {...register('bio')} rows="3" placeholder="Tell people about yourself" maxLength={30} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" /><p className="mt-1 text-xs text-textSecondary">Letters, numbers, and spaces only. 30 characters maximum.</p>{errors.bio && <p className="mt-1 text-sm text-danger">{errors.bio.message}</p>}</div>
              <button type="submit" disabled={loading || !isDirty} className="w-full rounded-lg bg-primary py-3 font-bold text-white hover:bg-[#075e54] disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Saving changes...' : 'Save changes'}</button>
            </form>
            <div className="mt-8 border-t border-[#d1d7db] pt-5">
              <h3 className="text-lg font-bold text-textPrimary">Google sign-in</h3>
              <p className="mt-1 text-sm text-textSecondary">
                {user.googleEmail ? `Linked to ${user.googleEmail}` : 'Link a Gmail account to sign in with Google.'}
              </p>
              {!user.googleEmail && (
                <>
                  <label className="mt-4 block text-sm font-semibold text-textPrimary">
                    Gmail address
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(event) => setGoogleEmail(event.target.value)}
                      placeholder="yourname@gmail.com"
                      className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                  <div className="mt-4">
                    <GoogleAuthButton
                      onCredential={handleGoogleLink}
                      label="Link Google account"
                    />
                  </div>
                </>
              )}
              {googleMessage && <p className="mt-3 text-sm text-textSecondary">{googleMessage}</p>}
            </div>
            <div className="mt-8 border-t border-red-200 pt-5">
              <h3 className="text-lg font-bold text-danger">Delete account</h3>
              <p className="mt-1 text-sm text-textSecondary">Permanently remove your profile, chats, messages, and account data.</p>
              {deletionStep === 'idle' ? (
                <button type="button" onClick={requestDeletionCode} disabled={deletionBusy || !user.googleEmail} className="mt-4 rounded-lg border border-danger px-4 py-2 text-sm font-semibold text-danger hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                  {deletionBusy ? 'Sending code...' : 'Delete my account'}
                </button>
              ) : (
                <form onSubmit={confirmDeletion} className="mt-4 space-y-3">
                  <label className="block text-sm font-semibold text-textPrimary">
                    Enter the 6-digit code
                    <input value={deletionCode} onChange={(event) => setDeletionCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-textPrimary focus:outline-none focus:ring-2 focus:ring-danger" />
                  </label>
                  <button type="submit" disabled={deletionBusy || deletionCode.length !== 6} className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                    {deletionBusy ? 'Deleting account...' : 'Verify and delete permanently'}
                  </button>
                </form>
              )}
              {!user.googleEmail && <p className="mt-3 text-xs text-textSecondary">Link a Gmail account above before requesting a deletion code.</p>}
              {deletionMessage && (
                <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                  deletionMessageType === 'error'
                    ? 'bg-red-50 text-danger'
                    : deletionMessageType === 'success'
                      ? 'bg-green-50 text-[#087f23]'
                      : 'bg-gray-50 text-textSecondary'
                }`} role="status">
                  {deletionMessage}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="font-bold text-textPrimary">Session</h3>
            <p className="mt-1 text-sm text-textSecondary">Your account stays signed in on this device until you choose to log out.</p>
            <button type="button" onClick={handleLogout} className="mt-4 rounded-lg border border-danger px-5 py-2.5 font-semibold text-danger hover:bg-red-50">Log out of this device</button>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
