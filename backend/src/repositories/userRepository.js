import User from '../models/User.js';

export class UserRepository {
  static async findById(userId) {
    return await User.findById(userId);
  }

  static async findByUsername(username) {
    return await User.findOne({ username: username.toLowerCase() });
  }

  static async findByGoogleId(googleId) {
    return await User.findOne({ googleId });
  }

  static async isUsernameAvailable(username) {
    const user = await User.exists({ username: username.toLowerCase() });
    return !user;
  }

  static async findByMobile(mobile) {
    return await User.findOne({ mobile });
  }

  static async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  static async update(userId, updateData) {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }

  static async updateLocation(userId, location) {
    return await User.findByIdAndUpdate(userId, { location }, { new: true });
  }

  static async search(query) {
    const searchQuery = query.toLowerCase();
    return await User.find({
      usernameLower: { $regex: searchQuery, $options: 'i' },
    }).select('_id username profilePicture bio isOnline lastSeen');
  }

  static async updateOnlineStatus(userId, isOnline, socketId = null) {
    const updateData = {
      isOnline,
      lastSeen: new Date(),
    };
    if (socketId) {
      updateData.socketId = socketId;
    }
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }

  static async findOnlineUserIds() {
    return await User.find({ isOnline: true }).select('_id').lean();
  }

  static async getWithPasswordHash(username) {
    return await User.findOne({ username: username.toLowerCase() }).select('+passwordHash');
  }

  static async getWithPasswordHashByMobile(mobile) {
    return await User.findOne({ mobile }).select('+passwordHash');
  }
}

export default UserRepository;
