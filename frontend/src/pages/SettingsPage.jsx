import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header.jsx';
import { chatService, userService } from '../services/index.js';
import { useAuth } from '../hooks/useAuth.js';
import { isStandalonePwa, requestNativeNotificationPermission } from '../services/notifications.js';
import Attribution from '../components/Attribution.jsx';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const isAdmin = user?.username?.toLowerCase() === 'sarthak' && (user.mobile || '').replace(/\D/g, '').replace(/^0+/, '') === '919322305058';
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [savedProfile, setSavedProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification === 'undefined' ? 'default' : Notification.permission
  );
  const [retentionHours, setRetentionHours] = useState(() => Number(localStorage.getItem('veyaRetentionHours') || 72));
  const [savedRetentionHours, setSavedRetentionHours] = useState(() => Number(localStorage.getItem('veyaRetentionHours') || 72));
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('incognitoSettings')) || {
        notifications: true,
        sounds: true,
        onlineStatus: true,
        discoverable: true,
      };
    } catch {
      return { notifications: true, sounds: true, onlineStatus: true, discoverable: true };
    }
  });
  const [savedSettings, setSavedSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('incognitoSettings')) || {
        notifications: true,
        sounds: true,
        onlineStatus: true,
        discoverable: true,
      };
    } catch {
      return { notifications: true, sounds: true, onlineStatus: true, discoverable: true };
    }
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const hasChanges = useMemo(() => (
    firstName !== savedProfile.firstName ||
    lastName !== savedProfile.lastName ||
    retentionHours !== savedRetentionHours ||
    JSON.stringify(settings) !== JSON.stringify(savedSettings)
  ), [firstName, lastName, retentionHours, savedProfile, savedRetentionHours, settings, savedSettings]);

  const updateSetting = (key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  const enableNativeNotifications = async () => {
    try {
      const granted = await requestNativeNotificationPermission();
      setNotificationPermission(granted ? 'granted' : (typeof Notification === 'undefined' ? 'denied' : Notification.permission));
    } catch (error) {
      console.error('Native notification permission request failed:', error);
    }
  };

  const saveSettings = async () => {
    if (!hasChanges || saving) return;

    try {
      setSaving(true);
      setSaveError('');
      const response = await userService.updateProfile({ firstName, lastName });
      setUser(response.data.data.user);
      localStorage.setItem('incognitoSettings', JSON.stringify(settings));
      localStorage.setItem('veyaRetentionHours', String(retentionHours));
      if (isAdmin && retentionHours !== savedRetentionHours) await chatService.updateRetention(retentionHours);
      setSavedProfile({ firstName, lastName });
      setSavedSettings(settings);
      setSavedRetentionHours(retentionHours);
    } catch (error) {
      console.error('Settings update failed:', error);
      setSaveError('Unable to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl p-4 sm:p-6"
      >
        <div className="rounded-lg bg-white p-5 shadow-lg sm:p-8">
          <h1 className="mb-6 text-2xl font-bold text-textPrimary sm:mb-8 sm:text-3xl">Settings</h1>

          <div className="mb-8 border-b pb-8">
            <h3 className="mb-2 text-lg font-semibold text-textPrimary">Personal details</h3>
            <p className="mb-4 text-sm text-textSecondary">Your username and phone number cannot be changed.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-textPrimary">First name<input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First Name" className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-primary" /></label>
              <label className="text-sm font-semibold text-textPrimary">Last name<input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Last Name" className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal focus:outline-none focus:ring-2 focus:ring-primary" /></label>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-textPrimary">Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" checked={settings.notifications} onChange={() => updateSetting('notifications')} className="rounded" />
                <span className="ml-3 text-textSecondary">Message notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={settings.sounds} onChange={() => updateSetting('sounds')} className="rounded" />
                <span className="ml-3 text-textSecondary">Sound notifications</span>
              </label>
              {isStandalonePwa() && notificationPermission !== 'granted' && (
                <button type="button" onClick={enableNativeNotifications} className="text-sm font-semibold text-primary hover:underline">
                  Enable Android notifications
                </button>
              )}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="mb-8 pb-8 border-b">
            <h3 className="text-lg font-semibold mb-4 text-textPrimary">Privacy</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" checked={settings.onlineStatus} onChange={() => updateSetting('onlineStatus')} className="rounded" />
                <span className="ml-3 text-textSecondary">Show online status</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={settings.discoverable} onChange={() => updateSetting('discoverable')} className="rounded" />
                <span className="ml-3 text-textSecondary">Allow others to find me</span>
              </label>
            </div>
          </div>

          {isAdmin && (
            <div className="mb-8 border-b pb-8">
              <h3 className="mb-2 text-lg font-semibold text-textPrimary">Message auto-delete</h3>
              <p className="mb-4 text-sm text-textSecondary">Choose how long messages remain in your chats.</p>
              <select value={retentionHours} onChange={(event) => setRetentionHours(Number(event.target.value))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary">
                <option value={0}>Never</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>72 hours</option>
              </select>
            </div>
          )}

          {/* App Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-textPrimary">About</h3>
            <div className="space-y-3 text-sm text-textSecondary">
              <p>Veya v1.0.0</p>
              <p>Private real-time messaging for modern conversations</p>
              <p>© 2026 Veya. All rights reserved.</p>
            </div>
          </div>

          {saveError && <p className="mt-6 text-sm text-danger">{saveError}</p>}
          <button onClick={saveSettings} disabled={!hasChanges || saving} className="mt-8 w-full rounded-lg bg-gray-200 py-2 font-bold text-textPrimary transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? 'Saving settings...' : 'Save Settings'}
          </button>
          <Attribution className="mt-6 text-center text-sm" />
        </div>
      </motion.div>
    </div>
  );
}
