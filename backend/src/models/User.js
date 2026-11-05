import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import { BIO_MAX_LENGTH } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 4,
      maxlength: 20,
      match: /^[a-zA-Z0-9_]+$/,
      lowercase: true,
    },
    usernameLower: {
      type: String,
      unique: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    googleEmail: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      default: null,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: 40,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 40,
      default: '',
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: BIO_MAX_LENGTH,
      default: '',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    socketId: {
      type: String,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      address: String,
      updatedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Set usernameLower
  this.usernameLower = this.username.toLowerCase();
  
  // Only hash password if it's new or modified
  if (!this.isModified('passwordHash')) return next();

  try {
    // Hash the password with 10 rounds
    this.passwordHash = await bcryptjs.hash(this.passwordHash, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcryptjs.compare(plainPassword, this.passwordHash);
};

// Remove passwordHash from JSON response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export default mongoose.model('User', userSchema);
