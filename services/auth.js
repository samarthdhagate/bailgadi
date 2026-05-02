import axiosInstance from './api/axiosInstance';

// Toggle this to true to force mock mode if your backend is not ready
const FORCE_MOCK = true;

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
};

// Helper for Mock Login logic
async function mockLogin(credentials) {
  await new Promise(resolve => setTimeout(resolve, 800));
  const { email } = credentials;
  
  let role = 'customer';
  if (email.includes('organiser')) role = 'organiser';
  if (email.includes('admin')) role = 'admin';

  return {
    success: true,
    data: {
      access_token: 'mock-jwt-token-' + Math.random(),
      user: {
        id: 'mock-id',
        full_name: email.split('@')[0],
        email: email,
        role: role
      }
    }
  };
}
