/**
 * Auth controller — thin layer between routes and auth service.
 */

const authService = require('../services/auth.service');

const signup = async (req, res, next) => {
  try {
    const { full_name, email, password, role } = req.body;
    const result = await authService.signup({ full_name, email, password, role });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOTP({ email, otp });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Don't send refresh_token in response body
    const { refresh_token, ...responseData } = result;

    res.json({ success: true, data: responseData });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const result = await authService.refresh(refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await authService.logout(req.user.user_id);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.json({ success: true, data: { message: 'Logged out successfully.' } });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword({ email });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, new_password } = req.body;
    const result = await authService.resetPassword({ email, otp, new_password });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  verifyOTP,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
