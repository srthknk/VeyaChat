import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Avatar from '../components/Avatar.jsx';
import { userService } from '../services/index.js';

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    userService.getById(userId)
      .then((response) => {
        if (active) setUser(response.data.data.user);
      })
      .catch((requestError) => {
        console.error('Failed to load user profile:', requestError);
        if (active) setError('Unable to load this profile.');
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl p-4 sm:p-8">
        <button type="button" onClick={() => navigate(-1)} className="mb-6 rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-gray-100 dark:hover:bg-gray-800">
          ← Back
        </button>
        {error ? (
          <section className="rounded-2xl border border-[#d1d7db] bg-surface p-8 text-center shadow-sm">
            <p className="text-danger">{error}</p>
          </section>
        ) : !user ? (
          <p className="text-center text-textSecondary">Loading profile...</p>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-[#d1d7db] bg-surface shadow-sm">
            <div className="bg-primary px-6 py-10 sm:px-10">
              <div className="flex flex-col items-center text-center">
                <Avatar user={user} size="lg" className="h-28 w-28 border-4 border-white text-4xl shadow-lg" />
                <h1 className="mt-4 text-2xl font-bold text-white">{displayName}</h1>
                <p className="mt-1 text-sm text-green-100">@{user.username}</p>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
              <div className="profile-detail-card rounded-xl bg-[#f7f9fa] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">Username</p>
                <p className="mt-2 break-all text-textPrimary">@{user.username}</p>
              </div>
              <div className="profile-detail-card rounded-xl bg-[#f7f9fa] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">Phone number</p>
                <p className="mt-2 break-all text-textPrimary">{user.mobile || 'Not available'}</p>
              </div>
              <div className="profile-detail-card rounded-xl bg-[#f7f9fa] p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">About</p>
                <p className="mt-2 break-words text-textPrimary">{user.bio || 'Available to chat'}</p>
              </div>
              <div className="profile-detail-card rounded-xl bg-[#f7f9fa] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">First name</p>
                <p className="mt-2 text-textPrimary">{user.firstName || 'Not provided'}</p>
              </div>
              <div className="profile-detail-card rounded-xl bg-[#f7f9fa] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">Last name</p>
                <p className="mt-2 text-textPrimary">{user.lastName || 'Not provided'}</p>
              </div>
              {user.location && (
                <div className="profile-detail-card rounded-xl bg-[#f7f9fa] p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">Shared location</p>
                  <p className="mt-2 break-words text-textPrimary">
                    {user.location.address || 'Address unavailable'}
                  </p>
                  <p className="mt-2 break-words text-sm text-textSecondary">
                    {user.location.latitude.toFixed(6)}, {user.location.longitude.toFixed(6)}
                  </p>
                  <p className="mt-1 text-xs text-textSecondary">
                    Accuracy: approximately {Math.round(user.location.accuracy)}m · Updated {new Date(user.location.updatedAt).toLocaleString()}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${user.location.latitude},${user.location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                  >
                    Open in Maps
                  </a>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
