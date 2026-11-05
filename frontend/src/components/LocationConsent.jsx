import { useEffect, useState } from 'react';
import { userService } from '../services/index.js';

const LOCATION_ENABLED_KEY = 'veyaLocationSharingEnabled';
const LOCATION_PROMPTED_KEY = 'veyaLocationPrompted';

export default function LocationConsent({ user }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && !localStorage.getItem(LOCATION_PROMPTED_KEY)) setOpen(true);
  }, [user]);

  useEffect(() => {
    if (!user || localStorage.getItem(LOCATION_ENABLED_KEY) !== 'true' || !navigator.geolocation) return undefined;

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          userService.updateLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
          }).catch((error) => console.error('Location update failed:', error));
        },
        (error) => console.error('Location access failed:', error),
        { enableHighAccuracy: true, maximumAge: 15 * 60 * 1000, timeout: 15000 }
      );
    };

    sendLocation();
    const interval = window.setInterval(sendLocation, 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [user]);

  const enableLocation = () => {
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await userService.updateLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
          });
          localStorage.setItem(LOCATION_ENABLED_KEY, 'true');
        } catch (error) {
          console.error('Initial location update failed:', error);
        } finally {
          localStorage.setItem(LOCATION_PROMPTED_KEY, 'true');
          setBusy(false);
          setOpen(false);
        }
      },
      (error) => {
        console.error('Location permission denied:', error);
        localStorage.setItem(LOCATION_PROMPTED_KEY, 'true');
        setBusy(false);
        setOpen(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const declineLocation = () => {
    localStorage.setItem(LOCATION_PROMPTED_KEY, 'true');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <section role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-textPrimary">Share your location?</h2>
        <p className="mt-3 text-sm leading-6 text-textSecondary">
          Veya can share your precise location with the authorized Veya administrator. It updates about once per hour while this app is active. You can deny browser permission before sharing.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={declineLocation} disabled={busy} className="rounded-lg px-4 py-2 text-sm font-semibold text-textSecondary hover:bg-gray-100 dark:hover:bg-gray-800">Not now</button>
          <button type="button" onClick={enableLocation} disabled={busy || !navigator.geolocation} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? 'Requesting permission...' : 'Allow location'}
          </button>
        </div>
      </section>
    </div>
  );
}
