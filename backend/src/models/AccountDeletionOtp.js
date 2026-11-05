import mongoose from 'mongoose';

const accountDeletionOtpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    codeExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    sentAt: {
      type: Date,
      required: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('AccountDeletionOtp', accountDeletionOtpSchema);
