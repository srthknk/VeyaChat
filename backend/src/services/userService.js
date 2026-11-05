import { UserRepository } from '../repositories/userRepository.js';

export class UserService {
  static async getUserById(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  static async searchUsers(query) {
    const users = await UserRepository.search(query);
    return users;
  }

  static async isUsernameAvailable(username) {
    return UserRepository.isUsernameAvailable(username);
  }

  static async updateProfile(userId, updateData) {
    const profileUpdates = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    );
    const user = await UserRepository.update(userId, profileUpdates);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  static async updateAvatar(userId, profilePicture) {
    const user = await UserRepository.update(userId, { profilePicture });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  static async updateLocation(userId, location) {
    const user = await UserRepository.updateLocation(userId, location);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  static async updateOnlineStatus(userId, isOnline, socketId = null) {
    return await UserRepository.updateOnlineStatus(userId, isOnline, socketId);
  }

  static async getOnlineUserIds() {
    const users = await UserRepository.findOnlineUserIds();
    return users.map((user) => user._id.toString());
  }
}

export default UserService;
