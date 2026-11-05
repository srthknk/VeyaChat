import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'audio', 'gif'],
      default: 'text',
    },
    content: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Message', messageSchema);
