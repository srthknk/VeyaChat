import 'dotenv/config';
import crypto from 'crypto';
import { deflateRawSync, inflateRawSync } from 'zlib';

const algorithm = 'aes-256-gcm';
const key = crypto.createHash('sha256').update(process.env.MESSAGE_ENCRYPTION_KEY || process.env.JWT_SECRET || 'veya-development-key').digest();

export const encryptMessage = (value = '') => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const compressed = deflateRawSync(Buffer.from(value, 'utf8'));
  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
};

export const decryptMessage = (value = '') => {
  if (!value.startsWith('v1:')) return value;
  try {
    const [, ivText, tagText, encryptedText] = value.split(':');
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivText, 'base64'));
    decipher.setAuthTag(Buffer.from(tagText, 'base64'));
    const compressed = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64')), decipher.final()]);
    return inflateRawSync(compressed).toString('utf8');
  } catch {
    return '[Encrypted message unavailable]';
  }
};
