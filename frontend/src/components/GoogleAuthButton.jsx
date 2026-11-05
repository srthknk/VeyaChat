import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

export default function GoogleAuthButton({ onCredential, label = 'Continue with Google' }) {
  const containerRef = useRef(null);
  const [unavailable, setUnavailable] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      setUnavailable(true);
      return undefined;
    }

    const renderButton = () => {
      if (!window.google?.accounts?.id || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(response.credential),
      });
      containerRef.current.replaceChildren();
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        width: Math.min(containerRef.current.clientWidth || 360, 400),
        text: label === 'Link Google account' ? 'continue_with' : 'signin_with',
      });
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener('load', renderButton);
      renderButton();
      return () => existingScript.removeEventListener('load', renderButton);
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    script.onerror = () => setUnavailable(true);
    document.head.appendChild(script);
    return () => script.removeEventListener('load', renderButton);
  }, [clientId, label, onCredential]);

  if (unavailable) {
    return <p className="text-center text-sm text-danger">Google authentication is not configured.</p>;
  }

  return <div ref={containerRef} className="flex min-h-10 justify-center" />;
}
