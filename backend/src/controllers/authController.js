import AuthService from '../services/authService.js';
import UserService from '../services/userService.js';

export const register = async (req, res, next) => {
  try {
    const { username, mobile, password, firstName, lastName, bio, profilePicture } = req.body;

    const { user, token } = await AuthService.register(username, mobile, password, firstName, lastName, bio, profilePicture);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, mobile, identifier, password } = req.body;
    const usernameOrMobile = identifier || username || mobile;

    const { user, token } = await AuthService.login(usernameOrMobile, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const { user, token } = await AuthService.loginWithGoogle(credential);
    res.status(200).json({ success: true, message: 'Google login successful', data: { user: user.toJSON(), token } });
  } catch (error) {
    next(error);
  }
};

export const linkGoogleAccount = async (req, res, next) => {
  try {
    const user = await AuthService.linkGoogleAccount(req.userId, req.body.credential, req.body.email);
    res.status(200).json({ success: true, message: 'Google account linked successfully', data: { user: user.toJSON() } });
  } catch (error) {
    next(error);
  }
};

export const googleRegister = async (req, res, next) => {
  try {
    const { credential, username, mobile, firstName, lastName, bio } = req.body;
    const { user, token } = await AuthService.registerWithGoogle(credential, {
      username,
      mobile,
      firstName,
      lastName,
      bio,
    });
    res.status(201).json({ success: true, message: 'Google account registered successfully', data: { user: user.toJSON(), token } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Logout is handled on frontend (token removal)
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};
