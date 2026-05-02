import axiosInstance from './api/axiosInstance';

export const authService = {
  signup: async ({ full_name, email, password, role = 'customer' }) => {
    const response = await axiosInstance.post('/auth/signup', {
      full_name,
      email,
      password,
      role,
    });
    return response.data;
  },

  verifyOtp: async ({ email, otp }) => {
    const response = await axiosInstance.post('/auth/verify-otp', {
      email,
      otp,
    });
    return response.data;
  },

  login: async ({ email, password }) => {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  refresh: async () => {
    const response = await axiosInstance.post('/auth/refresh');
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async ({ email }) => {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  resetPassword: async ({ email, otp, new_password }) => {
    const response = await axiosInstance.post('/auth/reset-password', {
      email,
      otp,
      new_password,
    });
    return response.data;
  },
  
  googleLogin: async (token) => {
    const response = await axiosInstance.post('/auth/google', { token });
    return response.data;
  },

  getGoogleAuthUrl: async () => {
    const response = await axiosInstance.get('/auth/google');
    return response.data;
  },
};

