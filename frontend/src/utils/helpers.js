import { formatDistanceToNow } from 'date-fns';

export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const formatRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const isOnlineNow = (isOnline) => {
  return isOnline ? 'Online' : 'Offline';
};

export const truncateText = (text, length = 50) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};
