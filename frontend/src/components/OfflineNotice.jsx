import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowDown, faWifi } from '@fortawesome/free-solid-svg-icons';

export default function OfflineNotice() {
  const [offline, setOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="offline-notice" role="status">
      <FontAwesomeIcon icon={faCloudArrowDown} />
      <span>You are offline. Saved app pages remain available.</span>
      <FontAwesomeIcon icon={faWifi} className="opacity-60" />
    </div>
  );
}
