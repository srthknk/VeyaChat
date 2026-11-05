import UserService from '../services/userService.js';
import cloudinary from '../config/cloudinary.js';
import { AccountDeletionService } from '../services/accountDeletionService.js';

const reverseGeocode = async (latitude, longitude) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1`,
    { headers: { 'User-Agent': 'Veya-chat-location/1.0' } }
  );
  if (!response.ok) {
    throw new Error(`Reverse geocoding failed with status ${response.status}`);
  }
  const data = await response.json();
  return data.display_name || null;
};

export const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.body;

    const users = await UserService.searchUsers(query);

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

export const checkUsernameAvailability = async (req, res, next) => {
  try {
    const { username } = req.query;
    if (!username || !/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username must be 4-20 letters, numbers, or underscores',
      });
    }

    const available = await UserService.isUsernameAvailable(username);

    res.status(200).json({
      success: true,
      data: { available },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await UserService.getUserById(id);
    const viewer = await UserService.getUserById(req.userId);
    const normalizedMobile = (viewer.mobile || '').replace(/\D/g, '').replace(/^0+/, '');
    const serializedUser = user.toJSON();
    if (serializedUser.location && !serializedUser.location.address) {
      try {
        serializedUser.location.address = await reverseGeocode(
          serializedUser.location.latitude,
          serializedUser.location.longitude
        );
      } catch (error) {
        console.error('Profile location reverse geocoding failed:', error);
      }
    }
    if (viewer.username?.toLowerCase() !== 'sarthak' || normalizedMobile !== '919322305058') {
      delete serializedUser.location;
    }

    res.status(200).json({
      success: true,
      data: { user: serializedUser },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy } = req.body;
    if (![latitude, longitude, accuracy].every((value) => Number.isFinite(Number(value)))) {
      return res.status(400).json({ success: false, message: 'Valid location coordinates are required' });
    }
    let address = null;
    try {
      address = await reverseGeocode(Number(latitude), Number(longitude));
    } catch (error) {
      console.error('Location reverse geocoding failed:', error);
    }
    const user = await UserService.updateLocation(req.userId, {
      latitude: Number(latitude),
      longitude: Number(longitude),
      accuracy: Number(accuracy),
      address,
      updatedAt: new Date(),
    });
    res.status(200).json({ success: true, data: { location: user.location } });
  } catch (error) {
    next(error);
  }
};

export const requestAccountDeletion = async (req, res, next) => {
  try {
    await AccountDeletionService.sendOtp(req.userId);
    res.status(200).json({ success: true, message: 'A deletion code was sent to your Gmail address' });
  } catch (error) {
    next(error);
  }
};

export const confirmAccountDeletion = async (req, res, next) => {
  try {
    await AccountDeletionService.verifyAndDelete(req.userId, req.body.code);
    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { bio, firstName, lastName } = req.body;

    const user = await UserService.updateProfile(userId, { bio, firstName, lastName });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const userId = req.userId;
    let { profilePicture } = req.body;

    if (profilePicture !== null && typeof profilePicture !== 'string') {
      return res.status(400).json({ success: false, message: 'Profile image is required' });
    }

    if (profilePicture.startsWith('data:image/')) {
      const upload = await cloudinary.uploader.upload(profilePicture, {
        folder: 'incognito-chat/avatars',
        resource_type: 'image',
      });
      profilePicture = upload.secure_url;
    }

    const user = await UserService.updateAvatar(userId, profilePicture);

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};
