/**
 * Auth controller — thin layer between routes and auth service.
 */

const authService = require('../services/auth.service');
const googleAuthService = require('../services/googleAuth.service');
const { env } = require('../config/env');
const logger = require('../utils/logger');

const signup = async (req, res, next) => {
  try {
    const { full_name, email, password, role } = req.body;
    const result = await authService.signup({ full_name, email, password, role });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    logger.error('Signup error', { error: err.message, email: req.body.email });
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
      secure: env.NODE_ENV === 'production',
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
    if (req.user?.user_id) {
      await authService.logout(req.user.user_id);
    } else {
      await authService.logoutByRefreshToken(req.cookies.refreshToken);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
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

const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    const result = await authService.googleLogin(token);

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    const { refresh_token, ...responseData } = result;
    res.json({ success: true, data: responseData });
  } catch (err) {
    next(err);
  }
};

const initGoogleAuth = async (req, res, next) => {
  try {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'GOOGLE_OAUTH_NOT_CONFIGURED',
          message:
            'Google Sign-In is not configured on the server. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (and optionally GOOGLE_REDIRECT_URI) to the backend .env.',
        },
      });
    }

    const url = googleAuthService.getGoogleAuthUrl();
    res.json({ success: true, data: { url } });
  } catch (err) {
    next(err);
  }
};

const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=google_failed`);
    }
    const payload = await googleAuthService.getGoogleUserInfo(code);

    const result = await authService.googleLogin({
      email: payload.email,
      full_name: payload.name,
      google_id: payload.sub,
      picture: payload.picture
    });

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Redirect to frontend callback page
    // Access token is NOT sent in URL for security.
    // Frontend will use the refresh cookie to get a fresh access token.
    const frontendRedirectUrl = `${env.FRONTEND_URL}/auth/callback`;
    res.redirect(frontendRedirectUrl);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  verifyOTP,
  login,
  googleLogin,
  initGoogleAuth,
  googleCallback,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};


