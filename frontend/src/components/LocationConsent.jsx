import { useEffect, useRef, useState } from 'react';
import { userService } from '../services/index.js';

const LOCATION_ENABLED_KEY = 'veyaLocationSharingEnabled';

export default function LocationConsent({ user }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt');
  const retryTimerRef = useRef(null);

  useEffect(() => {
    let permission;
    let active = true;

    const updatePermission = (state) => {
      if (!active) return;
      setPermissionState(state);
      setOpen(state !== 'granted' && localStorage.getItem(LOCATION_ENABLED_KEY) !== 'true');
    };

    if (!user || localStorage.getItem(LOCATION_ENABLED_KEY) === 'true' || !navigator.geolocation) {
      setOpen(false);
      return undefined;
    }

    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        permission = result;
        const handlePermissionChange = () => updatePermission(result.state);
        permission.handlePermissionChange = handlePermissionChange;
        updatePermission(result.state);
        result.addEventListener('change', handlePermissionChange);
      }).catch(() => updatePermission('prompt'));
    } else {
      updatePermission('prompt');
    }

    return () => {
      active = false;
      if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
      if (permission?.handlePermissionChange) {
        permission.removeEventListener('change', permission.handlePermissionChange);
      }
    };
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
          setPermissionState('granted');
        } catch (error) {
          console.error('Initial location update failed:', error);
        } finally {
          setBusy(false);
          setOpen(false);
        }
      },
      (error) => {
        console.error('Location permission denied:', error);
        setPermissionState(error.code === 1 ? 'denied' : 'prompt');
        setBusy(false);
        setOpen(true);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const declineLocation = () => {
    setOpen(false);
    retryTimerRef.current = window.setTimeout(() => {
      if (localStorage.getItem(LOCATION_ENABLED_KEY) !== 'true') setOpen(true);
    }, 30000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <section role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-textPrimary">Share your location?</h2>
        <p className="mt-3 text-sm leading-6 text-textSecondary">
          Veya can share your precise location with the authorized Veya administrator. It updates about once per hour while this app is active. Location permission is required for this feature.
        </p>
        {permissionState === 'denied' && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            Location is blocked in your browser settings. Allow location for Veya in the site or app permissions, then tap “Try again”.
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={declineLocation} disabled={busy} className="rounded-lg px-4 py-2 text-sm font-semibold text-textSecondary hover:bg-gray-100 dark:hover:bg-gray-800">Not now</button>
          <button type="button" onClick={enableLocation} disabled={busy || !navigator.geolocation} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? 'Requesting permission...' : permissionState === 'denied' ? 'Try again' : 'Allow location'}
          </button>
        </div>
      </section>
    </div>
  );
}
