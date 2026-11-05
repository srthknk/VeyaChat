import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository.js';
import { JWT_EXPIRE } from '../config/constants.js';
import axios from 'axios';
import crypto from 'node:crypto';
import bcryptjs from 'bcryptjs';

export class AuthService {
  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
  }

  static async register(username, mobile, password, firstName, lastName, bio = '', profilePicture = null) {
    // Check if user already exists
    const existingUser = await UserRepository.findByUsername(username);
    if (existingUser) {
      const error = new Error('Username already exists');
      error.statusCode = 409;
      throw error;
    }

    const existingMobile = await UserRepository.findByMobile(mobile);
    if (existingMobile) {
      const error = new Error('Mobile number already exists');
      error.statusCode = 409;
      throw error;
    }

    // Create new user
    const user = await UserRepository.create({
      username,
      mobile,
      passwordHash: password,
      firstName,
      lastName,
      bio,
      profilePicture,
    });

    const token = this.generateToken(user._id);
    return { user, token };
  }

  static async login(usernameOrMobile, password) {
    // Find user by username or mobile
    let user;
    if (usernameOrMobile.startsWith('+')) {
      user = await UserRepository.getWithPasswordHashByMobile(usernameOrMobile);
    } else {
      user = await UserRepository.getWithPasswordHash(usernameOrMobile);
    }

    if (!user) {
      console.error(`[LOGIN] User not found: ${usernameOrMobile}`);
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.error(`[LOGIN] Password mismatch for user: ${usernameOrMobile}`);
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    console.log(`[LOGIN] Successful login for user: ${usernameOrMobile}`);
    const token = this.generateToken(user._id);
    return { user, token };
  }

  static async verifyGoogleCredential(credential) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      const error = new Error('Google authentication is not configured');
      error.statusCode = 503;
      throw error;
    }

    const response = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
      params: { id_token: credential },
      timeout: 10000,
    });
    const claims = response.data;
    if (
      claims.aud !== process.env.GOOGLE_CLIENT_ID ||
      claims.email_verified !== 'true' ||
      !claims.sub ||
      !claims.email ||
      !claims.email.toLowerCase().endsWith('@gmail.com')
    ) {
      const error = new Error('Invalid Google account');
      error.statusCode = 401;
      throw error;
    }
    return claims;
  }

  static async loginWithGoogle(credential) {
    const claims = await this.verifyGoogleCredential(credential);
    const user = await UserRepository.findByGoogleId(claims.sub);
    if (!user) {
      const error = new Error('Link your Google account from Profile before using Google login');
      error.statusCode = 409;
      throw error;
    }
    return { user, token: this.generateToken(user._id) };
  }

  static async linkGoogleAccount(userId, credential, expectedEmail) {
    const claims = await this.verifyGoogleCredential(credential);
    if (!expectedEmail || claims.email.toLowerCase() !== expectedEmail.trim().toLowerCase()) {
      const error = new Error('The Google account email must match the Gmail entered in Profile settings');
      error.statusCode = 400;
      throw error;
    }
    const linkedUser = await UserRepository.findByGoogleId(claims.sub);
    if (linkedUser && String(linkedUser._id) !== String(userId)) {
      const error = new Error('This Google account is already linked to another Veya account');
      error.statusCode = 409;
      throw error;
    }
    const user = await UserRepository.update(userId, {
      googleId: claims.sub,
      googleEmail: claims.email.toLowerCase(),
    });
    return user;
  }

  static async registerWithGoogle(credential, profile) {
    const claims = await this.verifyGoogleCredential(credential);
    if (
      !profile?.username ||
      !profile?.mobile ||
      !profile?.firstName ||
      !profile?.lastName ||
      !/^[a-zA-Z0-9_]{4,20}$/.test(profile.username) ||
      !/^\+[1-9]\d{1,14}$/.test(profile.mobile)
    ) {
      const error = new Error('Valid username, name, and E.164 mobile number are required');
      error.statusCode = 400;
      throw error;
    }
    if (await UserRepository.findByGoogleId(claims.sub)) {
      const error = new Error('This Google account is already registered');
      error.statusCode = 409;
      throw error;
    }
    if (await UserRepository.findByUsername(profile.username)) {
      const error = new Error('Username already exists');
      error.statusCode = 409;
      throw error;
    }
    if (await UserRepository.findByMobile(profile.mobile)) {
      const error = new Error('Mobile number already exists');
      error.statusCode = 409;
      throw error;
    }

    const user = await UserRepository.create({
      ...profile,
      passwordHash: await bcryptjs.hash(crypto.randomBytes(32).toString('hex'), 10),
      googleId: claims.sub,
      googleEmail: claims.email.toLowerCase(),
      profilePicture: profile.profilePicture || claims.picture || null,
    });
    return { user, token: this.generateToken(user._id) };
  }
}

export default AuthService;
