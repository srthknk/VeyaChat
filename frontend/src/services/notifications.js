export const isStandalonePwa = () => (
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.navigator.standalone === true
);

const notificationsEnabled = () => {
  try {
    const settings = JSON.parse(localStorage.getItem('incognitoSettings') || '{}');
    return settings.notifications !== false;
  } catch {
    return true;
  }
};

export const requestNativeNotificationPermission = async () => {
  if (!isStandalonePwa() || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showNativeNotification = async ({ title, text, chatId, tag }) => {
  if (!isStandalonePwa() || !notificationsEnabled() || !('Notification' in window)) return false;

  const hasPermission = await requestNativeNotificationPermission();
  if (!hasPermission || !('serviceWorker' in navigator)) return false;

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    body: text,
    icon: '/veya-logo.png',
    badge: '/icon-192.svg',
    tag,
    renotify: false,
    data: { chatId },
  });
  return true;
};
