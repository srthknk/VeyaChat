import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      default: null,
    },
    lastMessageTime: {
      type: Date,
      default: null,
    },
    lastMessageSenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lastMessageSeen: {
      type: Boolean,
      default: false,
    },
    lastMessageType: {
      type: String,
      default: 'text',
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    retentionHours: {
      type: Number,
      enum: [0, 24, 48, 72],
      default: 72,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding chats by participants
chatSchema.index({ participants: 1 });

// Ensure participants array has exactly 2 users
chatSchema.pre('save', function (next) {
  if (this.participants.length !== 2) {
    return next(new Error('Chat must have exactly 2 participants'));
  }
  next();
});

export default mongoose.model('Chat', chatSchema);
