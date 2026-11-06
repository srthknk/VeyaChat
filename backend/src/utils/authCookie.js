const COOKIE_NAME = 'veya_session';
const SESSION_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

const serializeCookie = (value, maxAge = SESSION_MAX_AGE) => {
  const secure = process.env.NODE_ENV === 'production';
  const sameSite = secure ? 'None' : 'Lax';
  return [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${Math.floor(maxAge / 1000)}`,
    'HttpOnly',
    `SameSite=${sameSite}`,
    secure ? 'Secure' : '',
  ].filter(Boolean).join('; ');
};

export const setAuthCookie = (res, token) => {
  res.setHeader('Set-Cookie', serializeCookie(token));
};

export const clearAuthCookie = (res) => {
  res.setHeader('Set-Cookie', serializeCookie('', 0));
};

export const getAuthCookie = (req) => {
  const cookies = req.headers.cookie?.split(';') || [];
  const sessionCookie = cookies.find((cookie) => cookie.trim().startsWith(`${COOKIE_NAME}=`));
  return sessionCookie ? decodeURIComponent(sessionCookie.trim().slice(COOKIE_NAME.length + 1)) : null;
};
