const DATABASE_NAME = 'veya-auth';
const STORE_NAME = 'session';
const TOKEN_KEY = 'veya-token';

const openDatabase = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, 1);
  request.onupgradeneeded = () => {
    request.result.createObjectStore(STORE_NAME);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('Unable to open auth storage'));
});

export const readPersistedToken = async () => {
  if (!('indexedDB' in window)) return null;
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(TOKEN_KEY);
    request.onsuccess = () => {
      database.close();
      resolve(typeof request.result === 'string' ? request.result : null);
    };
    request.onerror = () => {
      database.close();
      reject(request.error || new Error('Unable to read auth storage'));
    };
  });
};

export const persistToken = async (token) => {
  if (!('indexedDB' in window)) return;
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(token, TOKEN_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('Unable to persist auth storage'));
    };
  });
};

export const clearPersistedToken = async () => {
  if (!('indexedDB' in window)) return;
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(TOKEN_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('Unable to clear auth storage'));
    };
  });
};
