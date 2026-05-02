import axiosInstance from './api/axiosInstance';

// Toggle this to true to force mock mode if your backend is not ready
const FORCE_MOCK = true;

export const authService = {
<<<<<<< HEAD
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
=======
  login: async (credentials) => {
    if (FORCE_MOCK) {
      return mockLogin(credentials);
    }
    
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.warn("Backend login failed, falling back to mock mode:", error.message);
      return mockLogin(credentials);
    }
  },

  signup: async (userData) => {
    if (FORCE_MOCK) {
      return { success: true, data: { message: "Mock registration successful" } };
    }
    const response = await axiosInstance.post('/auth/signup', userData);
    return response.data;
  },

  register: async (userData) => {
    if (FORCE_MOCK) {
      return { success: true, data: { message: "Mock registration successful" } };
    }
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
>>>>>>> ce7ad0561f56b64529f514d909b393c3232ee07b
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
