import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import AccountDeletionOtp from '../models/AccountDeletionOtp.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

const getMailer = () => {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  if (required.some((key) => !process.env[key])) {
    const error = new Error('Account deletion email service is not configured');
    error.statusCode = 503;
    throw error;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

const hashCode = (code) => crypto.createHash('sha256').update(code).digest('hex');
const OTP_REQUEST_INTERVAL_MS = 24 * 60 * 60 * 1000;
const logoPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../Assets/image-1793884564337.png'
);

const deleteCloudinaryAsset = async (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return;
  const uploadPath = url.split('/upload/')[1];
  if (!uploadPath) return;
  const parts = uploadPath.split('/');
  if (/^v\d+$/.test(parts[0])) parts.shift();
  const fileName = parts.pop();
  const publicId = [...parts, fileName.replace(/\.[^.]+$/, '')].join('/');
  const extension = fileName.split('.').pop()?.toLowerCase();
  const resourceType = ['mp4', 'webm', 'mov', 'avi'].includes(extension) ? 'video'
    : ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(extension) ? 'raw'
      : 'image';
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
};

export class AccountDeletionService {
  static async sendOtp(userId) {
    const user = await User.findById(userId).select('googleEmail');
    if (!user?.googleEmail) {
      const error = new Error('Link a Gmail account before deleting your account');
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();
    const code = crypto.randomInt(100000, 1000000).toString();
    const otpData = {
      codeHash: hashCode(code),
      expiresAt: new Date(now.getTime() + OTP_REQUEST_INTERVAL_MS),
      codeExpiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      sentAt: now,
      attempts: 0,
    };
    const cutoff = new Date(now.getTime() - OTP_REQUEST_INTERVAL_MS);
    try {
      const reservedOtp = await AccountDeletionOtp.findOneAndUpdate(
        { userId, $or: [{ sentAt: { $exists: false } }, { sentAt: { $lte: cutoff } }] },
        otpData,
        { upsert: true, new: true }
      );
      if (!reservedOtp) {
        const error = new Error('Deletion code limit reached. You can request another code tomorrow.');
        error.statusCode = 429;
        throw error;
      }
    } catch (error) {
      if (error.code === 11000) {
        const rateLimitError = new Error('Deletion code limit reached. You can request another code tomorrow.');
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }
      throw error;
    }

    await getMailer().sendMail({
      from: process.env.SMTP_FROM,
      to: user.googleEmail,
      subject: 'VeyaChat account deletion code',
      text: [
        `Your VeyaChat account deletion code is ${code}.`,
        'This code expires in 10 minutes.',
        'If you did not request account deletion, ignore this email and secure your account.',
        'Designed and developed by Sarthak Nitin Kulkarni.',
      ].join('\n\n'),
      html: `
        <!doctype html>
        <html>
          <body style="margin:0;background:#f4f1fb;font-family:Arial,Helvetica,sans-serif;color:#202124;">
            <div style="max-width:560px;margin:32px auto;padding:0 16px;">
              <div style="overflow:hidden;border:1px solid #e6e0f2;border-radius:18px;background:#ffffff;box-shadow:0 8px 30px rgba(37,20,78,.10);">
                <div style="padding:28px 24px;text-align:center;background:#100b1f;">
                  <img src="cid:veyachat-logo" alt="VeyaChat" width="92" height="92" style="display:block;width:92px;height:92px;margin:0 auto 16px;border-radius:20px;object-fit:cover;">
                  <div style="color:#ffffff;font-size:26px;font-weight:700;letter-spacing:.3px;">VeyaChat</div>
                  <div style="margin-top:7px;color:#cfc4e8;font-size:13px;">Private conversations, thoughtfully protected</div>
                </div>
                <div style="padding:32px 28px;">
                  <h1 style="margin:0;color:#231644;font-size:22px;">Account deletion verification</h1>
                  <p style="margin:16px 0 0;color:#5f6368;font-size:15px;line-height:1.6;">
                    We received a request to permanently delete your VeyaChat account and associated chats and media.
                  </p>
                  <div style="margin:26px 0;padding:20px;text-align:center;border:1px solid #e4d9ff;border-radius:14px;background:#faf8ff;">
                    <div style="color:#7a6a99;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Your verification code</div>
                    <div style="margin-top:10px;color:#5b2bbf;font-size:36px;font-weight:700;letter-spacing:9px;">${code}</div>
                  </div>
                  <p style="margin:0;color:#5f6368;font-size:14px;line-height:1.6;">
                    This code expires in <strong>10 minutes</strong>. VeyaChat will never ask you to share this code with anyone.
                  </p>
                  <div style="margin-top:24px;padding:14px 16px;border-left:4px solid #d93025;background:#fff5f5;color:#7a2020;font-size:13px;line-height:1.5;">
                    <strong>Security notice:</strong> If you did not request account deletion, ignore this email and review your account security immediately.
                  </div>
                </div>
                <div style="padding:20px 28px;border-top:1px solid #eee8f7;color:#7b7288;font-size:12px;line-height:1.6;text-align:center;">
                  <div>Designed and developed by <strong>Sarthak Nitin Kulkarni</strong></div>
                  <div style="margin-top:5px;">This is an automated security email. Please do not reply.</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      attachments: [{
        filename: 'veyachat-logo.png',
        path: logoPath,
        cid: 'veyachat-logo',
      }],
    });
  }

  static async verifyAndDelete(userId, code) {
    const otp = await AccountDeletionOtp.findOne({ userId });
    if (!otp || otp.codeExpiresAt <= new Date()) {
      const error = new Error('The deletion code is missing or expired');
      error.statusCode = 400;
      throw error;
    }
    if (otp.attempts >= 5) {
      const error = new Error('Too many incorrect deletion code attempts');
      error.statusCode = 429;
      throw error;
    }
    if (!/^\d{6}$/.test(code) || hashCode(code) !== otp.codeHash) {
      await AccountDeletionOtp.updateOne({ _id: otp._id }, { $inc: { attempts: 1 } });
      const error = new Error('Incorrect deletion code');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId).select('profilePicture');
    const chats = await Chat.find({ participants: userId }).select('_id');
    const chatIds = chats.map((chat) => chat._id);
    const messages = await Message.find({ $or: [{ senderId: userId }, { receiverId: userId }, { chatId: { $in: chatIds } }] }).select('mediaUrl');
    const mediaUrls = [user?.profilePicture, ...messages.map((message) => message.mediaUrl)].filter(Boolean);
    await Promise.all(mediaUrls.map(async (url) => {
      try {
        await deleteCloudinaryAsset(url);
      } catch (error) {
        console.error('Cloudinary asset deletion failed:', error);
      }
    }));
    await Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }, { chatId: { $in: chatIds } }] });
    await Chat.deleteMany({ participants: userId });
    await AccountDeletionOtp.deleteOne({ _id: otp._id });
    await User.deleteOne({ _id: userId });
  }
}
